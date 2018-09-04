var log = console.log;

function P(fn) {
    const _this = this;

    this.status = 'pending';
    this.value = null;
    this.callbacks = [];

    this.then = function (onFulfilled, onRejected) {
        // ...
        return new P(function(resolve, reject) {
            handle({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject
            })
        })
    };

    this.resolve = function (val) {
        // 成功回调
        this.state = 'fulfilled';
        this.value = val;

    };

    this.reject = function (err) {
        // 失败回调
        this.state = 'rejected';
        this.value = err;
    };
    
    function handle(callback) {
        var status = _this.status,
            callbacks = _this.callbacks,
            value = _this.value;
        if (status === 'pending') {
            callbacks.push(callback);
            return
        }
        // 如果传了成功回调或者失败回调
        var cb = status === 'fulfilled' ? callback.onFulfilled : callback.onRejected,
            ret;
        // 如果没传成功或者失败回调，则直接调用then Promise的resolve跳出，并带上当前value
        if (!cb) {
            cb = status === 'fulfilled' ? callback.resolve : callback.reject;
            cb(value);
            return
        }
        // 将当前value传给成功或失败回调，将返回值带出到then Promise
        ret = cb(value);
        callback.resolve(ret);
    }
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
// getId()
//     .then(getNameById, function (err) {
//         log('111   ' +err)
//     })
//     .then(sayName, function (err) {
//         log('222   ' +err)
//     })