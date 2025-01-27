---
title: "【golang】Mutex原理"
date: "2022-04-01"
slug: "golang_sync_mutex_principle"
categories: 
    - golang
keywords:
    - golang
    - mutex
    - 原理
    - 源码
image: "https://img.ququ123.top/img/u=2002782107,3956577129&fm=253&fmt=auto&app=138&f=PNG?imageView2/2/w/900/h/480"
description: "本文深入解析了Golang中sync.Mutex的原理与实现，详细介绍了Mutex的数据结构、状态机、锁的获取与释放过程，以及正常模式和饥饿模式的区别。通过源码分析，帮助读者理解Mutex如何保证并发安全与公平性。"
---


[原文链接，转载请注明出处](https://www.ququ123.top/2024/03/ququ-blog)

sync.Mutex是一个不可重入的排他锁。 这点和Java不同，golang里面的排它锁是不可重入的。

当一个 goroutine 获得了这个锁的拥有权后， 其它请求锁的 goroutine 就会阻塞在 Lock 方法的调用上，直到锁被释放。

数据结构与状态机
------

sync.Mutex 由两个字段 state 和 sema 组成。其中 state 表示当前互斥锁的状态，而 sema 是用于控制锁状态的信号量。
```go
    type Mutex struct {
    	state int32
    	sema  uint32
    }
```
需要强调的是Mutex一旦使用之后，一定不要做copy操作。

Mutex的状态机比较复杂，使用一个int32来表示：
```go
    const (
    	mutexLocked = 1 << iota // mutex is locked
    	mutexWoken  //2
    	mutexStarving //4
    	mutexWaiterShift = iota //3
    )
                                                                                                 
    32                                               3             2             1             0 
     |                                               |             |             |             | 
     |                                               |             |             |             | 
     v-----------------------------------------------v-------------v-------------v-------------+ 
     |                                               |             |             |             v 
     |                 waitersCount                  |mutexStarving| mutexWoken  | mutexLocked | 
     |                                               |             |             |             | 
     +-----------------------------------------------+-------------+-------------+-------------+                                                                                                              
```

最低三位分别表示 mutexLocked、mutexWoken 和 mutexStarving，剩下的位置用来表示当前有多少个 Goroutine 等待互斥锁的释放：

在默认情况下，互斥锁的所有状态位都是 0，int32 中的不同位分别表示了不同的状态：

*   mutexLocked — 表示互斥锁的锁定状态；
*   mutexWoken — 表示从正常模式被从唤醒；
*   mutexStarving — 当前的互斥锁进入饥饿状态；
*   waitersCount — 当前互斥锁上等待的 goroutine 个数；

为了保证锁的公平性，设计上互斥锁有两种状态：正常状态和饥饿状态。

`正常模式`下，所有等待锁的goroutine按照FIFO顺序等待。唤醒的goroutine不会直接拥有锁，而是会和新请求锁的goroutine竞争锁的拥有。新请求锁的goroutine具有优势：它正在CPU上执行，而且可能有好几个，所以刚刚唤醒的goroutine有很大可能在锁竞争中失败。在这种情况下，这个被唤醒的goroutine会加入到等待队列的前面。 `如果一个等待的goroutine超过1ms没有获取锁，那么它将会把锁转变为饥饿模式`。

`饥饿模式`下，锁的所有权将从unlock的gorutine直接交给交给等待队列中的第一个。新来的goroutine将不会尝试去获得锁，即使锁看起来是unlock状态, 也不会去尝试自旋操作，而是放在等待队列的尾部。

如果一个等待的goroutine获取了锁，并且满足一以下其中的任何一个条件：(1)它是队列中的最后一个；(2)它等待的时候小于1ms。它会将锁的状态转换为正常状态。

正常状态有很好的性能表现，饥饿模式也是非常重要的，因为它能阻止尾部延迟的现象。

Lock
------

```go
    func (m *Mutex) Lock() {
    	// 如果mutex的state没有被锁，也没有等待/唤醒的goroutine, 锁处于正常状态，那么获得锁，返回.
        // 比如锁第一次被goroutine请求时，就是这种状态。或者锁处于空闲的时候，也是这种状态。
    	if atomic.CompareAndSwapInt32(&m.state, 0, mutexLocked) {
    		return
    	}
    	// Slow path (outlined so that the fast path can be inlined)
    	m.lockSlow()
    }
    
    func (m *Mutex) lockSlow() {
    	// 标记本goroutine的等待时间
    	var waitStartTime int64
    	// 本goroutine是否已经处于饥饿状态
    	starving := false
    	// 本goroutine是否已唤醒
    	awoke := false
    	// 自旋次数
    	iter := 0
    	old := m.state
    	for {
    		// 第一个条件：1.mutex已经被锁了；2.不处于饥饿模式(如果时饥饿状态，自旋时没有用的，锁的拥有权直接交给了等待队列的第一个。)
    		// 尝试自旋的条件：参考runtime_canSpin函数
    		if old&(mutexLocked|mutexStarving) == mutexLocked && runtime_canSpin(iter) {
    			// 进入这里肯定是普通模式
    			// 自旋的过程中如果发现state还没有设置woken标识，则设置它的woken标识， 并标记自己为被唤醒。
    			if !awoke && old&mutexWoken == 0 && old>>mutexWaiterShift != 0 &&
    				atomic.CompareAndSwapInt32(&m.state, old, old|mutexWoken) {
    				awoke = true
    			}
    			runtime_doSpin()
    			iter++
    			old = m.state
    			continue
    		}
    		
    		// 到了这一步， state的状态可能是：
            // 1. 锁还没有被释放，锁处于正常状态
            // 2. 锁还没有被释放， 锁处于饥饿状态
            // 3. 锁已经被释放， 锁处于正常状态
            // 4. 锁已经被释放， 锁处于饥饿状态
            // 并且本gorutine的 awoke可能是true, 也可能是false (其它goutine已经设置了state的woken标识)
            
    		// new 复制 state的当前状态， 用来设置新的状态
            // old 是锁当前的状态
    		new := old
    		
    		// 如果old state状态不是饥饿状态, new state 设置锁， 尝试通过CAS获取锁,
            // 如果old state状态是饥饿状态, 则不设置new state的锁，因为饥饿状态下锁直接转给等待队列的第一个.
    		if old&mutexStarving == 0 {
    			new |= mutexLocked
    		}
    		// 将等待队列的等待者的数量加1
    		if old&(mutexLocked|mutexStarving) != 0 {
    			new += 1 << mutexWaiterShift
    		}
    		
    		// 如果当前goroutine已经处于饥饿状态， 并且old state的已被加锁,
            // 将new state的状态标记为饥饿状态, 将锁转变为饥饿状态.
    		if starving && old&mutexLocked != 0 {
    			new |= mutexStarving
    		}
    		
     		// 如果本goroutine已经设置为唤醒状态, 需要清除new state的唤醒标记, 因为本goroutine要么获得了锁，要么进入休眠，
            // 总之state的新状态不再是woken状态.
    		if awoke {
    			// The goroutine has been woken from sleep,
    			// so we need to reset the flag in either case.
    			if new&mutexWoken == 0 {
    				throw("sync: inconsistent mutex state")
    			}
    			new &^= mutexWoken
    		}
    
    		// 通过CAS设置new state值.
            // 注意new的锁标记不一定是true, 也可能只是标记一下锁的state是饥饿状态.
    		if atomic.CompareAndSwapInt32(&m.state, old, new) {
    			
    			// 如果old state的状态是未被锁状态，并且锁不处于饥饿状态,
                // 那么当前goroutine已经获取了锁的拥有权，返回
    			if old&(mutexLocked|mutexStarving) == 0 {
    				break // locked the mutex with CAS
    			}
    			// If we were already waiting before, queue at the front of the queue.
    			// 设置并计算本goroutine的等待时间
    			queueLifo := waitStartTime != 0
    			if waitStartTime == 0 {
    				waitStartTime = runtime_nanotime()
    			}
    			// 既然未能获取到锁， 那么就使用sleep原语阻塞本goroutine
                // 如果是新来的goroutine,queueLifo=false, 加入到等待队列的尾部，耐心等待
                // 如果是唤醒的goroutine, queueLifo=true, 加入到等待队列的头部
    			runtime_SemacquireMutex(&m.sema, queueLifo, 1)
    
    			// sleep之后，此goroutine被唤醒
                // 计算当前goroutine是否已经处于饥饿状态.
    			starving = starving || runtime_nanotime()-waitStartTime > starvationThresholdNs
    			// 得到当前的锁状态
    			old = m.state
    
    			// 如果当前的state已经是饥饿状态
                // 那么锁应该处于Unlock状态，那么应该是锁被直接交给了本goroutine
    			if old&mutexStarving != 0 {
    				// If this goroutine was woken and mutex is in starvation mode,
    				// ownership was handed off to us but mutex is in somewhat
    				// inconsistent state: mutexLocked is not set and we are still
    				// accounted as waiter. Fix that.
    				if old&(mutexLocked|mutexWoken) != 0 || old>>mutexWaiterShift == 0 {
    					throw("sync: inconsistent mutex state")
    				}
    				// 当前goroutine用来设置锁，并将等待的goroutine数减1.
    				delta := int32(mutexLocked - 1<<mutexWaiterShift)
    				// 如果本goroutine是最后一个等待者，或者它并不处于饥饿状态，
                    // 那么我们需要把锁的state状态设置为正常模式.
    				if !starving || old>>mutexWaiterShift == 1 {
    					 // 退出饥饿模式
    					delta -= mutexStarving
    				}
    				// 设置新state, 因为已经获得了锁，退出、返回
    				atomic.AddInt32(&m.state, delta)
    				break
    			}
    			awoke = true
    			iter = 0
    		} else {
    			old = m.state
    		}
    	}
    }
```
整个过程比较复杂，这里总结一下一些重点：

1.  如果锁处于初始状态(unlock, 正常模式)，则通过CAS(0 -> Locked)获取锁；如果获取失败，那么就进入slowLock的流程：

slowLock的获取锁流程有两种模式： 饥饿模式 和 正常模式。

正常模式
-------

1.  mutex已经被locked了，处于正常模式下；
2.  前 Goroutine 为了获取该锁进入自旋的次数小于四次；
3.  当前机器CPU核数大于1；
4.  当前机器上至少存在一个正在运行的处理器 P 并且处理的运行队列为空；

满足上面四个条件的goroutine才可以做自旋。自旋就会调用sync.runtime\_doSpin 和 runtime.procyield 并执行 30 次的 PAUSE 指令，该指令只会占用 CPU 并消耗 CPU 时间。

处理了自旋相关的特殊逻辑之后，互斥锁会根据上下文计算当前互斥锁最新的状态new。几个不同的条件分别会更新 state 字段中存储的不同信息 — mutexLocked、mutexStarving、mutexWoken 和 mutexWaiterShift：

计算最新的new之后，CAS更新，如果更新成功且old状态是未被锁状态，并且锁不处于饥饿状态，就代表当前goroutine竞争成功并获取到了锁返回。(这也就是当前goroutine在正常模式下竞争时更容易获得锁的原因)

如果当前goroutine竞争失败，会调用 `sync.runtime_SemacquireMutex` 使用信号量保证资源不会被两个 Goroutine 获取。`sync.runtime_SemacquireMutex` 会在方法中不断调用尝试获取锁并休眠当前 Goroutine 等待信号量的释放，一旦当前 Goroutine 可以获取信号量，它就会立刻返回，sync.Mutex.Lock 方法的剩余代码也会继续执行。

饥饿模式
---

饥饿模式本身是为了一定程度保证公平性而设计的模式。所以饥饿模式不会有自旋的操作，新的 Goroutine 在该状态下不能获取锁、也不会进入自旋状态，它们只会在队列的末尾等待。

不管是正常模式还是饥饿模式，获取信号量，它就会从阻塞中立刻返回，并执行剩下代码：

1.  在正常模式下，这段代码会设置唤醒和饥饿标记、重置迭代次数并重新执行获取锁的循环；
2.  在饥饿模式下，当前 Goroutine 会获得互斥锁，如果等待队列中只存在当前 Goroutine，互斥锁还会从饥饿模式中退出；

Unlock
------

```go
    func (m *Mutex) Unlock() {
    	// Fast path: drop lock bit.
    	new := atomic.AddInt32(&m.state, -mutexLocked)
    	if new != 0 {
    		// Outlined slow path to allow inlining the fast path.
    		// To hide unlockSlow during tracing we skip one extra frame when tracing GoUnblock.
    		m.unlockSlow(new)
    	}
    }
    
    func (m *Mutex) unlockSlow(new int32) {
    	if (new+mutexLocked)&mutexLocked == 0 {
    		throw("sync: unlock of unlocked mutex")
    	}
    	if new&mutexStarving == 0 {
    		old := new
    		for {
    			// If there are no waiters or a goroutine has already
    			// been woken or grabbed the lock, no need to wake anyone.
    			// In starvation mode ownership is directly handed off from unlocking
    			// goroutine to the next waiter. We are not part of this chain,
    			// since we did not observe mutexStarving when we unlocked the mutex above.
    			// So get off the way.
    			if old>>mutexWaiterShift == 0 || old&(mutexLocked|mutexWoken|mutexStarving) != 0 {
    				return
    			}
    			// Grab the right to wake someone.
    			new = (old - 1<<mutexWaiterShift) | mutexWoken
    			if atomic.CompareAndSwapInt32(&m.state, old, new) {
    				runtime_Semrelease(&m.sema, false, 1)
    				return
    			}
    			old = m.state
    		}
    	} else {
    		// Starving mode: handoff mutex ownership to the next waiter, and yield
    		// our time slice so that the next waiter can start to run immediately.
    		// Note: mutexLocked is not set, the waiter will set it after wakeup.
    		// But mutex is still considered locked if mutexStarving is set,
    		// so new coming goroutines won't acquire it.
    		runtime_Semrelease(&m.sema, true, 1)
    	}
    }
```

互斥锁的解锁过程 sync.Mutex.Unlock 与加锁过程相比就很简单，该过程会先使用 AddInt32 函数快速解锁，这时会发生下面的两种情况：

1.  如果该函数返回的新状态等于 0，当前 Goroutine 就成功解锁了互斥锁；
2.  如果该函数返回的新状态不等于 0，这段代码会调用 sync.Mutex.unlockSlow 方法开始慢速解锁：

`sync.Mutex.unlockSlow` 方法首先会校验锁状态的合法性 — 如果当前互斥锁已经被解锁过了就会直接抛出异常 sync: unlock of unlocked mutex 中止当前程序。

在正常情况下会根据当前互斥锁的状态，分别处理正常模式和饥饿模式下的互斥锁：

*   在正常模式下，这段代码会分别处理以下两种情况处理；

1.  如果互斥锁不存在等待者或者互斥锁的 mutexLocked、mutexStarving、mutexWoken 状态不都为 0，那么当前方法就可以直接返回，不需要唤醒其他等待者；
2.  如果互斥锁存在等待者，会通过 sync.runtime\_Semrelease 唤醒等待者并移交锁的所有权；

*   在饥饿模式下，上述代码会直接调用 sync.runtime\_Semrelease 方法将当前锁交给下一个正在尝试获取锁的等待者，等待者被唤醒后会得到锁，在这时互斥锁还不会退出饥饿状态；