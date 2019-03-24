/**
 * 迭代器原理
 */

const createIterator = (arr) => {
  return {
    index: 0,
    next: function () {
      if(this.index < arr.length){
        return {
          value: arr[this.index++],
          done: false
        }
      }else {
        return {
          value: null,
          done: true
        }
      }
    }
  }
}
const arr = ['111', '222', '333','444','555']
const iterator = createIterator(arr)

for(let i=0,len=arr.length;i<=len;i++) {
  console.log(iterator.next())
}