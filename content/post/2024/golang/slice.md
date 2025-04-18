---
title: "【golang】slice源码分析"
date: "2022-04-01"
slug: "golang_slice_principle"
categories: 
    - golang
keywords:
    - golang
    - slice
    - 原理
    - 源码
image: "https://img.ququ123.top/img/u=1266772566,2726106697&fm=253&fmt=auto&app=138&f=PNG?imageView2/2/w/900/h/480"
description: "slice是golang中一种非常重要的数据结构，本文将从源码的角度，分析slice的实现原理。"
---


[原文链接，转载请注明出处](https://www.ququ123.top/2024/03/ququ-blog)

```
    package main
    import (
      "fmt"
      "unsafe"
    )
    func main() {
      var a int
      var b int8
      var c int16
      var d int32
      var e int64
      slice := make([]int, 0)
      slice = append(slice, 1)
      fmt.Printf("int:%dnint8:%dnint16:%dnint32:%dnint64:%dn", unsafe.Sizeof(a), unsafe.Sizeof(b), unsafe.Sizeof(c), unsafe.Sizeof(d), unsafe.Sizeof(e))
      fmt.Printf("slice:%d", unsafe.Sizeof(slice))
    }
```
该程序输出golang中常用数据类型占多少byte，输出结果是：
```
    int:8
    int8:1
    int16:2
    int32:4
    int64:8
    slice:24
```
我们可以看到slice占24byte，为什么会占24byte，这就跟slice底层定义的结构有关，我们在golang的runtime/slice.go中可以找到slice的结构定义，如下：
```
    type slice struct {
      array unsafe.Pointer//指向底层数组的指针
      len   int//切片的长度
      cap   int//切片的容量
    }
```
我们可以看到slice中定义了三个变量，一个是指向底层数字的指针array，另外两个是切片的长度len和切片的容量cap。

### **slice初始化**

* * *

简单了解了slice的底层结构后，我们来看下slice的初始化，在golang中slice有多重初始化方式，在这里我们就不一一介绍了，我们主要关注slice在底层是如何初始化的，首先我们来看一段代码：
```
    package main
    import "fmt"
    func main() {
      slice := make([]int, 0)
      slice = append(slice, 1)
      fmt.Println(slice, len(slice), cap(slice))
    }
```
很简单的一段代码，make一个slice，往slice中append一个一个1，打印slice内容，长度和容量，接下来我们利用gotool提供的工具将以上代码反汇编：
```
    go tool compile -S slice.go
```
得到汇编代码如下（截取部分）：
```
    0x0000 00000 (slice.go:8)  TEXT  "".main(SB), ABIInternal, $152-0
      0x0000 00000 (slice.go:8)  MOVQ  (TLS), CX
      0x0009 00009 (slice.go:8)  LEAQ  -24(SP), AX
      0x000e 00014 (slice.go:8)  CMPQ  AX, 16(CX)
      0x0012 00018 (slice.go:8)  JLS  375
      0x0018 00024 (slice.go:8)  SUBQ  $152, SP
      0x001f 00031 (slice.go:8)  MOVQ  BP, 144(SP)
      0x0027 00039 (slice.go:8)  LEAQ  144(SP), BP
      0x002f 00047 (slice.go:8)  FUNCDATA  $0, gclocals- f14a5bc6d08bc46424827f54d2e3f8ed(SB)//编译器产生，用于保存一些垃圾收集相关的信息
      0x002f 00047 (slice.go:8)  FUNCDATA  $1, gclocals- 3e7bd269c75edba02eda3b9069a96409(SB)
      0x002f 00047 (slice.go:8)  FUNCDATA  $2, gclocals- f6aec3988379d2bd21c69c093370a150(SB)
      0x002f 00047 (slice.go:8)  FUNCDATA  $3, "".main.stkobj(SB)
      0x002f 00047 (slice.go:9)  PCDATA  $0, $1
      0x002f 00047 (slice.go:9)  PCDATA  $1, $0
      0x002f 00047 (slice.go:9)  LEAQ  type.int(SB), AX
      0x0036 00054 (slice.go:9)  PCDATA  $0, $0
      0x0036 00054 (slice.go:9)  MOVQ  AX, (SP)
      0x003a 00058 (slice.go:9)  XORPS  X0, X0
      0x003d 00061 (slice.go:9)  MOVUPS  X0, 8(SP)
      0x0042 00066 (slice.go:9)  CALL  runtime.makeslice(SB)//初始化slice
      0x0047 00071 (slice.go:9)  PCDATA  $0, $1
      0x0047 00071 (slice.go:9)  MOVQ  24(SP), AX
      0x004c 00076 (slice.go:10)  PCDATA  $0, $2
      0x004c 00076 (slice.go:10)  LEAQ  type.int(SB), CX
      0x0053 00083 (slice.go:10)  PCDATA  $0, $1
      0x0053 00083 (slice.go:10)  MOVQ  CX, (SP)
      0x0057 00087 (slice.go:10)  PCDATA  $0, $0
      0x0057 00087 (slice.go:10)  MOVQ  AX, 8(SP)
      0x005c 00092 (slice.go:10)  XORPS  X0, X0
      0x005f 00095 (slice.go:10)  MOVUPS  X0, 16(SP)
      0x0064 00100 (slice.go:10)  MOVQ  $1, 32(SP)
      0x006d 00109 (slice.go:10)  CALL  runtime.growslice(SB)//append操作
      0x0072 00114 (slice.go:10)  PCDATA  $0, $1
      0x0072 00114 (slice.go:10)  MOVQ  40(SP), AX
      0x0077 00119 (slice.go:10)  MOVQ  48(SP), CX
      0x007c 00124 (slice.go:10)  MOVQ  56(SP), DX
      0x0081 00129 (slice.go:10)  MOVQ  DX, "".slice.cap+72(SP)
      0x0086 00134 (slice.go:10)  MOVQ  $1, (AX)
      0x008d 00141 (slice.go:11)  PCDATA  $0, $0
      0x008d 00141 (slice.go:11)  MOVQ  AX, (SP)
      0x0091 00145 (slice.go:10)  LEAQ  1(CX), AX
      0x0095 00149 (slice.go:10)  MOVQ  AX, "".slice.len+64(SP)
      0x009a 00154 (slice.go:11)  MOVQ  AX, 8(SP)
      0x009f 00159 (slice.go:11)  MOVQ  DX, 16(SP)
      0x00a4 00164 (slice.go:11)  CALL  runtime.convTslice(SB)//类型转换
      0x00a9 00169 (slice.go:11)  PCDATA  $0, $1
      0x00a9 00169 (slice.go:11)  MOVQ  24(SP), AX
      0x00ae 00174 (slice.go:11)  PCDATA  $0, $0
      0x00ae 00174 (slice.go:11)  PCDATA  $1, $1
      0x00ae 00174 (slice.go:11)  MOVQ  AX, ""..autotmp_33+88(SP)
      0x00b3 00179 (slice.go:11)  MOVQ  "".slice.len+64(SP), CX
      0x00b8 00184 (slice.go:11)  MOVQ  CX, (SP)
      0x00bc 00188 (slice.go:11)  CALL  runtime.convT64(SB)
      0x00c1 00193 (slice.go:11)  PCDATA  $0, $1
      0x00c1 00193 (slice.go:11)  MOVQ  8(SP), AX
      0x00c6 00198 (slice.go:11)  PCDATA  $0, $0
      0x00c6 00198 (slice.go:11)  PCDATA  $1, $2
      0x00c6 00198 (slice.go:11)  MOVQ  AX, ""..autotmp_34+80(SP)
      0x00cb 00203 (slice.go:11)  MOVQ  "".slice.cap+72(SP), CX
      0x00d0 00208 (slice.go:11)  MOVQ  CX, (SP)
      0x00d4 00212 (slice.go:11)  CALL  runtime.convT64(SB)
      0x00d9 00217 (slice.go:11)  PCDATA  $0, $1
      0x00d9 00217 (slice.go:11)  MOVQ  8(SP), AX
      0x00de 00222 (slice.go:11)  PCDATA  $1, $3
      0x00de 00222 (slice.go:11)  XORPS  X0, X0
```
大家可能看到这里有点蒙，这是在干啥，其实我们只需要关注一些关键的信息就好了，主要是这几行：
```
    0x0042 00066 (slice.go:9)  CALL  runtime.makeslice(SB)//初始化slice
    0x006d 00109 (slice.go:10)  CALL  runtime.growslice(SB)//append操作
    0x00a4 00164 (slice.go:11)  CALL  runtime.convTslice(SB)//类型转换
    0x00bc 00188 (slice.go:11)  CALL  runtime.convT64(SB)
    0x00d4 00212 (slice.go:11)  CALL  runtime.convT64(SB)
```
我们能观察出，底层是调用runtime中的makeslice方法来创建slice的，我们来看一下makeslice函数到底做了什么。
```
    func makeslice(et *_type, len, cap int) unsafe.Pointer {
      mem, overflow := math.MulUintptr(et.size, uintptr(cap))
      if overflow || mem > maxAlloc || len < 0 || len > cap {
        // NOTE: Produce a 'len out of range' error instead of a
        // 'cap out of range' error when someone does make([]T, bignumber).
        // 'cap out of range' is true too, but since the cap is only being
        // supplied implicitly, saying len is clearer.
        // See golang.org/issue/4085.
        mem, overflow := math.MulUintptr(et.size, uintptr(len))
        if overflow || mem > maxAlloc || len < 0 {
          panicmakeslicelen()
        }
        panicmakeslicecap()
      }
    
      // Allocate an object of size bytes.
      // Small objects are allocated from the per-P cache's free lists.
      // Large objects (> 32 kB) are allocated straight from the heap.
      return mallocgc(mem, et, true)
    }
    func panicmakeslicelen() {
      panic(errorString("makeslice: len out of range"))
    }
    func panicmakeslicecap() {
      panic(errorString("makeslice: cap out of range"))
    }
```
MulUintptr函数源码：
```
    package math
    import "runtime/internal/sys"
    const MaxUintptr = ^uintptr(0)
    // MulUintptr returns a * b and whether the multiplication overflowed.
    // On supported platforms this is an intrinsic lowered by the compiler.
    func MulUintptr(a, b uintptr) (uintptr, bool) {
      if a|b < 1<<(4*sys.PtrSize) || a == 0 {//a|b < 1<<(4*8)
        return a * b, false
      }
      overflow := b > MaxUintptr/a
      return a * b, overflow
    }
```
简单来说，makeslice函数的工作主要就是计算slice所需内存大小，然后调用mallocgc进行内存的分配。计算slice所需内存又是通过MulUintptr来实现的，MulUintptr的源码我们也已经贴出，主要就是用切片中元素大小和切片的容量相乘计算出所需占用的内存空间，如果内存溢出，或者计算出的内存大小大于最大可分配内存，MulUintptr的overflow会返回true，makeslice就会报错。另外如果传入长度小于0或者长度小于容量，makeslice也会报错。

### **append操作**

```
    package main
    
    import (
       "fmt"
       "unsafe"
    )
    
    func main() {
       slice := make([]int, 0, 10)
       slice = append(slice, 1)
       fmt.Println(unsafe.Pointer(&slice[0]), len(slice), cap(slice))
       slice = append(slice, 2)
       fmt.Println(unsafe.Pointer(&slice[0]), len(slice), cap(slice))
    }
```
我们直接给出结果：
```
    0xc00009e000 1 10
    0xc00009e000 2 10
```
我们可以看到，当slice容量足够时，我们往slice中append一个2，slice底层数组指向的内存地址没有发生改变；再看一段程序：
```
    func main() {
       slice := make([]int, 0)
       slice = append(slice, 1)
       fmt.Printf("%p %d %dn", unsafe.Pointer(&slice[0]), len(slice), cap(slice))
       slice = append(slice, 2)
       fmt.Printf("%p %d %dn", unsafe.Pointer(&slice[0]), len(slice), cap(slice))
    }
```
输出结果是：
```
    0xc00009a008 1 1
    0xc00009a030  2 2
```
我们可以看到当往slice中append一个1后，slice底层数组的指针指向地址0xc00009a008，长度为1，容量为1。这时再往slice中append一个2，那么slice的容量不够了，此时底层数组会发生copy，会重新分配一块新的内存地址，容量也变成了2，所以我们会看到底层数组的指针指向地址发生了改变。根据之前汇编的结果我们知晓了，append操作其实是调用了runtime/slice.go中的growslice函数，我们来看下源码：
```
    func growslice(et *_type, old slice, cap int) slice {
      ...
      ...
      if cap < old.cap {
        panic(errorString("growslice: cap out of range"))
      }
      if et.size == 0 {
        // append should not create a slice with nil pointer but non-zero len.
        // We assume that append doesn't need to preserve old.array in this case.
        return slice{unsafe.Pointer(&zerobase), old.len, cap}
      }
      newcap := old.cap//1280
      doublecap := newcap + newcap//1280+1280=2560
      if cap > doublecap {
        newcap = cap
      } else {
        if old.len < 1024 {
          newcap = doublecap
        } else {
          // Check 0 < newcap to detect overflow
          // and prevent an infinite loop.
          for 0 < newcap && newcap < cap {
            newcap += newcap / 4//1280*1.25=1600
          }
          // Set newcap to the requested cap when
          // the newcap calculation overflowed.
          if newcap <= 0 {
            newcap = cap
          }
        }
      }
      ...
    }
```
我们主要关注下cap的扩容规则，从源码中我们可以简单的总结出slice容量的扩容规则：当原slice的cap小于1024时，新slice的cap变为原来的2倍；原slice的cap大于1024时，新slice变为原来的1.25倍，我们写个程序来验证下：
```
    package main
    import "fmt"
    func main() {
      slice := make([]int, 0)
      oldCap := cap(slice)
      for i := 0; i < 4096; i++ {
        slice = append(slice, i)
        newCap := cap(slice)
        if newCap != oldCap {
          fmt.Printf("oldCap = %-4d  after append %-4d  newCap = %-4dn", oldCap, i, newCap)
          oldCap = newCap
        }
      }
    }
```
这段程序实现的功能是：当cap发生改变时，打印出cap改变前后的值。我们来看程序的输出结果：
```
    oldCap = 0     after append 0     newCap = 1   
    oldCap = 1     after append 1     newCap = 2   
    oldCap = 2     after append 2     newCap = 4   
    oldCap = 4     after append 4     newCap = 8   
    oldCap = 8     after append 8     newCap = 16  
    oldCap = 16    after append 16    newCap = 32  
    oldCap = 32    after append 32    newCap = 64  
    oldCap = 64    after append 64    newCap = 128 
    oldCap = 128   after append 128   newCap = 256 
    oldCap = 256   after append 256   newCap = 512 
    oldCap = 512   after append 512   newCap = 1024
    oldCap = 1024  after append 1024  newCap = 1280
    oldCap = 1280  after append 1280  newCap = 1696
    oldCap = 1696  after append 1696  newCap = 2304
    oldCap = 2304  after append 2304  newCap = 3072
    oldCap = 3072  after append 3072  newCap = 4096
```
一开始的时候看起来跟我说的扩容规则是一样的，从1->2->4->8->16...->1024，都是成倍增长，当cap大于1024后，再append元素，cap变为1280，变成了1024的1.25倍，也符合我们的规则；但是继续append，1280->1696，似乎不是1.25倍，而是1.325倍，可见扩容规则并不是我们以上所说的那么简单，我们再继续往下看源码：
```
     var overflow bool
      var lenmem, newlenmem, capmem uintptr
      // Specialize for common values of et.size.
      // For 1 we don't need any division/multiplication.
      // For sys.PtrSize, compiler will optimize division/multiplication into a shift by a constant.
      // For powers of 2, use a variable shift.
      switch {
      case et.size == 1:
        lenmem = uintptr(old.len)
        newlenmem = uintptr(cap)
        capmem = roundupsize(uintptr(newcap))
        overflow = uintptr(newcap) > maxAlloc
        newcap = int(capmem)
      case et.size == sys.PtrSize:
        lenmem = uintptr(old.len) * sys.PtrSize
        newlenmem = uintptr(cap) * sys.PtrSize
        capmem = roundupsize(uintptr(newcap) * sys.PtrSize)//13568
        overflow = uintptr(newcap) > maxAlloc/sys.PtrSize
        newcap = int(capmem / sys.PtrSize)//13568/8=1696
      case isPowerOfTwo(et.size):
        var shift uintptr
        if sys.PtrSize == 8 {
          // Mask shift for better code generation.
          shift = uintptr(sys.Ctz64(uint64(et.size))) & 63
        } else {
          shift = uintptr(sys.Ctz32(uint32(et.size))) & 31
        }
        lenmem = uintptr(old.len) << shift
        newlenmem = uintptr(cap) << shift
        capmem = roundupsize(uintptr(newcap) << shift)
        overflow = uintptr(newcap) > (maxAlloc >> shift)
        newcap = int(capmem >> shift)
      default:
        lenmem = uintptr(old.len) * et.size
        newlenmem = uintptr(cap) * et.size
        capmem, overflow = math.MulUintptr(et.size, uintptr(newcap))
        capmem = roundupsize(capmem)
        newcap = int(capmem / et.size)
      }
```
我们看到每个case中都执行了roundupsize，我们再看下roundupsize的源码，如下：
```
    package runtime
    // Returns size of the memory block that mallocgc will allocate if you ask for the size.
    func roundupsize(size uintptr) uintptr {
      if size < _MaxSmallSize {//size=1600*8=12800<32768
        if size <= smallSizeMax-8 {//12800<=0
          return uintptr(class_to_size[size_to_class8[(size+smallSizeDiv-1)/smallSizeDiv]])
        } else {
          return uintptr(class_to_size[size_to_class128[(size-smallSizeMax+largeSizeDiv-1)/largeSizeDiv]])//size_to_class128[92]= 56
          //class_to_size[56]=13568
          //13568/8=1696
        }
      }
      if size+_PageSize < size {
        return size
      }
      return round(size, _PageSize)
    }
    const _MaxSmallSize   = 32768
    const  smallSizeDiv    = 8
    const  smallSizeMax    = 1024
    const largeSizeDiv    = 128
```
其实roundupsize是内存对齐的过程，我们知道golang中内存分配是根据对象大小来配不同的mspan，为了避免造成过多的内存碎片，slice在扩容中需要对扩容后的cap容量进行内存对齐的操作，接下来我们对照源码来实际计算下cap容量是否由1280变成了1696。

从以上流程图可以看出，cap在变成1600后又进入了内存对齐的过程，最终cap变为了1696。

### **slice截取**

* * *

go中的slice是支持截取操作的，虽然使用起来非常的方便，但是有很多坑，稍有不慎就会出现bug且不易排查。

让我们来看一段程序：
```
    package main
    
    import "fmt"
    
    func main() {
      slice := []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
      s1 := slice[2:5]
      s2 := s1[2:7]
      fmt.Printf("len=%-4d cap=%-4d slice=%-1v n", len(slice), cap(slice), slice)
      fmt.Printf("len=%-4d cap=%-4d s1=%-1v n", len(s1), cap(s1), s1)
      fmt.Printf("len=%-4d cap=%-4d s2=%-1v n", len(s2), cap(s2), s2)
    }
```
程序输出：
```
    len=10   cap=10   slice=[0 1 2 3 4 5 6 7 8 9] 
    len=3    cap=8    s1=[2 3 4] 
    len=5    cap=6    s2=[4 5 6 7 8]
```
s1的长度变成3，cap变为8（默认截取到最大容量）， 但是s2截取s1的第2到第7个元素，左闭右开，很多人想问，s1根本没有那么元素啊，但是实际情况是s2截取到了，并且没有发生数组越界，原因就是s2实际截取的是底层数组，目前slice、s1、s2都是共用的同一个底层数组。

我们继续操作：
```
    fmt.Println("--------append 100----------------")
    s2 = append(s2, 100)
```
输出结果是：
```
    --------append 100----------------
    len=10   cap=10   slice=[0 1 2 3 4 5 6 7 8 100] 
    len=3    cap=8    s1=[2 3 4] 
    len=6    cap=6    s2=[4 5 6 7 8 100]
```
我们看到往s2里append数据影响到了slice，正是因为两者底层数组是一样的；但是既然都是共用的同一底层数组，s1为什么没有100，这个问题再下一节会讲到，大家稍安勿躁。我们继续进行操作：
```
    fmt.Println("--------append 200----------------")
    s2 = append(s2, 200)
```
输出结果是：
```
    --------append 200----------------
    len=10   cap=10   slice=[0 1 2 3 4 5 6 7 8 100] 
    len=3    cap=8    s1=[2 3 4] 
    len=7    cap=12   s2=[4 5 6 7 8 100 200]
```
我们看到继续往s2中append一个200，但是只有s2发生了变化，slice并未改变，为什么呢？对，是因为在append完100后，s2的容量已满，再往s2中append，底层数组发生复制，系统分配了一块新的内存地址给s2，s2的容量也翻倍了。

我们继续操作：
```
    fmt.Println("--------modify s1----------------")
    s1[2] = 20
```
输出会是什么样呢？
```
    --------modify s1----------------
    len=10   cap=10   slice=[0 1 2 3 20 5 6 7 8 100] 
    len=3    cap=8    s1=[2 3 20] 
    len=7    cap=12   s2=[4 5 6 7 8 100 200]
```
这就很容易理解了，我们对s1进行更新，影响了slice，因为两者共用的还是同一底层数组，s2未发生改变是因为在上一步时底层数组已经发生了变化；

以此来看，slice截取的坑确实很多，极容易出现bug，并且难以排查，大家在使用的时候一定注意。

### **slice深拷贝**

* * *

上一节中对slice进行的截取，新的slice和原始slice共用同一个底层数组，因此可以看做是对slice的浅拷贝，那么在go中如何实现对slice的深拷贝呢？那么就要依赖golang提供的copy函数了，我们用一段程序来简单看下如何实现深拷贝：
```
    func main() {
    
      // Creating slices
      slice1 := []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
      var slice2 []int
      slice3 := make([]int, 5)
    
      // Before copying
      fmt.Println("------------before copy-------------")
      fmt.Printf("len=%-4d cap=%-4d slice1=%vn", len(slice1), cap(slice1), slice1)
      fmt.Printf("len=%-4d cap=%-4d slice2=%vn", len(slice2), cap(slice2), slice2)
      fmt.Printf("len=%-4d cap=%-4d slice3=%vn", len(slice3), cap(slice3), slice3)
    
    
      // Copying the slices
      copy_1 := copy(slice2, slice1)
      fmt.Println()
      fmt.Printf("len=%-4d cap=%-4d slice1=%vn", len(slice1), cap(slice1), slice1)
      fmt.Printf("len=%-4d cap=%-4d slice2=%vn", len(slice2), cap(slice2), slice2)
      fmt.Println("Total number of elements copied:", copy_1)
    }
```
首先定义了三个slice，然后将slice1 copy到slice2，我们来看下输出结果：
```
    ------------before copy-------------
    len=10   cap=10   slice1=[0 1 2 3 4 5 6 7 8 9]
    len=0    cap=0    slice2=[]
    len=5    cap=5    slice3=[0 0 0 0 0]
    
    len=10   cap=10   slice1=[0 1 2 3 4 5 6 7 8 9]
    len=0    cap=0    slice2=[]
    Total number of elements copied: 0
```
我们发现slice1的内容并未copy到slice2，为什么呢？我们再试下将slice1 copy到slice3，如下：
```
    copy_2 := copy(slice3, slice1)
```
输出结果：
```
    len=10   cap=10   slice1=[0 1 2 3 4 5 6 7 8 9]
    len=5    cap=5    slice3=[0 1 2 3 4]
    Total number of elements copied: 5
```
我们看到copy成功，slice3和slice2唯一的区别就是slice3的容量为5，而slice2容量为0，那么是否是深拷贝呢，我们修改slice3的内容看下：
```
    slice3[0] = 100
```
我们再看下输出结果：
```
    len=10   cap=10   slice1=[0 1 2 3 4 5 6 7 8 9]
    len=5    cap=5    slice3=[100 1 2 3 4]
```
我们可以看到修改slice3后，slice1的值并未改变，可见copy实现的是深拷贝。由此可见，copy函数为slice提供了深拷贝能力，但是需要在拷贝前申请内存空间。参照makeslice和growslice我们对本节一开始的程序进行反汇编，得到汇编代码（部分）如下：
```
    0x0080 00128 (slice.go:10)  CALL  runtime.makeslice(SB)
      0x0085 00133 (slice.go:10)  PCDATA  $0, $1
      0x0085 00133 (slice.go:10)  MOVQ  24(SP), AX
      0x008a 00138 (slice.go:10)  PCDATA  $1, $2
      0x008a 00138 (slice.go:10)  MOVQ  AX, ""..autotmp_75+96(SP)
      0x008f 00143 (slice.go:11)  PCDATA  $0, $4
      0x008f 00143 (slice.go:11)  MOVQ  ""..autotmp_74+104(SP), CX
      0x0094 00148 (slice.go:11)  CMPQ  AX, CX
      0x0097 00151 (slice.go:11)  JEQ  176
      0x0099 00153 (slice.go:11)  PCDATA  $0, $5
      0x0099 00153 (slice.go:11)  MOVQ  AX, (SP)
      0x009d 00157 (slice.go:11)  PCDATA  $0, $0
      0x009d 00157 (slice.go:11)  MOVQ  CX, 8(SP)
      0x00a2 00162 (slice.go:11)  MOVQ  $40, 16(SP)
      0x00ab 00171 (slice.go:11)  CALL  runtime.memmove(SB)
      0x00b0 00176 (slice.go:12)  MOVQ  $10, (SP)
      0x00b8 00184 (slice.go:12)  CALL  runtime.convT64(SB)
```
我们发现copy函数其实是调用runtime.memmove，其实我们在研究runtime/slice.go文件中的源码的时候，会发现有一个slicecopy函数，这个函数最终就是调用runtime.memmove来实现slice的copy的，我们看下源码：
```
    func slicecopy(to, fm slice, width uintptr) int {
      // 如果源切片或者目标切片有一个长度为0，那么就不需要拷贝，直接 return 
      if fm.len == 0 || to.len == 0 {
        return 0
      }
    
      // n 记录下源切片或者目标切片较短的那一个的长度
      n := fm.len
      if to.len < n {
        n = to.len
      }
    
      // 如果入参 width = 0，也不需要拷贝了，返回较短的切片的长度
      if width == 0 {
        return n
      }
    
      //如果开启竞争检测
      if raceenabled {
        callerpc := getcallerpc()
        pc := funcPC(slicecopy)
        racewriterangepc(to.array, uintptr(n*int(width)), callerpc, pc)
        racereadrangepc(fm.array, uintptr(n*int(width)), callerpc, pc)
      }
      if msanenabled {
        msanwrite(to.array, uintptr(n*int(width)))
        msanread(fm.array, uintptr(n*int(width)))
      }
    
      size := uintptr(n) * width
      if size == 1 { // common case worth about 2x to do here
        // TODO: is this still worth it with new memmove impl?
        //如果只有一个元素，那么直接进行地址转换
        *(*byte)(to.array) = *(*byte)(fm.array) // known to be a byte pointer
      } else {
        //如果不止一个元素，那么就从 fm.array 地址开始，拷贝到 to.array 地址之后，拷贝个数为size
        memmove(to.array, fm.array, size)
      }
      return n
    }
```
源码解读见中文注释。

### **值传递还是引用传递**

* * *

slice在作为函数参数进行传递的时候，是值传递还是引用传递，我们来看一段程序：
```
    package main
    
    import "fmt"
    
    func main() {
      slice := make([]int, 0, 10)
      slice = append(slice, 1)
      fmt.Println(slice, len(slice), cap(slice))
      fn(slice)
      fmt.Println(slice, len(slice), cap(slice))
    }
    func fn(in []int) {
      in = append(in, 5)
    }
```
很简单的一段程序，我们直接来看输出结果：
```
    [1] 1 10
    [1] 1 10
```
可见fn内的append操作并未对slice产生影响，那我们再看一段代码：
```
    package main
    
    import "fmt"
    
    func main() {
      slice := make([]int, 0, 10)
      slice = append(slice, 1)
      fmt.Println(slice, len(slice), cap(slice))
      fn(slice)
      fmt.Println(slice, len(slice), cap(slice))
    }
    func fn(in []int) {
      in[0] = 100
    }
```
输出是什么？我们来看下：
```
    [1] 1 10
    [100] 1 10
```
slice居然改变了，是不是有点混乱？前面我们说到slice底层其实是一个结构体，len、cap、array分别表示长度、容量、底层数组的地址，当slice作为函数的参数传递的时候，跟普通结构体的传递是没有区别的；如果直接传slice，实参slice是不会被函数中的操作改变的，但是如果传递的是slice的指针，是会改变原来的slice的；另外，无论是传递slice还是slice的指针，如果改变了slice的底层数组，那么都是会影响slice的，这种通过数组下标的方式更新slice数据，是会对底层数组进行改变的，所以就会影响slice。

那么，讲到这里，在第一段程序中在fn函数内append的5到哪里去了，不可能凭空消失啊，我们再来看一段程序：
```
    package main
    
    import "fmt"
    
    func main() {
      slice := make([]int, 0, 10)
      slice = append(slice, 1)
      fmt.Println(slice, len(slice), cap(slice))
      fn(slice)
      fmt.Println(slice, len(slice), cap(slice))
      s1 := slice[0:9]//数组截取
      fmt.Println(s1, len(s1), cap(s1))
    }
    func fn(in []int) {
      in = append(in, 5)
    }
```
我们来看输出结果：
```
    [1] 1 10
    [1] 1 10
    [1 5 0 0 0 0 0 0 0] 9 10
```
显然，虽然在append后，slice中并未展示出5，也无法通过slice[1]取到（会数组越界）,但是实际上底层数组已经有了5这个元素，但是由于slice的len未发生改变，所以我们在上层是无法获取到5这个元素的。那么，再问一个问题，我们是不是可以手动强制改变slice的len长度，让我们可以获取到5这个元素呢？是可以的，我们来看一段程序：
```
    package main
    
    import (
      "fmt"
      "reflect"
      "unsafe"
    )
    
    func main() {
      slice := make([]int, 0, 10)
      slice = append(slice, 1)
      fmt.Println(slice, len(slice), cap(slice))
      fn(slice)
      fmt.Println(slice, len(slice), cap(slice))
      (*reflect.SliceHeader)(unsafe.Pointer(&slice)).Len = 2 //强制修改slice长度
      fmt.Println(slice, len(slice), cap(slice))
    }
    
    func fn(in []int) {
      in = append(in, 5)
    }
```
我们来看输出结果：
```
    [1] 1 10
    [1] 1 10
    [1 5] 2 10
```
可以看出，通过强制修改slice的len，我们可以获取到了5这个元素。

所以再次回答一开始我们提出的问题，slice是值传递还是引用传递？答案是值传递！

以上，在使用golang中的slice的时候大家一定注意，否则稍有不慎就会出现bug。