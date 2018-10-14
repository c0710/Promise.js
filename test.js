var P = require('./lib/index');


/*
function getId() {
    return new P(function (resolve, reject) {
        setTimeout(function () {
            console.log('get id.......');
            reject('id')
        }, 600)
    })
}

function getNameById(id) {
    return new P(function (resolve, reject) {
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
    return new P(
        (resolve, reject) => {
            console.log('async1 start');
            setTimeout(() => {
                resolve('async1 finished')
            }, 1000);
        }
    );
}

function async2() {
    return new P(
        (resolve, reject) => {
            console.log('async2 start');
            setTimeout(() => {
                resolve('async2 finished')
            }, 1000);
        }
    );
}

function async3() {
    return new P(
        (resolve, reject) => {
            console.log('async3 start');
            setTimeout(() => {
                resolve('async3 finished');
            }, 1000);
        }
    );
}
function sayHi() {
    console.log('hi')
}
function sayHello() {
    console.log('hello');
}
//
// async1()
//     .then(
//         data => {
//             console.log(data);
//             return async2();
//         })
//     .then(
//         data => {
//             console.log(data);
//             return async3();
//         }
//     )
//     .then(
//         data => {
//             console.log(data);
//         }
//     );

var after1s = new P(function (resolve) {
        setTimeout(function () {
            resolve('after 1s')
        }, 1000)
    })

var after2s = new P(function (resolve) {
        setTimeout(function () {
            resolve('after 2s')
        }, 2000)
    })


var after3s = new P(function (resolve) {
        setTimeout(function () {
            resolve('after 3s')
        }, 3000)
    })


// var p1 = P.resolve(async1()),
//     p2 = P.resolve(2),
//     p3 = P.resolve(3);


P.race([after3s, after1s, after2s]).then(function (result) {
    console.log('result is '+ result)
})