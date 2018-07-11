
var log = console.log;

function P(fn) {
    var state = 'pending';
    var value = null;
    var callbacks = []; // 存放请求成功的回调函数

    this.then = function (f) {
        return new P(function (resolve) {
            handle({
                onFulfilled: f || null,
                resolve: resolve
            });
        })
    }

    function handle(callback) {
        if (state === 'pending') {
            callbacks.push(callback);
            return;
        }
        //如果then中没有传递任何东西
        if(!callback.onFulfilled) {
            callback.resolve(value);
            return;
        }

        var ret = callback.onFulfilled(value);
        callback.resolve(ret);
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
        setTimeout(function () {
            log('after 1s...')
        resolve(9)
        }, 1000)
    })
}

function anotherPromise(data) {
    return new P(function (resolve) {
        setTimeout(function () {
            log('anotherPromise resolve')
            resolve(data * 10)
        }, 300)
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



