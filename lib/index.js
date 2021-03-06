
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
                reject: reject,
            })
        })
    };

    // 成功回调
    this.resolve = function (newVal) {
        //

        if (newVal && (typeof newVal === 'object' || typeof newVal === 'function')) {
            var then = newVal.then;
            if (typeof then === 'function') {
                then.call(newVal, _this.resolve, _this.reject);
                return
            }
        }
        _this.status = 'fulfilled';
        _this.value = newVal;
        execute();
    };

    // 失败回调
    this.reject = function (err) {
        _this.status = 'rejected';
        _this.value = err;
        execute();
    };

    // catch相当于then(null,onrejected)
    this.catch = function (cb) {
        return this.then(null, cb)
    }

    function handle(callback) {
        var status = _this.status,
            callbacks = _this.callbacks;
        if (status === 'pending') {
            callbacks.push(callback);
            return
        }
        // then接收的参数必须为函数，如果不是函数(普通值或者对象)，则当作null处理
        var fulfilledCb = typeof callback.onFulfilled === 'function' ? callback.onFulfilled : null,
            rejectedCb = typeof callback.onRejected === 'function' ? callback.onRejected : null;
        var cb = status === 'fulfilled' ? fulfilledCb : rejectedCb,
            ret;
        // 如果没传成功或者失败回调，则直接调用then Promise的resolve跳出，并带上当前value
        if (!cb) {
            cb = status === 'fulfilled' ? callback.resolve : callback.reject;
            cb(_this.value);
            return
        }
        // 将当前value传给成功或失败回调，将返回值带出到then Promise
        ret = cb(_this.value);
        /**
         * 这里的resolve是当前promise在then的时候返回的那个(中间)promise调用的resolve。
         * 也可以理解为，当这个resolve执行之后，就该执行接下来那个中间promise的then后面的callback了
         * 以下面的例子为准
         * 首次执行getId，返回一个promise，我们称之为getIdPromise
         * getIdPromise通过then返回了一个新的promise，叫做(getIdBridgePromise)，并将（该getIdBridgePromise的resolve与成功或失败回调）一起放入getIdPromise的callbacks里;
         * 当getIdPromise执行resolve的时候，getIdPromise的状态变为"fulfilled"；
         * 将getIdPromise的callbacks里的那个存放getIdBridgePromise的resolve与成功或失败回调的对象取出
         * 将getIdPromise resolve的时候带的新value带入成功回调并执行，结束后getIdBridgePromise执行resolve(newValue)并将成功回调d的返回值带入resolve中
         *
         * */
        callback.resolve(ret);
    }


    function execute() {
        setTimeout(function () {
            _this.callbacks.forEach(function (cb) {
                handle(cb)
            })
        }, 0)
    }

    fn(_this.resolve, _this.reject);
}

P.resolve = function (val) {
    return new P(function (resolve) {
        resolve(val)
    })
};

P.reject = function (err) {
    return new P(function (resolve, reject) {
        reject(err)
    })
};

// Promise.all的关键所在就是要实现一个可以直接获取单个promise最终值的方法
P.all = function (promiseArray) {
    if (!promiseArray instanceof Array) {
        throw 'arguments must be Array'
    }

    var count = 0,
        len = promiseArray.length,
        result = [];
    return new P (function (resolve, reject) {
        for (var i = 0; i < len; i++) {
            (function (i) {
                var item = promiseArray[i];
                P.resolve(item).then(function (value) {
                    count++;
                    result[i] = value;

                    if (count === len) {
                        resolve(result)
                    }
                }, function (err) {
                    reject(err)
                })
            })(i)

        }
    })
};


P.race = function (promiseArray) {
    if (!promiseArray instanceof Array) {
        throw 'arguments must be Array'
    }
    var result = 0;

    return new P(function (resolve) {
        for (var i = 0; i < promiseArray.length; i++) {
            var item = promiseArray[i];

            P.resolve(item).then(function (val) {
                if (!result) {
                    result++;
                    resolve(val)
                }
            })


        }
    })
}



module.exports = P;