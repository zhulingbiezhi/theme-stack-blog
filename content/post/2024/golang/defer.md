---
title: "【golang】defer详解"
date: "2022-04-01"
slug: "golang_defer_principle"
categories: 
    - golang
keywords:
    - golang
    - defer
    - 原理
    - 源码
image: "https://img.ququ123.top/img/042e751cd553ea535e94a95ad21386ec.jpeg"
---


[原文链接，转载请注明出处](https://www.ququ123.top/2024/03/ququ-blog)


特性
---------

我们简单的过一下 `defer` 关键字的基础使用，让大家先有一个基础的认知

### 延迟调用
```go
    func main() {
    	defer log.Println("EDDYCJY.")
    
    	log.Println("end.")
    }
```
输出结果：
```go
    $ go run main.go
    2019/05/19 21:15:02 end.
    2019/05/19 21:15:02 EDDYCJY.
```
### 后进先出
```go
    func main() {
    	for i := 0; i < 6; i++ {
    		defer log.Println("EDDYCJY" + strconv.Itoa(i) + ".")
    	}
    
    
    	log.Println("end.")
    }
```

输出结果：
```go
    $ go run main.go
    2019/05/19 21:19:17 end.
    2019/05/19 21:19:17 EDDYCJY5.
    2019/05/19 21:19:17 EDDYCJY4.
    2019/05/19 21:19:17 EDDYCJY3.
    2019/05/19 21:19:17 EDDYCJY2.
    2019/05/19 21:19:17 EDDYCJY1.
    2019/05/19 21:19:17 EDDYCJY0.
```

### 运行时间点
```go
    func main() {
    	func() {
    		 defer log.Println("defer.EDDYCJY.")
    	}()
    
    	log.Println("main.EDDYCJY.")
    }
```
输出结果：
```go
    $ go run main.go
    2019/05/22 23:30:27 defer.EDDYCJY.
    2019/05/22 23:30:27 main.EDDYCJY.
```
### 异常处理
```go
    func main() {
    	defer func() {
    		if e := recover(); e != nil {
    			log.Println("EDDYCJY.")
    		}
    	}()
    
    	panic("end.")
    }
```
输出结果：
```go
    $ go run main.go
    2019/05/20 22:22:57 EDDYCJY.
```
源码剖析
-------------
```go
    $ go tool compile -S main.go
    "".main STEXT size=163 args=0x0 locals=0x40
    	...
    	0x0059 00089 (main.go:6)	MOVQ	AX, 16(SP)
    	0x005e 00094 (main.go:6)	MOVQ	$1, 24(SP)
    	0x0067 00103 (main.go:6)	MOVQ	$1, 32(SP)
    	0x0070 00112 (main.go:6)	CALL	runtime.deferproc(SB)
    	0x0075 00117 (main.go:6)	TESTL	AX, AX
    	0x0077 00119 (main.go:6)	JNE	137
    	0x0079 00121 (main.go:7)	XCHGL	AX, AX
    	0x007a 00122 (main.go:7)	CALL	runtime.deferreturn(SB)
    	0x007f 00127 (main.go:7)	MOVQ	56(SP), BP
    	0x0084 00132 (main.go:7)	ADDQ	$64, SP
    	0x0088 00136 (main.go:7)	RET
    	0x0089 00137 (main.go:6)	XCHGL	AX, AX
    	0x008a 00138 (main.go:6)	CALL	runtime.deferreturn(SB)
    	0x008f 00143 (main.go:6)	MOVQ	56(SP), BP
    	0x0094 00148 (main.go:6)	ADDQ	$64, SP
    	0x0098 00152 (main.go:6)	RET
    	...
```

首先我们需要找到它，找到它实际对应什么执行代码。通过汇编代码，可得知涉及如下方法：

*   `runtime.deferproc`
*   `runtime.deferreturn`

很显然是运行时的方法，是对的。我们继续往下走看看都分别承担了什么行为

### 数据结构

在开始前我们需要先介绍一下 `defer` 的基础单元 `_defer` 结构体，如下：
```go
    type _defer struct {
    	siz     int32
    	started bool
    	sp      uintptr // sp at time of defer
    	pc      uintptr
    	fn      *funcval
    	_panic  *_panic // panic that is running defer
    	link    *_defer
    }
    
    ...
    type funcval struct {
    	fn uintptr
    	// variable-size, fn-specific data here
    }
```

*   siz：所有传入参数的总大小
*   started：该 `defer` 是否已经执行过
*   sp：函数栈指针寄存器，一般指向当前函数栈的栈顶
*   pc：程序计数器，有时称为指令指针(IP)，线程利用它来跟踪下一个要执行的指令。在大多数处理器中，PC 指向的是下一条指令，而不是当前指令
*   fn：指向传入的函数地址和参数
*   _panic：指向 `_panic` 链表
*   link：指向 `_defer` 链表

![image](https://img.ququ123.top/img/3dLNjJ.png)

### deferproc

预处理defer函数，存储到结构中，供后面调用

```go
    func deferproc(siz int32, fn *funcval) { // arguments of fn follow fn
        //获取当前goroutuine
        gp := getg()
        if gp.m.curg != gp {
            // go code on the system stack can't defer
            throw("defer on system stack")
        }
        // the arguments of fn are in a perilous state. The stack map
        // for deferproc does not describe them. So we can't let garbage
        // collection or stack copying trigger until we've copied them out
        // to somewhere safe. The memmove below does that.
        // Until the copy completes, we can only call nosplit routines.
        //上层函数的sp
        sp := getcallersp()
        //函数参数的地址获取
        argp := uintptr(unsafe.Pointer(&fn)) + unsafe.Sizeof(fn)
        //当前函数的pc
        callerpc := getcallerpc()
        //获取p中的缓存结构,复用，减少内存分配
        d := newdefer(siz)
        if d._panic != nil {
            throw("deferproc: d.panic != nil after newdefer")
        }
        //此处将defer结构指向g中已经存储的defer，并且赋值给当前的g，目的就是defer的先进后出
        d.link = gp._defer
        gp._defer = d
        d.fn = fn
        d.pc = callerpc
        d.sp = sp
        switch siz {
        case 0:
            // Do nothing.
        case sys.PtrSize:
            //指针，直接把defer末尾地址指针指向参数指针指向的内容
            *(*uintptr)(deferArgs(d)) = *(*uintptr)(unsafe.Pointer(argp))
        default:
            //非指针，把参数移植到defer末尾
            memmove(deferArgs(d), unsafe.Pointer(argp), uintptr(siz))
        }
        // deferproc returns 0 normally.
        // a deferred func that stops a panic
        // makes the deferproc return 1.
        // the code the compiler generates always
        // checks the return value and jumps to the
        // end of the function if deferproc returns != 0.
        return0()
        // No code can go here - the C return register has
        // been set and must not be clobbered.
    }
```


*   获取调用 `defer` 函数的函数栈指针、传入函数的参数具体地址以及 PC （程序计数器），也就是下一个要执行的指令。这些相当于是预备参数，便于后续的流转控制
*   创建一个新的 `defer` 最小单元 `_defer`，填入先前准备的参数
*   调用 `memmove` 将传入的参数存储到新 `_defer` （当前使用）中去，便于后续的使用
*   最后调用 `return0` 进行返回，这个函数非常重要。能够避免在 `deferproc` 中又因为返回 `return`，而诱发 `deferreturn` 方法的调用。其根本原因是一个停止 `panic` 的延迟方法会使 `deferproc` 返回 1，但在机制中如果 `deferproc` 返回不等于 0，将会总是检查返回值并跳转到函数的末尾。而 `return0` 返回的就是 0，因此可以防止重复调用

### 小结

在**这个函数中会为新的 `_defer` 设置一些基础属性，并将调用函数的参数集传入。最后通过特殊的返回方法结束函数调用**。另外这一块与先前 [《深入理解 Go panic and recover》](https://segmentfault.com/a/1190000019251478#articleHeader9) 的处理逻辑有一定关联性，其实就是 `gp.sched.ret` 返回 0 还是 1 会分流至不同处理方式

### newdefer
```go
    func newdefer(siz int32) *_defer {
    	var d *_defer
    	sc := deferclass(uintptr(siz))
    	gp := getg()
    	if sc < uintptr(len(p{}.deferpool)) {
    		pp := gp.m.p.ptr()
    		if len(pp.deferpool[sc]) == 0 && sched.deferpool[sc] != nil {
    			...
    			lock(&sched.deferlock)
    			d := sched.deferpool[sc]
    			unlock(&sched.deferlock)
    		}
    		...
    	}
    	if d == nil {
    		systemstack(func() {
    			total := roundupsize(totaldefersize(uintptr(siz)))
    			d = (*_defer)(mallocgc(total, deferType, true))
    		})
    		...
    	}
    	d.siz = siz
    	d.link = gp._defer
    	gp._defer = d
    	return d
    }
```
*   从池中获取可以使用的 `_defer`，则复用作为新的基础单元
*   若在池中没有获取到可用的，则调用 `mallocgc` 重新申请一个新的
*   设置 `defer` 的基础属性，最后修改当前 `Goroutine` 的 `_defer` 指向

通过这个方法我们可以注意到两点，如下：

*   `defer` 与 `Goroutine(g)` 有直接关系，所以讨论 `defer` 时基本离不开 `g` 的关联
*   新的 `defer` 总是会在现有的链表中的最前面，也就是 `defer` 的特性后进先出

### 小结

这个函数主要承担了获取新的 `_defer` 的作用，它有可能是从 `deferpool` 中获取的，也有可能是重新申请的

### deferreturn
```go
    func deferreturn(arg0 uintptr) {
    	gp := getg()
    	d := gp._defer
    	if d == nil {
    		return
    	}
    	sp := getcallersp()
    	if d.sp != sp {
    		return
    	}
    
    	switch d.siz {
    	case 0:
    		// Do nothing.
    	case sys.PtrSize:
    		*(*uintptr)(unsafe.Pointer(&arg0)) = *(*uintptr)(deferArgs(d))
    	default:
    		memmove(unsafe.Pointer(&arg0), deferArgs(d), uintptr(d.siz))
    	}
    	fn := d.fn
    	d.fn = nil
        //g的链表下一个，指向下一个defer
    	gp._defer = d.link
        //此处清空defer，放回对象池
    	freedefer(d)
        //
    	jmpdefer(fn, uintptr(unsafe.Pointer(&arg0)))
    }
```
如果在一个方法中调用过 `defer` 关键字，那么编译器将会在结尾处插入 `deferreturn` 方法的调用。而该方法中主要做了如下事项：

*   清空当前节点 `_defer` 被调用的函数调用信息
*   释放当前节点的 `_defer` 的存储信息并放回池中（便于复用）
*   跳转到调用 `defer` 关键字的调用函数处

在这段代码中，跳转方法 `jmpdefer` 格外重要。因为它显式的控制了流转，代码如下：
```go
    // asm_amd64.s
    TEXT runtime·jmpdefer(SB), NOSPLIT, $0-16
    	MOVQ	fv+0(FP), DX	// fn
    	MOVQ	argp+8(FP), BX	// caller sp
    	LEAQ	-8(BX), SP	// caller sp after CALL
    	MOVQ	-8(SP), BP	// restore BP as if deferreturn returned (harmless if framepointers not in use)
    	SUBQ	$5, (SP)	// return to CALL again
    	MOVQ	0(DX), BX
    	JMP	BX	// but first run the deferred function
```
通过源码的分析，我们发现它做了两个很 “奇怪” 又很重要的事，如下：

*   MOVQ -8(SP), BP：`-8(BX)` 这个位置保存的是 `deferreturn` 执行完毕后的地址
*   SUBQ $5, (SP)：`SP` 的地址减 5 ，其减掉的长度就恰好是 `runtime.deferreturn` 的长度

你可能会问，为什么是 5？好吧。翻了半天最后看了一下汇编代码…嗯，相减的确是 5 没毛病，如下：
```go
    	0x007a 00122 (main.go:7)	CALL	runtime.deferreturn(SB)
    	0x007f 00127 (main.go:7)	MOVQ	56(SP), BP
    

我们整理一下思绪，照上述逻辑的话，那 `deferreturn` 就是一个 “递归” 了哦。每次都会重新回到 `deferreturn` 函数，那它在什么时候才会结束呢，如下：
```go
    func deferreturn(arg0 uintptr) {
    	gp := getg()
    	d := gp._defer
    	if d == nil {
    		return
    	}
    	...
    }
```
也就是会不断地进入 `deferreturn` 函数，判断链表中是否还存着 `_defer`。若已经不存在了，则返回，结束掉它。简单来讲，就是处理完全部 `defer` 才允许你真的离开它。果真如此吗？我们再看看上面的汇编代码，如下：
```go
        。..
    	0x0070 00112 (main.go:6)	CALL	runtime.deferproc(SB)
    	0x0075 00117 (main.go:6)	TESTL	AX, AX
    	0x0077 00119 (main.go:6)	JNE	137
    	0x0079 00121 (main.go:7)	XCHGL	AX, AX
    	0x007a 00122 (main.go:7)	CALL	runtime.deferreturn(SB)
    	0x007f 00127 (main.go:7)	MOVQ	56(SP), BP
    	0x0084 00132 (main.go:7)	ADDQ	$64, SP
    	0x0088 00136 (main.go:7)	RET
    	0x0089 00137 (main.go:6)	XCHGL	AX, AX
    	0x008a 00138 (main.go:6)	CALL	runtime.deferreturn(SB)
    	...
```
的确如上述流程所分析一致，验证完毕

### 小结

这个函数主要承担了清空已使用的 `defer` 和跳转到调用 `defer` 关键字的函数处，非常重要

总结
---------

我们有提到 `defer` 关键字涉及两个核心的函数，分别是 `deferproc` 和 `deferreturn` 函数。而 `deferreturn` 函数比较特殊，是当应用函数调用 `defer` 关键字时，编译器会在其结尾处插入 `deferreturn` 的调用，它们俩一般都是成对出现的

但是当一个 `Goroutine` 上存在着多次 `defer` 行为（也就是多个 `_defer`）时，编译器会进行利用一些小技巧， 重新回到 `deferreturn` 函数去消耗 `_defer` 链表，直到一个不剩才允许真正的结束

而新增的基础单元 `_defer`，有可能是被复用的，也有可能是全新申请的。它最后都会被追加到 `_defer` 链表的表头，从而设定了后进先出的调用特性
