'use strict';

//引入gulp及各种插件;

var gulp = require('gulp'), //gulp前端自动化工作流
    changed = require('gulp-changed'), //只允许改动过的文件通过流
    imagemin = require('gulp-imagemin'), //图片压缩
    pngquant = require('imagemin-pngquant'), //png图片压缩
    cache = require('gulp-cache'), //图片缓存，图片替换才压缩
    uglify = require('gulp-uglify'), //压缩JS代码
    sass = require('gulp-sass'), //sass编译成CSS
    autoprefixer = require('gulp-autoprefixer'), //CSS3浏览器私有前缀处理
    htmlmin = require('gulp-htmlmin'), //压缩html
    contentIncluder = require('gulp-content-includer'), //includer处理器
    browserSync = require('browser-sync').create(), //浏览器同步测试工具
    reload = browserSync.reload;

//设置各种输入输出文件夹的位置;

var srcJS = './src/js/',  //JS源文件目录
    destJS = './dist/js/', //JS发行目录
    srcCSS = './src/css/', //SCSS源文件目录
    destCSS = './dist/css/', //CSS发行目录
    srcFont = './src/fonts/', //字体图标源文件目录
    destFont = './dist/fonts/', //字体图标发行目录
    srcImage = './src/img/', //图片源文件目录
    destImage = './dist/img/', //图片发行目录
    srcComp = './src/comp/', //组件文件源文件目录
    srcHtml = './src/', //页面文件源文件目录
    destHtml = './dist/'; //页面文件发行目录


//使用gulp js任务压缩JS;
gulp.task('js', function () {
    return gulp.src(srcJS+"*.js")
        // .pipe(uglify())
        .pipe(gulp.dest(destJS))
        .pipe(reload({stream: true}));

});

//使用gulp css启用任务编译SCSS添加浏览器私有属性并压缩;
gulp.task('css', function () {
    return gulp.src(srcCSS+"*.scss")
        .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'last 2 Explorer versions', 'Firefox >= 20', 'IOS 7', 'Android >= 4.0',],
            cascade: false,
            remove: true,
        }))
        .pipe(gulp.dest(destCSS))
        .pipe(reload({stream: true}));

});

//使用gulp img启用任务压缩图片
gulp.task('img', function () {
    gulp.src(srcImage+"*/*.{png,jpg,gif}")
        .pipe(cache(imagemin({
            progressive: true, //是否无损压缩jpg图片
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()] //使用pngquant深度压缩png图片
        })))
        .pipe(gulp.dest(destImage));
});
//把所有font扔进dist文件夹(不作处理);
gulp.task('font', function () {
    return gulp.src(srcFont+"*.*")
    .pipe(gulp.dest(destFont))
    .pipe(reload({stream: true}));
});

//组件变动重新编译全局html文件并刷新浏览器
gulp.task('comp',function () {
    return gulp.src(srcHtml+"*.html")
        .pipe(contentIncluder({  //include文件
            includerReg:/<!\-\-include\s+"([^"]+)"\-\->/g
        }))
        .pipe(gulp.dest(destHtml))
        .pipe(reload({stream: true}));
});

//把所有页面文件扔进dist文件夹(不作处理);
gulp.task('html', function () {
    return gulp.src(srcHtml+"*.html")
        .pipe(changed(destHtml))
        .pipe(contentIncluder({  //include文件
            includerReg:/<!\-\-include\s+"([^"]+)"\-\->/g
        }))
        //.pipe(htmlmin({
        //    removeComments: true,//清除HTML注释
        //    collapseWhitespace: true,//压缩HTML
        //    collapseBooleanAttributes: false,//省略布尔属性的值 <input checked="true"/> ==> <input />
        //    removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        //    removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        //    removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        //    minifyJS: false,//压缩页面JS
        //    minifyCSS: false//压缩页面CSS
        //}))
        .pipe(gulp.dest(destHtml))
        .pipe(reload({stream: true}));  

});

//使用gulp server启用此任务，以dist文件夹为基础,启动服务器;;

gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });
    gulp.watch(srcJS+"*.js", ['js']);
    gulp.watch(srcCSS+"*.scss", ['css']);
    gulp.watch(srcFont+"*.*", ['font']);
    gulp.watch(srcImage+"*.{png,jpg,gif}", ['img']);
    gulp.watch(srcComp+"*.html", ['comp']);
    gulp.watch(srcHtml+"*.html", ['html']);
    gulp.watch('dist').on('change', browserSync.reload);
});

//gulp默认任务(集体走一遍,然后开监听);

gulp.task('default', ['js', 'css','font','img','comp','html', 'server']);
