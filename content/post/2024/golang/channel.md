---
title: 【golang】channel详解
date: 2022-04-01
image: https://img.ququ123.top/img/u=2104548819,3267708629&fm=253&fmt=auto&app=138&f=JPG?imageView2/2/w/900/h/480
categories: 
    - golang
keywords:
    - golang
    - channel
    - 原理
    - 源码
slug: golang_channel_principle
description: channel一个类型管道，通过它可以在goroutine之间发送和接收消息。它是Golang在语言层面提供的goroutine间的通信方式。众所周知，Go依赖于称为CSP（Communicating Sequential Processes）的并发模型，通过Channel实现这种同步模式。Go并发的核心哲学是不要通过共享内存进行通信; 相反，通过沟通分享记忆。
---
[原文链接，转载请注明出处](https://www.ququ123.top/2024/03/ququ-blog)

channel一个类型管道，通过它可以在goroutine之间发送和接收消息。它是Golang在语言层面提供的goroutine间的通信方式。

众所周知，Go依赖于称为CSP（Communicating Sequential Processes）的并发模型，通过Channel实现这种同步模式。Go并发的核心哲学是不要通过共享内存进行通信; 相反，通过沟通分享记忆。

下面以简单的示例来演示Go如何通过channel来实现通信。
```go
    package main
    import (
        "fmt"
        "time"
    )
    func goRoutineA(a <-chan int) {
        val := <-a
        fmt.Println("goRoutineA received the data", val)
    }
    func goRoutineB(b chan int) {
        val := <-b
        fmt.Println("goRoutineB  received the data", val)
    }
    func main() {
        ch := make(chan int, 3)
        go goRoutineA(ch)
        go goRoutineB(ch)
        ch <- 3
        time.Sleep(time.Second * 1)
    }
```
结果为：

goRoutineA received the data 3

上面只是个简单的例子，只输出goRoutineA ，没有执行goRoutineB，说明channel每次读写，仅允许被一个goroutine读写。

接下来我们通过源代码分析程序执行过程，在讲之前，如果不了解go 并发和调度相关知识。
请阅读这篇文章 
[Go goroutine理解](https://github.com/guyan0319/golang_development_notes/blob/master/zh/9.5.md)

说道channel这里不得不提通道的结构hchan。

### hchan

源代码在src/runtime/chan.go
```go
    type hchan struct {
       qcount   uint           // total data in the queue
       dataqsiz uint           // size of the circular queue
       buf      unsafe.Pointer // points to an array of dataqsiz elements
       elemsize uint16
       closed   uint32
       elemtype *_type // element type
       sendx    uint   // send index
       recvx    uint   // receive index
       recvq    waitq  // list of recv waiters
       sendq    waitq  // list of send waiters
    
       // lock protects all fields in hchan, as well as several
       // fields in sudogs blocked on this channel.
       //
       // Do not change another G's status while holding this lock
       // (in particular, do not ready a G), as this can deadlock
       // with stack shrinking.
       lock mutex
    }
    type waitq struct {
        first *sudog
        last  *sudog
    }
```
说明：

**qcount** uint // 当前队列中剩余元素个数  
**dataqsiz** uint // 环形队列长度，即缓冲区的大小，即make（chan T，N），N.  
**buf** unsafe.Pointer // 环形队列指针  
**elemsize** uint16 // 每个元素的大小  
**closed** uint32 // 表示当前通道是否处于关闭状态。创建通道后，该字段设置为0，即通道打开; 通过调用close将其设置为1，通道关闭。  
**elemtype** \*\_type // 元素类型，用于数据传递过程中的赋值；  
**sendx** uint和**recvx** uint是环形缓冲区的状态字段，它指示缓冲区的当前索引 - 支持数组，它可以从中发送数据和接收数据。  
**recvq** waitq // 等待读消息的goroutine队列  
**sendq** waitq // 等待写消息的goroutine队列  
**lock** mutex // 互斥锁，为每个读写操作锁定通道，因为发送和接收必须是互斥操作。

这里**sudog代表goroutine。**

创建channel 有两种，一种是带缓冲的channel，一种是不带缓冲的channel
```go
    // 带缓冲
    ch := make(chan Task, 3)
    // 不带缓冲
    ch := make(chan int)
```
这里我们先讨论带缓冲
```go
    ch := make(chan int, 3)
```
创建通道后的缓冲通道结构
```go
    hchan struct {
        qcount uint : 0 
        dataqsiz uint : 3 
        buf unsafe.Pointer : 0xc00007e0e0 
        elemsize uint16 : 8 
        closed uint32 : 0 
        elemtype *runtime._type : &{
            size:8 
            ptrdata:0 
            hash:4149441018 
            tflag:7 
            align:8 
            fieldalign:8 
            kind:130 
            alg:0x55cdf0 
            gcdata:0x4d61b4 
            str:1055 
            ptrToThis:45152
            }
        sendx uint : 0 
        recvx uint : 0 
        recvq runtime.waitq : 
            {first:<nil> last:<nil>}
        sendq runtime.waitq : 
            {first:<nil> last:<nil>}
        lock runtime.mutex : 
            {key:0}
    }
```
源代码
```go
    func makechan(t *chantype, size int) *hchan {
    
       elem := t.elem
       ...
    }
```
如果我们创建一个带buffer的channel，底层的数据模型如下图：

![img](https://img.ququ123.top/img/1460000019204881)

### 向channel写入数据
```go
    ch <- 3
```
底层hchan数据流程如图

![img](https://img.ququ123.top/img/1460000019204882)

![img](https://img.ququ123.top/img/1460000019204883)

发送操作概要

1、锁定整个通道结构。

2、确定写入。尝试`recvq`从等待队列中等待goroutine，然后将元素直接写入goroutine。

3、如果recvq为Empty，则确定缓冲区是否可用。如果可用，从当前goroutine复制数据到缓冲区。

4、如果缓冲区已满，**则要**写入的元素将保存在当前正在执行的goroutine的结构中，并且当前goroutine将在**sendq中**排队并从运行时挂起。

5、写入完成释放锁。

这里我们要注意几个属性buf、sendx、lock的变化。

流程图

![img](https://img.ququ123.top/img/1460000019204884)

### 从channel读取操作

几乎和写入操作相同

代码
```go
    func goRoutineA(a <-chan int) {
       val := <-a
       fmt.Println("goRoutineA received the data", val)
    }
```
底层hchan数据流程如图

![img](https://img.ququ123.top/img/1460000019204885)

![img](https://img.ququ123.top/img/1460000019204886)

这里我们要注意几个属性buf、sendx、recvx、lock的变化。

读取操作概要

1、先获取channel全局锁

2、尝试sendq从等待队列中获取等待的goroutine，

3、 如有等待的goroutine，没有缓冲区，取出goroutine并读取数据，然后唤醒这个goroutine，结束读取释放锁。

4、如有等待的goroutine，且有缓冲区（此时缓冲区已满），从缓冲区队首取出数据，再从sendq取出一个goroutine，将goroutine中的数据存入buf队尾，结束读取释放锁。

5、如没有等待的goroutine，且缓冲区有数据，直接读取缓冲区数据，结束读取释放锁。

6、如没有等待的goroutine，且没有缓冲区或缓冲区为空，将当前的goroutine加入**recvq**排队，进入睡眠，等待被写goroutine唤醒。结束读取释放锁。

流程图

![img](https://img.ququ123.top/img/1460000019204887)

### recvq和sendq 结构

recvq和sendq基本上是链表，看起来基本如下

![img](https://img.ququ123.top/img/1460000019204888)

### select

select就是用来监听和channel有关的IO操作，当 IO 操作发生时，触发相应的动作。

一个简单的示例如下
```go
    package main
    
    import (
       "fmt"
       "time"
    )
    
    func goRoutineD(ch chan int, i int) {
       time.Sleep(time.Second * 3)
       ch <- i
    }
    func goRoutineE(chs chan string, i string) {
       time.Sleep(time.Second * 3)
       chs <- i
    
    }
    
    func main() {
       ch := make(chan int, 5)
       chs := make(chan string, 5)
    
       go goRoutineD(ch, 5)
       go goRoutineE(chs, "ok")
    
        select {
        case msg := <-ch:
            fmt.Println(" received the data ", msg)
        case msgs := <-chs:
            fmt.Println(" received the data ", msgs)
        default:
            fmt.Println("no data received ")
            time.Sleep(time.Second * 1)
        }
    
    
    }
```
运行程序，因为当前时间没有到3s，所以select 选择defult

no data received

修改程序，我们注释掉default，并多执行几次结果为

received the data 5

received the data ok

received the data ok

received the data ok

select语句会阻塞，直到监测到一个可以执行的IO操作为止，而这里goRoutineD和goRoutineE睡眠时间是相同的，都是3s，从输出可看出，从channel中读出数据的顺序是随机的。

再修改代码，goRoutineD睡眠时间改成4s
```go
    func goRoutineD(ch chan int, i int) {
       time.Sleep(time.Second * 4)
       ch <- i
    }
```
此时会先执行goRoutineE，select 选择case msgs := <-chs。

### range

可以持续从channel读取数据，一直到channel被关闭，当channel中没有数据时会阻塞当前goroutine，与读channel时阻塞处理机制一样。
```go
    package main
    
    import (
       "fmt"
       "time"
    )
    
    func goRoutineD(ch chan int, i int) {
       for   i := 1; i <= 5; i++{
          ch <- i
       }
    
    }
    func chanRange(chanName chan int) {
       for e := range chanName {
          fmt.Printf("Get element from chan: %d\n", e)
          if len(chanName) <= 0 { // 如果现有数据量为0，跳出循环
                break
          }
       }
    }
    func main() {
       ch := make(chan int, 5)
       go goRoutineD(ch, 5)
       chanRange(ch)
    
    }
```
结果：  
Get element from chan: 1  
Get element from chan: 2  
Get element from chan: 3  
Get element from chan: 4  
Get element from chan: 5

### 死锁（deadlock）

指两个或两个以上的协程的执行过程中，由于竞争资源或由于彼此通信而造成的一种阻塞的现象。

在非缓冲信道若发生只流入不流出，或只流出不流入，就会发生死锁。

下面是一些死锁的例子

1、
```go
    package main
    
    func main() {
       ch := make(chan int)
       ch <- 3
    }
```
上面情况，向非缓冲通道写数据会发生阻塞，导致死锁。解决办法创建缓冲区 ch := make(chan int，3)

2、
```go
    package main
    
    import (
       "fmt"
    )
    
    func main() {
       ch := make(chan int)
       fmt.Println(<-ch)
    }
```
向非缓冲通道读取数据会发生阻塞，导致死锁。 解决办法开启缓冲区，先向channel写入数据。

3、
```go
    package main
    
    func main() {
       ch := make(chan int, 3)
       ch <- 3
       ch <- 4
       ch <- 5
       ch <- 6
    }
```
写入数据超过缓冲区数量也会发生死锁。解决办法将写入数据取走。

死锁的情况有很多这里不再赘述。  
还有一种情况，向关闭的channel写入数据，不会产生死锁，产生panic。
```go
    package main
    
    func main() {
        ch := make(chan int, 3)
        ch <- 1
        close(ch)
        ch <- 2
    }
```
解决办法别向关闭的channel写入数据。

参考：

[https://codeburst.io/diving-d...](https://codeburst.io/diving-deep-into-the-golang-channels-549fd4ed21a8)

[https://speakerdeck.com/kavya...](https://speakerdeck.com/kavya719/understanding-channels?slide=14)

[https://my.oschina.net/renhc/...](https://my.oschina.net/renhc/blog/2246871)
