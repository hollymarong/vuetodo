var path = require('path')
var fs = require('fs')
var webpack = require('webpack')
var htmlWebpackPlugin = require('html-webpack-plugin')
var SftpWebpackPlugin = require('sftp-webpack-plugin')
var postcss = require('postcss')
var postcssSprites = require('postcss-sprites')
var postcssAssets = require('postcss-assets')
var postcssNext = require('postcss-cssnext')
var updateRule = require('postcss-sprites/lib/core').updateRule;
var packageJson = JSON.parse(fs.readFileSync('package.json'), 'uft-8');
var ExtractTextPlugin = require('extract-text-webpack-plugin')

var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var DeployFtpWebpackPlugin = require('./deploy.plugin');
// process.traceDeprecation = true;
module.exports = {
    entry:{
        main:'./src/main.js',
        main2:'./src/main2.js',
        vender:Object.keys(packageJson.dependencies)
    },
    output:{
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]-[hash].js'
    },
    module: {
        rules: [
            {
                test:/\.js$/,
                loader:'babel-loader',
                exclude: /node_modules/
            },
            {
                test:/\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use:'css-loader?importLoaders=1!postcss-loader'
                })
                // loader: 'style-loader!css-loader?importLoaders=1!postcss-loader'
            },
            {
                test:/\.scss/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader!postcss-loader!sass-loader'
                })
                // loader:'style-loader!css-loader!postcss-loader!sass-loader'
            },
            {
                test:/\.(jpg|png|svg|gif)$/,
                loader: 'url-loader',
                query: {
                    limit:10,
                    name: 'assets/[name]-[hash:5].[ext]'
                }
            }
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            compress:{
                warnings: true //查看Uglify警告信息
            }
        }),
        new ExtractTextPlugin("style.css"),
        //使jquery变成全局变量，不用在js文件中require('jquery')
        // new webpack.ProvidePlugin({
        //     $:'jquery'
        // }),
        new htmlWebpackPlugin({
            title:'todo MVC created by marong',
            filename:'index.html',
            template:'index.html',
            inject:'body'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name:'common',
            filename:'common.js',
            chunks: ['main', 'main2']
        }),
        // new DeployFtpWebpackPlugin({
        //     host:'61.135.251.132',
        //     port:'16321',
        //     user:'marong',
        //     password:'123qwe!@#',
        //     secure:true
        // }, {
        //     fromPath:'./dist',
        //     destPath:'/f2e/products/vuetodo/',
        //     exclude:/\.html$/g

        // }),
        new webpack.LoaderOptionsPlugin({
            debug:true,
            options: {
                context:__dirname,
                postcss:function(){
                    return [
                        postcssAssets({
                            loadPaths: ['./src/images/'],
                            relative: true
                        }),
                        postcssNext({
                            browsers: ["> 1%", "last 2 version", "Android >= 4.0"]
                        }),
                        postcssSprites({
                            stylesheetPath: './src/css',
                            spritePath: './src/images/outputsprite',
                            outputDimensions: true,
                            skipPrefix: true,
                            filterBy: function(image) {
		                            if (!/sprite/.test(image.url)) {
			                              return Promise.reject();
		                            }

		                            return Promise.resolve();
	                          },
                            groupBy: function(image) {
		                            // if (image.url.indexOf('shapes') === -1) {
			                          //     return Promise.reject(new Error('Not a shape image.'));
		                            // }

		                            // return Promise.resolve('shapes');
                                let groups = /\/images\/sprites\/(.*?)\/.*/gi.exec(image.url);
                                let groupName = groups ? groups[1] : 'other';
                                image.retina = true;
                                image.ratio = 1;
                                if (groupName) {
                                    let ratio = /@(\d+)x$/gi.exec(groupName);
                                    if (ratio) {
                                        ratio = ratio[1];
                                        while (ratio > 10) {
                                            ratio = ratio / 10;
                                        }
                                        image.ratio = ratio;
                                    }
                                }
                                return Promise.resolve(groupName);
	                          },
	                          hooks: {
		                            onUpdateRule: function(rule, token, image) {
			                              // Use built-in logic for background-image & background-position
			                              updateRule(rule, token, image);

			                              ['width', 'height'].forEach(function(prop) {
				                                var value = image.coords[prop];
				                                if (image.retina) {
					                                  value /= image.ratio;
				                                }
				                                rule.insertAfter(rule.last, postcss.decl({
					                                  prop: prop,
					                                  value: value + 'px'
				                                }));
			                              });
		                            }
	                          }
                        })
                    ]
                },
            }
        })
    ],
    resolve:{
        alias: {
            vue: 'vue/dist/vue.js'
        }
    },
    devServer: {
        port:9000,
        contentBase: './dist',
        historyApiFallback: true,
        noInfo: true
    },
    devtool: '#eval-source-map'
};
