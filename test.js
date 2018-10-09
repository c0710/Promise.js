var P = require('./lib/index');


/*
function getId() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log('get id.......');
            reject('id')
        }, 600)
    })
}

function getNameById(id) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log('get name')
            resolve('wang' + id)
        }, 300)
    })
}

function sayName(name) {
    console.log('My name is 111' + name)
}
function sayErr(err) {
    console.log('err: ' + err)
}
P.reject('cat').then(getId)
    .then(getNameById)
    .then(sayName).catch(function (err) {
    console.log('catch err ' + err)
})
*/

function async1() {
    return new Promise(
        (resolve, reject) => {
            console.log('async1 start');
            setTimeout(() => {
                resolve('async1 finished')
            }, 1000);
        }
    );
}

function async2() {
    return new Promise(
        (resolve, reject) => {
            console.log('async2 start');
            setTimeout(() => {
                resolve('async2 finished')
            }, 1000);
        }
    );
}

function async3() {
    return new Promise(
        (resolve, reject) => {
            console.log('async3 start');
            setTimeout(() => {
                resolve('async3 finished');
            }, 1000);
        }
    );
}

async1()
    .then(
        data => {
            console.log(data);
            return async2();
        })
    .then(
        data => {
            console.log(data);
            return async3();
        }
    )
    .then(
        data => {
            console.log(data);
        }
    );