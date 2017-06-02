var fs = require('vinyl-fs');
var vftp = require('vinyl-ftp');
debugger;

var conn = new vftp({
    host:'61.135.251.132',
    port:'16321',
    user:'marong',
    password:'123qwe!@#',
    parallel: 5,
    secure:true,
    secureOptions: {
        requestCert:true,
        rejectUnauthorized: false
    }
});


// var conn = new vftp({
//     host:'47.91.156.125',
//     port:'21',
//     user:'marongftp',
//     password:'marongftp',
//     parallel: 5
// });


fs.src(['./dist/**/**'], {buffer:false}).pipe(conn.dest('/f2e/products/vuetodo/'));
// fs.src(['./dist/**/**'], {buffer:false}).pipe(conn.dest('/tmp/test/vuetodotest/'));
