
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
        // 如果promise中的异步操作已经执行完成，则立即执行回调函数(resolve内调用时都是走这里)
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
    return 666
}

function someThing2(value) {
    log('This is something 2')
    log('value=' + value)
}

// a().then(anotherPromise).then(someThing1).then(someThing2);


/**
 *  start
 *  after 1s...
 *  anotherPromise resolve
 *  This is something 1
 *  value=90
 *  This is something 2
 *  value=666
 * */
function getId() {
    return new P(function (resolve) {
        setTimeout(function () {
            log('get id succ')
            resolve(7)
        }, 300)
    })
}

function getNameById(id) {
    return new P(function (resolve) {
        setTimeout(function () {
            log('get name succ')
            resolve('wang' + id)
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