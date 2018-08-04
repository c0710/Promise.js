var log = console.log;

function P(fn) {

    this.state = 'pending';
    this.value = null;
    this.callbacks = [];

    this.then = function () {
        // ...
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
    }
}