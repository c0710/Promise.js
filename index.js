var log = console.log

function P (fn) {
  // 储存成功时的回调
  var doneList = []
  var state = 'pending'
  var value = null
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
        doneList.push(onResolved)
        return this
      case 'fulfilled':
        onResolved()
        return this
    }
  }

  function handle (cb) {
    if (state === 'pending') {
      doneList.push(cb)
      return
    }
    // 若then中没有传递任何东西
    if (!cb.onFulfilled) {
      cb.resolve(value)
      return
    }
    //
    var ret = cb.onFulfilled(value)
    cb.resolve(ret)
  }

  /**
   *  如果fn(promise接受的函数)是同步函数的话，resolve就会在then之前执行，此时doneList还是空的
   *  所以用setTimeout使其成为异步函数
   * */
  function resolve (newValue) {
    state = 'fulfilled'
    var value = newValue
    setTimeout(function () {
      doneList.forEach(function (fulfill) {
        var tmp = fulfill(value)
        if (value instanceof Promise) {
          var newP = tmp
          for (i++; i < doneList.length; i++) {
            newP.then(doneList[i]);
          }
        } else {
          value = tmp
        }
      })
    }, 0)
  }

  fn(resolve)
}

var p = new P(function (resolve) {
  setTimeout(function () {
    resolve('from p')
  }, 1000);
  // resolve()
});
var p2 = function () {
  return  new P(function (resolve) {
    setTimeout(function (args) {
      resolve('inner Promise')
    }, 2000)
  })
}
p
  .then(function (data) {
    console.log('111', data)
    return 'aaa'
  })
  .then(p2)
  .then(function (data) {
    console.log('2222', data)
  })

