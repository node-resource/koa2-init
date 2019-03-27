var {readFile, readFileSync} = require('fs')
var Emitter      = require('events')

class BB extends Emitter {}
var bb = new BB()
//注册一个事件监听函数
bb.on('fuck', () => console.log('Funk! 粗大事了'))

setImmediate( () => console.log('阶段3->check阶段: setImmediate 回调1'))
setImmediate( () => console.log('阶段3->check阶段: setImmediate 回调2'))
setImmediate( () => console.log('阶段3->check阶段: setImmediate 回调3'))

Promise.resolve()
  .then(() => {
    console.log('待切入下一个阶段： promise回调1')
    setImmediate(() => console.log('阶段3->check阶段: promise回调1 增加的 setImmediate 回调4'))
  })

readFile('../../readme.md', 'utf-8', data=> {
  console.log('阶段2 -> IO:读文件回调1')
  readFile('../../package.json','utf-8', data2 => {
    console.log('阶段2 -> IO:读文件回调2')
    setImmediate(() => console.log('阶段3->check阶段: 读文件回调2 增加的 setImmediate 回调6'))
  })
  setImmediate(() => {
    console.log('阶段3->check阶段: 读文件回调1 增加的 setImmediate 回调5')
    Promise.resolve().then(() => {
      console.log('待切入下一个阶段： 读文件回调1 增加的 setImmediate 回调5 增加的 promise回调2')
      process.nextTick(() => {
        console.log('待切入下一个阶段：promise回调2 增加的 process.nextTick')
      })
    }).then(() => {
      console.log('待切入下一个阶段：读文件回调1 增加的 setImmediate 回调5 增加的 promise')
    })
  })
  setImmediate(() => {
    console.log('阶段3->check阶段: 读文件回调1 增加的 setImmediate 回调6')
    process.nextTick(() => {
      console.log('待切入下一个阶段：setImmediate 回调6 增加的 process.nextTick1')
    })
    console.log('待切入下一个阶段：正在同步读取文件')
    readFileSync('package.json', 'utf-8', data => {
      console.log('我已经成功同步阻塞读取到文件')
    })
    process.nextTick(() => {
      console.log('待切入下一个阶段：setImmediate 回调6 增加的 process.nextTick2')
    })
    bb.emit('fuck')
    readFile('../../readme.md', 'utf-8', data => {
      console.log('阶段2 -> IO: setImmediate 回调6 增加的 读文件回调1')
      setImmediate(() => console.log('阶段3 -> timer:setImmediate 回调6 增加的 读文件回调1 增加的setImmediate 1'))
      setTimeout(() => {
        console.log('阶段1 -> timer: setImmediate 回调6 增加的 读文件回调1 增加的 setTimeout')
      })
    })
  })
})




setTimeout(() => {
  console.log('阶段1->timer阶段：settimeout 回调1')
}, 0)
setTimeout(() => {
  console.log('阶段1->timer阶段：settimeout 回调2')
  process.nextTick(() => {
    console.log('待切入下一个阶段：nextTick 回调5')
  })
}, 0)
setTimeout(() => {
  console.log('阶段1->timer阶段：settimeout 回调3')
},0)


process.nextTick(() => console.log('待切入下一个阶段：nextTick 回调1') )
process.nextTick(() => {
  console.log('待切入下一个阶段：nextTick 回调2')
  process.nextTick(() => console.log('待切入下一个阶段：nextTick 回调4'))
})
process.nextTick(() => {
  console.log('待切入下一个阶段：nextTick 回调3')
})