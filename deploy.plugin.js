var fs = require('fs');
var path = require('path');
var Client = require('ftp');
var c = new Client();

var waitSendfiles = [];
var cacheDir = {};
var BLASH_REG = /\\/g;

function getFTPFilePath(file, options){
    var fromPath = options.fromPath;
    var destPath = options.destPath;
    var relativeFilePath = path.relative(fromPath, file);
    var fullpath = path.join(destPath, relativeFilePath).replace(BLASH_REG,'/');
    return fullpath;
}
debugger
var getAllWaitFilePath = function(dir, options){
    if(!(fs.existsSync(dir) && fs.statSync(dir) && (fs.statSync(dir).isDirectory()))){
        console.log(dir, ' is not a exist a directory');
        return;
    }
    var allFilesDirectoris = fs.readdirSync(dir);
    allFilesDirectoris.forEach(function(file){
        var filepath = path.join(dir, file);
        var fileStat = fs.statSync(filepath);
        var isFile = fileStat && fileStat.isFile();
        var isDirectory = fileStat && fileStat.isDirectory();
        if(isFile){
            debugger
            if(options.exclude && options.exclude.test(filepath)) return;
            var putPath = getFTPFilePath(filepath, options);
            waitSendfiles.push({
                fromPath:filepath,
                putPath:putPath
            });
        }else if(isDirectory){
            return getAllWaitFilePath(filepath, options);
        }
    });
};
function sendFile(fromPath, putPath){
    var dirname = path.dirname(putPath);
    if(!cacheDir[dirname]) {
        c.mkdir(dirname, function(){
            if(arguments[0] && (arguments[0].message).indexOf('File exists') !== -1){
                console.log('file exists ', dirname);
                return;
            }
            console.log('FTP mkdir ', dirname);
            cacheDir[dirname] = 1;
        });
    }
    console.log('FTP PUT ', putPath)
    c.put(fromPath, putPath, function(err){
        if(err) throw err;
        c.end();
    });
}

function DeployFtpWebpackPlugin(config, options){
    if(config){
        if(config.secure){
            config.secureOptions = {
                requestCert : true,
                rejectUnauthorized: false
            };
        }
        this.config = config;
    }
    this.options = options;
}

DeployFtpWebpackPlugin.prototype.apply = function(compiler){
    // console.dir(compiler);
    var _config = this.config;
    var _options = this.options;
    compiler.plugin('run', function(){
        console.log('The webpack build process is starting!');
    });
    compiler.plugin('done', function(stats){
        debugger;
        console.dir(stats)
        console.log('The webpack build is done')

        // c.connect({
        //     host:'61.135.251.132',
        //     port:'16321',
        //     user:'marong',
        //     password:'123qwe!@#',
        //     secure:true,
        //     secureOptions: {
        //         requestCert:true,
        //         rejectUnauthorized: false
        //     }
        // });

        _config && c.connect(_config);

        c.on('ready', function(){
            getAllWaitFilePath(_options.fromPath, _options);
            waitSendfiles.forEach(function(fileObj){
                if(fileObj && fileObj.fromPath, fileObj.putPath){
                    sendFile(fileObj.fromPath, fileObj.putPath);
                }
            });
        });


    });
};

module.exports = DeployFtpWebpackPlugin;
