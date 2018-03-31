var log = console.log
function P (fn) {
  // 储存成功时的回调
  var doneList = []
  var state = 'pending'
  /**
   * then() 方法返回一个  Promise 它最多需要有两个参数：Promise的成功和失败情况的回调函数。
   *
   * @param onResolved 已完成回调函数
   * @param onRejected 已失败回调函数
   * @return {Promise}
   */
  this.then = function (onResolved, onRejected) {
    switch (state) {
      case 'pending':
        log('pending')
        doneList.push(onResolved)
        return this
      case 'fulfilled':
        log('fulfilled')
        onResolved()
        return this
    }
  }
  /**
   *  如果fn(promise接受的函数)是同步函数的话，resolve就会在then之前执行，此时doneList还是空的
   *  所以用setTimeout使其成为异步函数
   * */
  function resolve () {
    state = 'fulfilled'
    setTimeout(function () {
      doneList.forEach(function (fulfill) {
        fulfill()
      })
    }, 0)
  }
  fn(resolve)
}

var p = new P(function(resolve){
  setTimeout(resolve, 1000);
  // resolve()
});
p
  .then(function(){console.log('111')})
  .then(function () { console.log('2222') })

