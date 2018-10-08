var P = require('./lib/index');


function getId() {
    return new P(function (resolve, reject) {
        setTimeout(function () {
            console.log('get id.......');
            resolve('id')
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
getId()
    .then(getNameById)
    .then(sayName, function (err) {
        console.log(err)
    })