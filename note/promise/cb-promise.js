var fs = require('fs')

const readFileAsync = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if(err) reject(err)
            else resolve(data)
        })
    })
}

// 为何路径是./???
readFileAsync('./package.json').then( data => {
    const result = JSON.parse(data)
    console.log(result.name,"--", result.version)
}).catch(err => {
    console.error(err)
})