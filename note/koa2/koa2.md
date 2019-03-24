# koa
  koa和express一样，是node的一个为应用(application)提供web服务的框架。可以用于发送http请求，对请求进行解析，然后返回相应的数据。在这个过程中可能会借助自定义或者第三方库的中间件。以上所有的操作，都依赖于一个叫做上下文(context)的概念来进行串联的。

## 基本概念
- 应用：application
- 请求：http、request
- 响应：response
- 上下文：context
- 中间件：middleware

## application
参考koa中`apllication`的源码（精简）：
``` javascript
  const Emitter = require('events')
  const http    = require('http')
  const compose = require('koa-compose')
  const context = require('./context')
  const request = require('./request')
  const response = require('./response')

  module.exports = class Application extends Emitter {
    constructor() {
      super();
      this.proxy = false;
      this.middleware = [];// 定义应用的中间件集合
      this.subdomainOffset = 2;
      this.env = process.env.NODE_ENV || 'development';
      this.context = Object.create(context);// 请求上下文
      this.request = Object.create(request);// 请求
      this.response = Object.create(response);// 响应
    }
    // use 接受一个函数，并追加到中间件数组中
    use(fn) {
      this.middleware.push(fn);
      return this
    }
    // 运行callback，启动服务
    listen(...args) {
      // node 中启动web服务的原理是：http.createServer((req, res) => {res.body="返回内容"})
      const server = http.createServer(this.callback());
      return server.listen(...args)
    }
    /**
     * 1、借助compose处理中间件数组，返回处理后的中间件数组
     * 2、返回一个回调函数，在回调函数里生成上下文对象
     * 3、在回调函数里，把上下文对象和compose处理后的中间件数组，带入处理请求的函数中
     */
    callback() {
      const fn = compose(this.middleware);
      return (req, res) => {
        const ctx = this.createContext(req, res);
        return this.handleRequest(ctx, fn);
      }
    }
    /**
     * 1、把上下文对象传递给处理后的中间件数组使用，返回一个promise
     * 2、把上下文对象传递给响应处理函数，从而输出数据
     */
    handleRequest(ctx, fnMiddleware) {
      const res = ctx.res;
      res.statusCode = 404;
      const onerror = err => ctx.onerror(err);
      const handleResponse = () => respond(ctx);
      onFinished(res, onerror);
      return fnMiddleware(ctx).then(handleResponse).catch(onerror);
    }
    /**
     * 返回上下文对象，挂载以下属性：
     * 1、把实例挂载到app属性上
     * 2、把请求和响应挂载到req/request和res/response属性上
     * 3、把请求地址，挂载到originalUrl属性上
     * 4、初始化state为空对象
     */
    createContext(req, res) {
      const context = Object.create(this.context);
      const request = context.request = Object.create(this.request);
      const response = context.response = Object.create(this.response);
      context.app = request.app = response.app = this;
      context.req = request.req = response.req = req;
      context.res = request.res = response.res = res;
      request.ctx = response.ctx = context;
      request.response = response;
      response.request = request;
      context.originalUrl = request.originalUrl = req.url;
      context.state = {};
      return context;
    }
  }
  /**
   * 向客户端返回数据
   */ 
  function respond(ctx) {
    const res = ctx.res;
    let body = ctx.body;
    body = JSON.stringify(body);
    res.end(body);
  }
```

