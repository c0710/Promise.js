var log = console.log;

function P(fn) {
    var state = 'pending';
    var value = null;
    var callbacks = []; // 存放请求成功的回调函数

    this.then = function (f) {
        if (state === 'pending') {
            callbacks.push(f);
            return this
        }
        f(value);
        return this
    }

    // 当触发resolve时，将callbacks队列内的所有回调函数逐个执行
    // resolve接受一个参数，即异步操作所返回的值
    function resolve(newVal) {
        value = newVal;
        state = 'fulfilled';
        setTimeout(function () {
            callbacks.forEach(function (cb) {
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

var result = a().then(anotherPromise).then(someThing1).then(someThing2);

