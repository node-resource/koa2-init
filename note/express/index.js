const express = require('express') // express只进不出,需要借助事件机制来实现洋葱模型   koa是洋葱模型   

const app = express()
const indet = (n) => new Array(n).join('&nbsp;')
const mid1 = () => (req, res, next) => {
  res.body = `<h3>请求 => 第1个中间件</h3>`
  next()
  res.body += `<h3>响应 <= 第1个中间件</h3>`
}
const mid2 = () => (req, res, next) => {
  res.body += `<h3>${indet(4)}请求 => 第2个中间件</h3>`
  next()
  res.body += `<h3>${indet(4)}响应 <= 第2个中间件</h3>`
}
const mid3 = () => (req, res, next) => {
  res.body += `<h3>${indet(8)}请求 => 第3个中间件</h3>`
  next()
  res.body += `<h3>${indet(8)}响应 <= 第3个中间件</h3>`
}

app.use(mid1())
app.use(mid2())
app.use(mid3())

app.get('/', (req, res, next) => {
  res.body += `<h3 style="color: #ff3333;">${indet(12)}=> 处理核心业务 <=</h3>`
  next()
  res.send(res.body)
})

app.listen(80)
