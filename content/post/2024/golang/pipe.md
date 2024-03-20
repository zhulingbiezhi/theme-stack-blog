---
title: 【golang】pipe详解
date: 2024-03-20
image: https://img.ququ123.top/img/go-pipe.png
categories: 
    - golang
    - pipe
slug: golang-pipe
---


golang的io包中，稍微有点儿晦涩的就是Pipe方法，今天我们就一起来看一看这个Pipe。

函数定义如下：

## `func Pipe() (*PipeReader, *PipeWriter)`

它返回了一个Reader和一个Writer

起初一看是有点儿奇怪的，很少有这么用的哦，它到底能干嘛呢？  
其实它返回的不仅仅是简单的一个Writer一个Reader，它返回的是息息相关的一个Writer和一个Reader。  
下面我先用比较口语化的方式来讲一下它们是如何工作的。

#### 假设

先假设我们在工地上，有两个工人，一个叫w，一个叫r，w负责搬砖，而r负责砌墙。

#### 初始

w和r一起配合工作，一开始啥都没有，负责砌墙的r就没法工作，于是它开始睡觉(`Wait`)。而w只能去搬砖了。

#### 砖来了

w深知r懒惰的习性，当它把砖搬过来后，就把r叫醒(`Signal`)。然后w心想，反正你砌墙也要一会儿，那我也睡会儿。于是w叫醒r后它也开始睡觉(`Wait`)。

#### 砌墙

r被叫醒之后，心想着睡了这么久害怕被包工头责骂，自然就开始辛勤地砌墙了，很快就把w搬过来的砖用完了。r心想，这墙砌不完可怪不到我头上，因为没砖了，于是r叫醒了w，然后自己又去睡觉了。

#### 继续搬砖

w被叫醒后一看，哎哟我去，这么快就没砖了？然后他又跑去搬了些转过来，然后叫醒睡得跟死猪一样的r起来砌墙，自己又开始睡觉……

#### 周而复始，直到……

w和r两人就这么周而复始地配合，直到r发现墙砌好了，或者w发现工地上已经没有砖了。

* * *

以上大概就是Pipe的通俗的解释。不过问题也来了，这俩人瞌睡怎么这么多呢？w干活r就歇着，不能同时干吗？答案是——不能  
为什么？因为Pipe就是为了某些特定场景而提出的。看看官方文档的说明：

> Reads and Writes on the pipe are matched one to one except when multiple Reads are needed to consume a single Write

也就是说，Pipe适用于，产生了一条数据，紧接着就要处理掉这条数据的场景。而且因为其内部是一把大锁，因此是线程安全的。

### 内部实现

来看看内部实现，先看看read

```go
func (p *pipe) read(b []byte) (n int, err error) {
    // One reader at a time.
    p.rl.Lock()
    defer p.rl.Unlock()

    p.l.Lock()
    defer p.l.Unlock()
    for {
        if p.rerr != nil {
            return 0, ErrClosedPipe
        }
        if p.data != nil {
            break
        }
        if p.werr != nil {
            return 0, p.werr
        }
        p.rwait.Wait()
    }
    n = copy(b, p.data)
    p.data = p.data[n:]
    if len(p.data) == 0 {
        p.data = nil
        p.wwait.Signal()
    }
    return
}
```

这段代码，我用伪代码简化一下：

```go
func (p *pipe) read(b []byte) (n int, err error) {
    各种加锁()
    for {
        if 有数据可以读或者哪里有错 {
           break
        } 
        让出时间片等待被唤醒，如果是被正常调度回来的依然不醒，必须是被指名点姓叫醒才醒()
    }
    copy(b, p.data)
    通知writer可以继续写数据进来了()
}
```

write其实也是大同小异：

```go
func (p *pipe) write(b []byte) (n int, err error) {
  各种加锁()
  p.data = b
  通知reader有数据了()
  for {
    if 数据被读完了或者哪里有错 {
      break
    }
    让出时间片等待被唤醒，如果是被正常调度回来的依然不醒，必须是被指名点姓叫醒才醒()
  }
  p.data = nil
}
```

看了伪代码，再看看实际代码，应该就很容易了。但是还有几个地方需要细说，第一个就是锁的问题。

在read中：

```go
func (p *pipe) read(b []byte) (n int, err error) {
    // One reader at a time.
    p.rl.Lock()
    defer p.rl.Unlock()

    p.l.Lock()
    defer p.l.Unlock()
        // ...
```

而在write中：

```go
func (p *pipe) write(b []byte) (n int, err error) {
    // pipe uses nil to mean not available
    if b == nil {
        b = zero[:]
    }

    // One writer at a time.
    p.wl.Lock()
    defer p.wl.Unlock()

    p.l.Lock()
    defer p.l.Unlock()
    if p.werr != nil {
        err = ErrClosedPipe
        return
    }
        // ...
```

可能你注意到了，read和write都会去取同一把锁`p.l`。  
假设我们writer和reader在两个不同的goroutine中执行，并且write先执行，那么依照上面的代码，write会先拿锁，当执行完

