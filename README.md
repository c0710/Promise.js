
### Promise简单雏形
```
function P(fn) {
    var value = null;
    var callbacks = []; // 存放请求成功的回调函数

    this.then = function (f) {
        log('do then')
        callbacks.push(f);
        // 链式调用
        return this
    }

    // 当触发resolve时，将callbacks队列内的所有回调函数逐个执行
    // resolve接受一个参数，即异步操作所返回的值
    function resolve(newVal) {
        log('do resolve')
        callbacks.forEach(function (cb, index) {
            log('execute callback someThing' + (index+1))
            cb(newVal)
        })
    }

    fn(resolve)
}

function a() {
    return new P(function (resolve) {
        log('start')
        setTimeout(function () {
            log('after 1s...')
            resolve('hello')
        }, 1000)
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

a().then(someThing1).then(someThing2);

/*
    start
    do then
    do then
    after 1s...
    do resolve
    execute callback someThing1
    This is something 1
    value=hello
    execute callback someThing2
    This is something 2
    value=hello
*/

```

### 如果在then方法注册回调之前，resolve函数就执行了？
```
function a() {
    return new P(function (resolve) {
        log('start')
        resolve('hello')
    })
}
// ...

/*
    start
    do resolve
    do then
    do then
*/
```
> 上述情况，如果将promise里的函数改为同步函数，那么resolve将在then之前触发，触发时，callbacks队列里还是空，以至于回调函数无法执行。

## 解决方案
```
    // 将resolve内遍历所有callback这部操作改为异步
    function resolve(newVal) {
        log('do resolve')
        setTimeout(function () {
            callbacks.forEach(function (cb, index) {
                log('execute callback someThing' + (index+1))
                cb(newVal)
            })
        }, 0)
    }

```
------------------------------------------
## Promise的三种状态
经过我们之前的改进，已经可以保证在resolve执行时，then方法的回调函数已经注册完成.
但是，如果Promise异步操作已经成功，这时，在异步操作成功之前注册的回调都会执行，但是在Promise异步操作成功这之后调用的then注册的回调就再也不会执行了，我们继续改进。
> Promises/A+规范中的2.1Promise States中明确规定了，pending可以转化为fulfilled或rejected并且只能转化一次，也就是说如果pending转化到fulfilled状态，那么就不能再转化到rejected。并且fulfilled和rejected状态只能由pending转化而来，两者之间不能互相转换。
```

function P(fn) {
    var state = 'pending';
    var value = null;
    var callbacks = []; // 存放请求成功的回调函数

    this.then = function (f) {
       if (state === 'pending') {
            callbacks.push(onFulfilled);
            return this;
        }
        f(value);
        return this;
    }

    // 当触发resolve时，将callbacks队列内的所有回调函数逐个执行
    // resolve接受一个参数，即异步操作所返回的值
    function resolve(newVal) {
        value = newVal;
        state = 'fulfilled';
        callbacks.forEach(function (cb, index) {
            log('execute callback someThing' + (index+1))
            cb(newVal)
        })
    }

    fn(resolve)
}

```
> resolve执行时，会将状态设置为fulfilled，在此之后调用then添加的新回调，都会立即执行。
------------------------------------------
### 链式操作
如果then函数里面注册的仍然是一个Promise
```
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

a().then(anotherPromise).then(someThing1).then(someThing2);


/**
 *  start
 *  after 1s...
 *  anotherPromise resolve
 *  This is something 1
 *  value=90
 *  This is something 2
 *  value=666
 * */
```

### 在当前promise达到fulfilled状态后，如何衔接进入下一个promise（后邻promise）？
```
    function getId() {
    return new P(function (resolve) {
        http.get('xxx', function (res) {
            log('get id succ')
            resolve(res.id)
        })
    })
}

function getNameById(id) {
    return new P(function (resolve) {
        http.get('xxx/' + id, function (res) {
            log('get name succ')
            resolve(res.name)
        })
    })
}

function sayName(name) {
    log('My name is ' + name)
}

getId().then(getNameById).then()

/**
 *  get id succ
 *  get name succ
 *  My name is wangcheng
 * */

```




