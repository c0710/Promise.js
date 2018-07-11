
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
