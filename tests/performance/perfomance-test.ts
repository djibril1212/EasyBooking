const http = require('k6/http');
const k6 = require('k6');

module.exports.options = {
    vus: 10,
    duration: '30s',
};

module.exports.default = function homePage() {
    http.get('http://localhost:3000/');
    k6.sleep(1);
};

module.exports.default = function loginPage() {
    http.get('http://localhost:3000/login');
    k6.sleep(1);
};

module.exports.default = function registerPage() {
    http.get('http://localhost:3000/register');
    k6.sleep(1);
};

module.exports.default = function roomsPage() {
    http.get('http://localhost:3000/rooms');
    k6.sleep(1);
};


