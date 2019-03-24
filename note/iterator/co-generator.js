/**
 * co库：把generator函数转化成类似于async的执行过程
*/

const co = require('co')
const fetch = require('node-fetch')

// co(function * () {
//   const res = yield fetch('http://api.douban.com/v2/movie/1291843')
//   const movie = yield res.json()
//   const summary = movie.summary
//   console.log('summary', summary)
// })

/**
 * 下边我们来模拟一下co库的实现原理：依次执行生成器函数的yeild
 * 生成器函数的每一步，净然都是一个promise
 */
const run = (generator) => {
  const gen = generator()
  const it1 = gen.next()
  const promise1 = it1.value
  promise1.then(data => {
    const it2 = gen.next(data)
    const promise2 = it2.value
    promise2.then(data2 => {
      gen.next(data2)
    })
  })
}

run(function * () {
  const res = yield fetch('http://api.douban.com/v2/movie/1291843')
  const movie = yield res.json()
  const summary = movie.summary
  console.log('summary', summary)
})