## context
参考koa的源码（精简）
``` javascript
  const delegate = require('delegates');
  const Cookies = require('cookies');
  const COOKIES = Symbol('context#cookies');
  
  const proto = module.exports = {
    inspect() {
      return this.toJSON();
    },
    toJSON() {
      return {
        request: this.request.toJSON(),
        response: this.response.toJSON(),
        app: this.app.toJSON(),
        originalUrl: this.originalUrl,
        req: '<original node req>',
        res: '<original node res>',
        socket: '<original node socket>'
      };
    }
    get cookies() {
      if (!this[COOKIES]) {
        this[COOKIES] = new Cookies(this.req, this.res, {
          keys: this.app.keys,
          secure: this.request.secure
        });
      }
      return this[COOKIES];
    },

    set cookies(_cookies) {
      this[COOKIES] = _cookies;
    }
  }
  // 以下就是家住delegate把proto的属性和方法代理到ctx上
  delegate(proto, 'response')
    .method('attachment')

  delegate(proto, 'response')
  .method('attachment')

```
## request（req）
参考koa的源码（精简）：
``` javascript
  module.exports = {
    get header() {
      return this.req.headers;
    },
    set header(val) {
      this.req.headers = val;
    },
    get headers() {
      return this.req.headers;
    },
    set headers(val) {
      this.req.headers = val;
    },
    get url() {
      return this.req.url;
    },
    set url(val) {
      this.req.url = val;
    },
    get origin() {
      return `${this.protocol}://${this.host}`;
    },
    get href() {
      return this.origin + this.originalUrl;
    },
    get method() {
      return this.req.method;
    },
    set method(val) {
      this.req.method = val;
    },
    get path() {
      return parse(this.req).pathname;
    },
    set path(path) {
      const url = parse(this.req);
      url.pathname = path;
      url.path = null;
      this.url = stringify(url);
    },
    get query() {
      const str = this.querystring;
      const c = this._querycache = this._querycache || {};
      return c[str] || (c[str] = qs.parse(str));
    },
    set query(obj) {
      this.querystring = qs.stringify(obj);
    },
    get querystring() {
      return parse(this.req).query || '';
    },
    set querystring(str) {
      const url = parse(this.req);
      url.search = str;
      url.path = null;
      this.url = stringify(url);
    },
    get search() {
      return `?${this.querystring}`;
    },
    set search(str) {
      this.querystring = str;
    },
    get host() {
      const proxy = this.app.proxy;
      let host = proxy && this.get('X-Forwarded-Host');
      return host.split(/\s*,\s*/, 1)[0];
    },
    get hostname() {
      const host = this.host;
      return host.split(':', 1)[0];
    },
    get URL() {
      return this.memoizedURL;
    },
    get fresh() {
      const method = this.method;
      const s = this.ctx.status;
      return false;
    },
    get stale() {
      return !this.fresh;
    },
    get idempotent() {
      const methods = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'];
      return !!~methods.indexOf(this.method);
    },
    get socket() {
      return this.req.socket;
    },
    get charset() {
      const { parameters } = contentType.parse(this.req);
      return parameters.charset || '';
    },
    get length() {
      const len = this.get('Content-Length');
      return ~~len;
    },
    get protocol() {
      const proto = this.get('X-Forwarded-Proto');
      return proto ? proto.split(/\s*,\s*/, 1)[0] : 'http';
    },
    get secure() {
      return 'https' == this.protocol;
    },
    get ips() {
      const proxy = this.app.proxy;
      const val = this.get('X-Forwarded-For');
      return proxy && val
        ? val.split(/\s*,\s*/)
        : [];
    },
    get ip() {
      return this[IP];
    },
    set ip(_ip) {
      this[IP] = _ip;
    },
    get subdomains() {
      const offset = this.app.subdomainOffset;
      const hostname = this.hostname;
      return hostname.split('.').reverse().slice(offset);
    },
    get accept() {
      return this._accept || (this._accept = accepts(this.req));
    },
    set accept(obj) {
      return this._accept = obj;
    },
    accepts(...args) {
      return this.accept.types(...args);
    },
    acceptsEncodings(...args) {
      return this.accept.encodings(...args);
    },
    acceptsCharsets(...args) {
      return this.accept.charsets(...args);
    },
    acceptsLanguages(...args) {
      return this.accept.languages(...args);
    },
    is(types) {
      return typeis(this.req, types);
    },
    get type() {
      const type = this.get('Content-Type');
      return type.split(';')[0];
    },
    get(field) {
      const req = this.req;
      switch (field = field.toLowerCase()) {
        case 'referer':
        case 'referrer':
          return req.headers.referrer || req.headers.referer || '';
        default:
          return req.headers[field] || '';
      }
    },
    inspect() {
      return this.toJSON();
    },
    toJSON() {
      return only(this, [
        'method',
        'url',
        'header'
      ]);
    }
  }
