var log = console.log

function isFunction (func) {
    return typeof func === 'function';
}

function isObject (obj) {
    return typeof obj === 'object';
}

function isArray (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

function P (executor) {
    if (!isFunction(executor)) {
        throw new TypeError('fn must be a function!')
    }
    var self = this
    self.onResolvedCallback = []   // 储存成功时的回调
    self.onRejectedCallback = []   // 储存失败时的回调
    self.status = 'pending'         // Promise当前的状态
    self.value = null              // Promise当前的值

    function resolve (val) {
        if (self.status === 'pending') {
            self.status = 'fulfilled'
            self.value = val
            for (var i = 0; i < self.onResolvedCallback.length; i++) {
                self.onResolvedCallback[i](self.value)
            }
        }
    }

    function reject (reson) {
        if (self.status === 'pending') {
            self.status = 'rejected'
            self.value = reson
            for (var i = 0; i < self.onRejectedCallback.length; i++) {
                self.onRejectedCallback[i](self.value)
            }
        }
    }

    // 如果executor本身执行时出错，则catch捕捉到错误后reject
    // 因为resolve,reject都是在executor内部调用，所以用bind绑定后再传给executor
    try {
        executor(resolve.bind(this), reject.bind(this))
    } catch (err) {
        reject.bind(this)
    }
}

// then 实现
P.prototype.then = function (onResolved, onRejected) {
    var self = this
    var promise2
    // 如果then的参数不是函数，默认直接resolve出接受到的value值或抛出错误
    // (传入非函数的onResolved会发生值穿透)
    onResolved = isFunction(onResolved) ? onResolved : function (v) { return v}
    onRejected = isFunction(onRejected) ? onRejected : function (e) { throw e}

    /**
     *  Promise共有三种状态，并且无论哪种状态都返回一个新的Promise
     * */
    if (self.status === 'fulfilled') {
        return promise2 = new P(function(resolve, reject) {
            try{
                var x = onResolved(self.value)
                // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
                // if(x instanceof P) {
                //     x.then(resolve, reject)
                // }
                // // 否则，以onResolved的返回值作为结果resolve出去
                // resolve(x)
                resolvePromise(promise2, x, resolve, reject)
            }catch (e) {
                reject(e)
            }
        })
    }

    if (self.status === 'rejected') {
        return promise2 = new P(function(resolve, reject) {
            try{
                var x = onRejected(self.value)
                resolvePromise(promise2, x, resolve, reject)
            }catch (e) {
                reject(e)
            }
        })
    }

    if (self.status === 'pending') {
        return promise2 = new P(function(resolve, reject) {
            self.onResolvedCallback.push(function (value) {
                try{
                    var x = onResolved(self.value)
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            })
            self.onRejectedCallback.push(function (value) {
                try{
                    var x = onRejected(self.value)
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            })
        })
    }
}

// catch实现
P.prototype.catch = function (onRejected) {
    return this.then(null, onRejected)
}

/**
 * resolvePromise函数即为根据x的值来决定promise2的状态的函数
 * 也即标准中的[Promise Resolution Procedure](https://promisesaplus.com/#point-47)
 * x为`promise2 = promise1.then(onResolved, onRejected)`里`onResolved/onRejected`的返回值
 * `resolve`和`reject`实际上是`promise2`的`executor`的两个实参，因为很难挂在其它的地方，所以一并传进来。
 * 相信各位一定可以对照标准把标准转换成代码，这里就只标出代码在标准中对应的位置，只在必要的地方做一些解释
 * */
function resolvePromise(promise2, x, resolve, reject) {
    var then
    var thenCalledOrThrow = false

    if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise!'))
    }

    if (x instanceof Promise) {
        if (x.status === 'pending') { //because x could resolved by a Promise Object
            x.then(function(v) {
                resolvePromise(promise2, v, resolve, reject)
            }, reject)
        } else { //but if it is resolved, it will never resolved by a Promise Object but a static value;
            x.then(resolve, reject)
        }
        return
    }

    if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
        try {
            then = x.then //because x.then could be a getter
            if (typeof then === 'function') {
                then.call(x, function rs(y) {
                    if (thenCalledOrThrow) return
                    thenCalledOrThrow = true
                    return resolvePromise(promise2, y, resolve, reject)
                }, function rj(r) {
                    if (thenCalledOrThrow) return
                    thenCalledOrThrow = true
                    return reject(r)
                })
            } else {
                resolve(x)
            }
        } catch (e) {
            if (thenCalledOrThrow) return
            thenCalledOrThrow = true
            return reject(e)
        }
    } else {
        resolve(x)
    }
}


