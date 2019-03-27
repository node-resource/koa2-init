var koa = require('koa')

var app = new koa()

var md1 = function () {
  return function * (next) {
    this.body = "中间件1 =>"
    yield next
    this.body += '中间件1 <='
  }
}

var md2 = function () {
  return function * (next) {
    this.body += "中间件2 =>"
    yield next
    this.body += '中间件2 <='
  }
}

var md3 = function () {
  return function * (next) {
    this.body = "=> 核心业务 <=" 
  }
}

app.use(md1())
app.use(md2())
app.use(md3())

app.listen(80)