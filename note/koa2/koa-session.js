const Koa = require('koa')
const logger = require('koa-logger')()
const session = require('koa-session')

const app = new Koa()

app.keys = ['henyulee']

app.use(logger)
app.use(session(app))
app.use(ctx => {
  if(ctx.path === '/'){
    let n = ctx.session.view || 0
    ctx.session.view = ++n
    ctx.body = n + 'view times'
  }else if(ctx.path === '/hi') {
    ctx.body = 'hello world'
  }else{
    ctx.body = '404 => NOT FOUND'
  }
})

app.listen(80)