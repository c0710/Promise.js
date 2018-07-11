var log = console.log;

function P(fn) {
    var value = null;
    var callbacks = []; // 存放请求成功的回调函数

    this.then = function (f) {
        log('do then')
        callbacks.push(f);
        return this
    }

    // 当触发resolve时，将callbacks队列内的所有回调函数逐个执行
    // resolve接受一个参数，即异步操作所返回的值
    function resolve(newVal) {
        log('do resolve')
        setTimeout(function () {
            callbacks.forEach(function (cb, index) {
                log('execute callback someThing' + (index+1))
                cb(newVal)
            })
        }, 0)
    }

    fn(resolve)
}

function a() {
    return new P(function (resolve) {
        log('start')
        // setTimeout(function () {
        //     log('after 1s...')
            resolve('hello')
        // }, 1000)
    })
}

function someThing1(value) {
    log('This is something 1')
    log('value=' + value)
}

function someThing2(value) {
    log('This is something 2')
    log('value=' + value)
}

var result = a().then(someThing1).then(someThing2);

log('result', result)
result.then(function (value) {
    log('aaaaaaaaaaaaaaaaaaa')
})
