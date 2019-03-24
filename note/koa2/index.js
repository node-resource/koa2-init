const Koa = require('koa')
const logger = require('koa-logger')()

const app = new Koa()

const md1 = async (ctx, next) => {
  ctx.type = 'text/html;charset=utf-8'
  await next()
  ctx.body = ctx.body + "henyulee"
}
const md2 = async (ctx, next) => {
  ctx.body = 'hello'
  await next()
  ctx.body = ctx.body + " my name is:"
}
const md3 = async (ctx, next) => {
  ctx.body = ctx.body + ' world'
  await next()
  ctx.body += '************'
}

app.use(logger)
app.use(md1)
app.use(md2)
app.use(md3)

app.listen(8080)