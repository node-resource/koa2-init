var fs   = require('fs')
var util = require('util')
var readFile = util.promisify(fs.readFile)

/**
 * async 是用同步的方式来写异步的代码
 */
const init = async (path) => {
  try {
		const data = await readFile(path).then(JSON.parse)
		console.log(data.name, '--', data.version)
  }catch (err) {
		console.log(err)
	}
}

init('./package.json')