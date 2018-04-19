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
                self.onResolvedCallback[i](value)
            }
        }
    }

    function reject (reson) {
        if (self.status === 'pending') {
            self.status = 'rejected'
            self.value = reson
            for (var i = 0; i < self.onRejectedCallback.length; i++) {
                self.onRejectedCallback[i](reson)
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

P.prototype.then = function (onResolved, onRejected) {
    var self = this
    var promise2
    // 如果then的参数不是函数，则忽略
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
                if(x instanceof P) {
                    x.then(resolve, reject)
                }
                // 否则，以onResolved的返回值作为结果resolve出去
                resolve(x)
            }catch (e) {
                reject(e)
            }
        })
    }

    if (self.status === 'rejected') {
        return promise2 = new P(function(resolve, reject) {
            try{
                var x = onRejected(self.value)
                if(x instanceof P) {
                    x.then(resolve, reject)
                }
            }catch (e) {
                reject(e)
            }
        })
    }

    if (self.status === 'pending') {
        return promise2 = new P(function(resolve, reject) {
            self.onResolvedCallback.push(onResolved)
        })
    }
}

