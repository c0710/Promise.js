/**
 *  异常处理
 * */


var log = console.log;

function P(fn) {
    var state = 'pending',
        value = null,
        callbacks = [];

    this.then = function (onFulfilled, onRejected) {
        return new P(function (resolve, reject) {
            handle({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject
            });
        });
    };

    function handle(callback) {
        if (state === 'pending') {
            callbacks.push(callback);
            return;
        }

        var cb = state === 'fulfilled' ? callback.onFulfilled : callback.onRejected,
            ret;
        if (cb === null) {
            cb = state === 'fulfilled' ? callback.resolve : callback.reject;
            cb(value);
            return;
        }
        ret = cb(value);
        callback.resolve(ret);
    }

    function resolve(newValue) {
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            var then = newValue.then;
            if (typeof then === 'function') {
                then.call(newValue, resolve, reject);
                return;
            }
        }
        state = 'fulfilled';
        value = newValue;
        execute();
    }

    function reject(reason) {
        state = 'rejected';
        value = reason;
        execute();
    }

    // 抽离resolve和reject公共部分
    function execute() {
        setTimeout(function () {
            callbacks.forEach(function (callback) {
                handle(callback);
            });
        }, 0);
    }

    fn(resolve, reject);
}

function getId() {
    return new P(function (resolve, reject) {
        log('get id...')
        setTimeout(function () {
            log('get id err')
            reject('getId occur err')
        }, 300)
    })
}

function getNameById(id) {
    log('get name...')
    return new P(function (resolve, reject) {
        setTimeout(function () {
            log('get name succ')
            resolve('wang' + id)
        }, 300)
    })
}

function sayName(name) {
    log('My name is ' + name)
}
function sayErr(err) {
    log('err: ' + err)
}
getId()
    .then(getNameById, function (err) {
        log('111   ' +err)
    })
    .then(sayName, function (err) {
        log('222   ' +err)
    })


/**
 *  get id succ
 *  get name succ
 *  My name is wang7
 * */