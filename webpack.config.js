
//webpack.config
module.exports={
    entry:{
        index: './src/calendarXiaer.js',
    },
    output:{
        filename: '[name].js',
        path:__dirname+'/build',
    },
    module:{
        loaders:[
            {
                //cnpm install --save-dev babel-preset-env babel-cli babel-loader,支持es6转es5
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=8192'
            }
        ]
    }
};