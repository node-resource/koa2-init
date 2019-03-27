const cluster = require('cluster') // 进程
const cpus    = require('os').cpus() // 获取cpu核数

let workers = []

const masterProcess = () => {
  console.log(`一共有${cpus.length}个核`)
  console.log(`Mater 主进程${ process.pid }启动`)
  for(let i=0;i<cpus.length;i++){
    console.log(`正在fork子进程${i}`)
    const work = cluster.fork() //启动子进程
    work.on('message', data => {
      console.log(`主进程 ${process.pid}收到 ${data.msg} 来自${work.process.pid}`)
    })
    workers.push(work)
  }
  workers.forEach(work => {
    console.log(`主进程${process.pid}发消息给子进程${work.process.pid}`)
    work.send({msg: `来自主进程${process.pid}的消息`})
  })
  // 主进程只会在第一次启动时启动，后续都是启动子进程，所以可以退出主进程
  // process.exit()
}


const childProcess = () => {
  console.log(`worker 子进程${process.pid}启动`)
  process.on('message', data => {
    console.log(`worker 子进程${process.pid}收到消息${data.msg}`)
  })
  console.log(`worker 子进程${process.pid}正在发消息给主进程`)
  process.send({msg:`来自子进程${process.pid}的消息`})
  console.log(`worker 子进程${process.pid}结束发消息给主进程`)
  // process.exit()
}

if(cluster.isMaster){
  masterProcess()
}else {
  childProcess()
}