```auto
p.data = b
```

之后会通知reader，然后自己进入一个死循环里进行Wait，直到reader把p.data读完。但是问题来了，writer进入死循环时并没有释放锁`p.l`，然后reader一直等待p.l释放然后去读取数据，而writer一直在等reader读取完数据才能跳出去释放锁。看起来这是一个死锁？  
我只能说“Naive”，官方标准库怎么会犯这么低级的错误呢？但是代码就这样，该如何解释？  
其实，关键在于那个`sync.Cond`

```go
type pipe struct {
    rl    sync.Mutex // gates readers one at a time
    wl    sync.Mutex // gates writers one at a time
    l     sync.Mutex // protects remaining fields
    data  []byte     // data remaining in pending write
    rwait sync.Cond  // waiting reader
    wwait sync.Cond  // waiting writer
    rerr  error      // if reader closed, error to give writes
    werr  error      // if writer closed, error to give reads
}
```

rwait和wwait都是`sync.Cond`，这是什么东东呢？  
看下它的文档：

```go
// Cond implements a condition variable, a rendezvous point
// for goroutines waiting for or announcing the occurrence
// of an event.
//
// Each Cond has an associated Locker L (often a *Mutex or *RWMutex),
// which must be held when changing the condition and
// when calling the Wait method.
//
// A Cond can be created as part of other structures.
// A Cond must not be copied after first use.
type Cond struct {
    noCopy noCopy

    // L is held while observing or changing the condition
    L Locker

    notify  notifyList
    checker copyChecker
}
```

Cond如果要细说的话，又得写另一篇文章了。在这里你只要知道sync.Cond其内部依赖于一个Locker。  
而且在初始化时：

```auto
func Pipe() (*PipeReader, *PipeWriter) {
    p := new(pipe)
    p.rwait.L = &p.l
    p.wwait.L = &p.l
    r := &PipeReader{p}
    w := &PipeWriter{p}
    return r, w
}
```

可以看到rwait和wwait都是依赖于用一把锁，而且这把锁就是p.l。可能有点儿绕，其实就是：

+   `p.l.Lock()`
+   `p.rwait.Wait()`
+   `p.wwait.Wait()`  
    都是依赖于同一把锁。这有什么玄机吗？——有的！  
    如前所述，当writer拿到锁`p.l`，然后开始在死循环中`p.wwait.Wait()`等着reader读完数据时，表面上看起来p.l锁没有被释放，会发生死锁。但是，玄机就在`p.wwait.Wait`上。  
    不卖关子了，`p.wwait.Wait`被调用时，会在内部释放锁，而由于p.l和p.wwait.L是同一把锁，因此reader进去时是可以获取到锁的。

```auto
func (c *Cond) Wait() {
    c.checker.check()
    t := runtime_notifyListAdd(&c.notify)
    c.L.Unlock()
    runtime_notifyListWait(&c.notify, t)
    c.L.Lock()
}
```

Cond这个东西，要说起来比较复杂，它涉及到runtime，下次会写一篇文章具体讲讲。本文主要是讲Pipe，所以就不扩展了。

### 例子

Pipe的使用场景，我觉得极少数场景可能才会需要用到，我目前没有想到非常需要Pipe的场景。因为每次Read需要等Write写完，是串行的场景。不过Pipe的好处是，由于它把Write的slice放到p.data中，这是一次引用赋值。之后Read时，把p.data copy出去，本质上相当于copy了write的原始数据，并没有用临时slice存储，减少了内存使用量。  
我感觉也就那么回事儿吧，为此你不得不再开个goroutine，gotoutine虽然轻量级，但也不是没有开销，当然它的开销和分配内存比就小巫见大巫了。我个人感觉，如果你的应用没有对内存要求严苛到这种级别，Pipe也没什么卵用。  
如果你发现了Pipe比较合适的场景，非常希望告诉我！  
下面给出一个强行使用Pipe的代码：起了多个goroutine作为writer，每个writer内部随机生成字符串写进去。唯一的reader读取数据并打印：

```go
var r = rand.New(rand.NewSource(time.Now().UnixNano()))

func generate(writer *PipeWriter) {
    arr := make([]byte, 32)
    for {
        for i := 0; i < 32; i++ {
            arr[i] = byte(r.Uint32() >> 24)
        }
        n, err := writer.Write(arr)
        if nil != err {
            log.Fatal(err)
        }
        time.Sleep(200 * time.Millisecond)
    }
}

func main() {
    rp, wp := Pipe()
    for i := 0; i < 20; i++ {
        go generate(wp)
    }
    time.Sleep(1 * time.Second)
    data := make([]byte, 64)
    for {
        n, err := rp.Read(data)
        if nil != err {
            log.Fatal(err)
        }
        if 0 != n {
            log.Println("main loop", n, string(data))
        }
        time.Sleep(1 * time.Second)
    }
}
```

 