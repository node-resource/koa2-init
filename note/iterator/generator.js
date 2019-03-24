/**
 * 生成器函数
*/

function * createIterator (arr) {
  for (let i=0,len=arr.length; i<len; i++) {
    yield arr[i]
  }
}
const arr = ['111', '222', '333', '444', '555']
const gen = createIterator(arr)

for(let j=0,len=arr.length; j<=len; j++) {
  console.log(gen.next())
}