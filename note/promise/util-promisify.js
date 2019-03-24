var util = require('util')
var fs   = require('fs')

// 通过 util库的promisify方法 => 极大简化回调处理异步的流程
// 把普通函数转化为promise函数
util.promisify(fs.readFile)('./package.json')
    .then(JSON.parse)
    .then( data => console.log(data.name, '--', data.version))
    .catch(err => console.log(err))