## event loop
node中的event loop大致按照如下顺序执行：
  process.nextTick是在以下6个阶段中，任意2个阶段之间来执行。
  Promise.resolve()的优先级仅次于process.nextTick.
1. timers 定时器阶段
在这个阶段，setTimeout/setImmediate的函数会被执行
2. I/O callbacks 
3. idle,prepare 内部使用的空闲/等待状态
4. poll 
向系统去获取新的IO事件，执行对应IO的回调。具体执行中，会先查看是否有到期的定时器任务，如果有就前往timer阶段处理到期的定时器的回调，然后处理poll队列中的回调，直到队列中的回调被清空或者达到一个上限。在此过程中，如果有setImmediate，则会终止poll阶段，前往 check阶段，执行setImmediate的回调
5. check
执行setImmediate的回调，而且setImmediate的回调只能在这个阶段来执行
6. close callback

## 进程
### 关于进程的几个思考
1. 什么是同步异步
2. 什么是异步IO
3. 什么是阻塞非阻塞
4. 什么是事件循环与事件驱动
5. 什么是线程
线程是进程调用的一个实例。是cpu调度的基本单元
6. 什么是进程
进程就是某个程序在某个集合上的运行，是系统资源分配和独立调度的独立单元
7. 什么是子进程
8. 怎样来启动子进程
9. 进程间如何通信

### 线程 && 进程
一个线程一定属于一个进程。而且只可属于一个进程。一个进程可以有多个线程，同一个进程下的线程可以共享所有资源。不同进程之间往往通过消息中心进行消息同步。