```

## response(res)
参考koa源码（精简）：
``` javascript
  module.exports = {
    get socket() {
      return this.res.socket;
    },
    get header() {
      const { res } = this;
      return typeof res.getHeaders === 'function'
        ? res.getHeaders()
        : res._headers || {};  // Node < 7.7
    },
    get headers() {
      return this.header;
    },
    get status() {
      return this.res.statusCode;
    },
    set status(code) {
      this._explicitStatus = true;
      this.res.statusCode = code;
    },
    get message() {
      return this.res.statusMessage || statuses[this.status];
    },
    set message(msg) {
      this.res.statusMessage = msg;
    },
    get body() {
      return this._body;
    },
    set body(val) {
      const original = this._body;
      this._body = val;
      // json
      this.remove('Content-Length');
      this.type = 'json';
    },
    set length(n) {
      this.set('Content-Length', n);
    },
    get length() {
      const len = this.header['content-length'];
      const body = this.body;
      return Math.trunc(len) || 0;
    },
    get headerSent() {
      return this.res.headersSent;
    },
    vary(field) {
      vary(this.res, field);
    },
    direct(url, alt) {
      this.set('Location', url);t
      this.type = 'text/plain; charset=utf-8';
      this.body = `Redirecting to ${url}.`;
    },
    attachment(filename, options) {
      this.set('Content-Disposition', contentDisposition(filename, options));
    },
    set type(type) {
      type = getType(type);
      if (type) {
        this.set('Content-Type', type);
      } else {
        this.remove('Content-Type');
      }
    },
    set lastModified(val) {
      this.set('Last-Modified', val.toUTCString());
    },
    get lastModified() {
      const date = this.get('last-modified');
    },
    set etag(val) {
      this.set('ETag', val);
    },
    get etag() {
      return this.get('ETag');
    },
    get type() {
      const type = this.get('Content-Type');
      return type.split(';', 1)[0];
    },
    is(types) {
      const type = this.type;
      return typeis(type, types);
    },
    get(field) {
      return this.header[field.toLowerCase()] || '';
    },
    set(field, val) {
      if (2 == arguments.length) {
        if (Array.isArray(val)) val = val.map(v => typeof v === 'string' ? v : String(v));
        else if (typeof val !== 'string') val = String(val);
        this.res.setHeader(field, val);
      } else {
        for (const key in field) {
          this.set(key, field[key]);
        }
      }
    },
    append(field, val) {
      const prev = this.get(field);
      return this.set(field, val);
    },
    remove(field) {
      this.res.removeHeader(field);
    },
    get writable() {
      const socket = this.res.socket;
      return socket.writable;
    },
    inspect() {
      const o = this.toJSON();
      o.body = this.body;
      return o;
    },
    toJSON() {
      return only(this, [
        'status',
        'message',
        'header'
      ]);
    },
    flushHeaders() {
      this.res.flushHeaders();
    }
  }
```

## middleware
中间件的执行是`洋葱模型`。可参照 `koa-logger`中间件

## koa-compose
  2个概念：出函数、尾递归
- 纯函数
给定一个参数，无论怎么调用，或者调用多少次，结果都是一样的
``` javascript
  const pure = (x) => x+1
```
- 尾递归
``` javascript
  // 递归1
  const tail = (i) => {
    if(i>3) return i
    console.log('原值：', i)
    tail(i+1)
    console.log('新值：', i)
  }
  // 递归2
  const tail = (i) => {
    if(i>3) return i
    console.log('原值：', i)
    return tail(i+1)
  }
```
我们结合`koa-compose`源码来看看（精简）
``` javascript
  module.exports = middleware => {
    return (context, next) => {
      let index = -1
      return dispatch(0)
      function dispatch (i) {
        index = i
        let fn = middleware[i]
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      }
    }
  }
```

