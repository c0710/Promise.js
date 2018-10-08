
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
                cbName: onFulfilled.name || onRejected.name
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

    function handle(callback) {
        var status = _this.status,
            callbacks = _this.callbacks;
        if (status === 'pending') {
            console.log('push ' + callback.cbName)

            callbacks.push(callback);
            console.log('total ' + callbacks.length)
            return
        }
        // 如果传了成功回调或者失败回调
        var cb = status === 'fulfilled' ? callback.onFulfilled : callback.onRejected,
            ret;
        // 如果没传成功或者失败回调，则直接调用then Promise的resolve跳出，并带上当前value
        if (!cb) {
            cb = status === 'fulfilled' ? callback.resolve : callback.reject;
            cb(_this.value);
            return
        }
        // 将当前value传给成功或失败回调，将返回值带出到then Promise
        console.log(_this.value)
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
         *
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

module.export = P;