var log = console.log
function P (fn) {
  // 储存成功时的回调
  var doneList = []
  // 实例的方法，用来注册异步事件
  this.then = function (done, fail) {
    doneList.push(done)
    return this
  }
  /**
   *  如果fn(promise接受的函数)是同步函数的话，resolve就会在then之前执行，此时doneList还是空的
   *  所以用setTimeout使其成为异步函数
   * */
  function resolve () {
    setTimeout(function () {
      doneList.forEach(function (fulfill) {
        fulfill()
      })
    }, 0)
  }
  fn(resolve)
}

var p = new P(function(resolve){
  // setTimeout(resolve, 1000);
  log('Start')
  resolve()
});
p
  .then(function(){console.log('success')})
  .then(function () { console.log('success2') })
