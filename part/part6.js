var log = console.log;

function P(fn) {

    this.state = 'pending';
    this.value = null;
    this.callbacks = [];

    this.then = function () {
        // ...
    };

    this.resolve = function () {
        // ...
    };

    this.reject = function () {
        // ...
    }
}