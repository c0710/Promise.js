
var log = console.log;

function P(fn) {
    var state = 'pending';
    var value = null;
    var callbacks = []; // 存放请求成功的回调函数

    this.then = function (onFulfilled, onRejected) {
        return new P(function (resolve, reject) {
            handle({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject
            });
        })
    }

    function handle(callback) {
        if (state === 'pending') {
            callbacks.push(callback);
            return;
        }

        var cb = state === 'fulfilled' ? callback.onFulfilled : callback.onRejected,
            ret;
        if (cb === null) {
            cb = state === 'fulfilled' ? callback.resolve : callback.reject;
        }
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
        if (newVal && (typeof newVal === "object" || typeof newVal === "function")) {
            var then = newVal.then;
            if (typeof newVal.then === "function") {
                then.call(newVal, resolve);
                return
            }
        }
        value = newVal;
        state = 'fulfilled';
        setTimeout(function () {
            callbacks.forEach(function (cb) {
                handle(cb)
            })
        }, 0)
    }

    fn(resolve)
}

function getId() {
    return new P(function (resolve) {
        log('get id...')
        setTimeout(function () {
            log('get id succ')
            resolve({value: 7,then: function () {
                    console.log('empty')
                }})
        }, 300)
    })
}

function getNameById(id) {
    log('get name...')
    return new P(function (resolve) {
        setTimeout(function () {
            log('get name succ')
            resolve('wang' + id.value)
        }, 300)
    })
}

function sayName(name) {
    log('My name is ' + name)
}
getId()
.then(getNameById)
.then(sayName)

/**
 *  get id succ
 *  get name succ
 *  My name is wang7
 * */