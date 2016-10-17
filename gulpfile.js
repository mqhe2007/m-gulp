'use strict';
//引入gulp及各种插件;
var gulp           = require('gulp'), //gulp前端自动化工作流
    argv           = require('yargs').argv,//接收命令行参数
    mkdirp         = require('mkdirp'),//node文件夹模块
    del            = require('del'),//删除文件或文件夹
    gulpif         = require('gulp-if'),//逻辑判断
    changedInPlace = require('gulp-changed-in-place'),//只允许改动过的文件通过流(对比编译前的文件)
    uglify         = require('gulp-uglify'), //压缩JS代码
    sass           = require('gulp-sass'), //sass编译成CSS
    autoprefixer   = require('gulp-autoprefixer'), //CSS3浏览器私有前缀处理
    concat         = require('gulp-concat'),//合并文件
    imagemin       = require('gulp-imagemin'), //图片压缩
    sourcemaps     = require('gulp-sourcemaps'),//生成源文件映射，便于调试
    jade           = require('gulp-jade'),//编译jade
    browserSync    = require('browser-sync').create(), //浏览器同步测试工具
    reload         = browserSync.reload,
    gulpSequence   = require('gulp-sequence');//按顺序执行任务

//设置各种输入输出文件夹的路径;
var paths = {
    src  : {
        libs   : "src/libs/",
        scripts: "src/js/",
        styles : "src/sass/",
        images : "src/img/",
        jade   : "src/views/"
    },
    build: {
        libs   : "build/public/libs/",
        scripts: "build/public/js/",
        styles : "build/public/css/",
        images : "build/public/img/",
        html   : "build/views/"
    }
};

//生成目录
gulp.task('mkdirs', function () {
    for (var x in paths) {
        for (var y in paths[x]) {
            mkdirp(paths[x][y]);
            console.log('生成目录', paths[x][y])
        }
        ;
    }
});

// 启动gulp,生成目录
gulp.task('default', ['mkdirs'], function () {
    console.log('\x1B[33m%s\x1b[0m', '请键入命令：\n（请使用以下项目开始启动项目）');
    console.log('1.gulp run -d      开始开发');
    console.log('2.gulp run -b      开始打包');
});

//gulp打包队列
gulp.task('run', function () {
    gulpSequence('clean', ['js', 'sass', 'moveFiles', 'img'], 'templates', 'server', function () {
        if (argv.b) { //打包环境
            console.log('\x1B[33m%s\x1b[0m', '打包部署环境准备完成')
        } else if (argv.d) { //开发环境
            console.log('\x1B[33m%s\x1b[0m', '开发环境准备完成')
        }
    });
});

//清空build目录
gulp.task('clean', function () {
    return del('build/*')
});

//处理js;
gulp.task('js', function () {
    return gulp.src(paths.src.scripts + "**/*.js")
        .pipe(sourcemaps.init())
        .pipe(gulpif(argv.b, uglify()))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(paths.build.scripts))
        .pipe(reload({stream: true}));

});

//转移引用库文件
gulp.task('moveFiles', function () {
    gulp.src(paths.src.libs + 'jquery/dist/jquery.min.js', {base: paths.src.libs}).pipe(gulp.dest(paths.build.libs));
    gulp.src(paths.src.libs + 'animate.css/animate.min.css', {base: paths.src.libs}).pipe(gulp.dest(paths.build.libs));
});

//处理SCSS
gulp.task('sass', function () {
    return gulp.src(paths.src.styles + "*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'iOS', 'Android']
        }))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(paths.build.styles))
        .pipe(reload({stream: true}));

});

//压缩图片
gulp.task('img', function () {
    return gulp.src(paths.src.images + "**/*.{png,jpg,gif}")
        .pipe(gulpif(argv.b,imagemin({
            progressive: true, //是否无损压缩jpg图片
            svgoPlugins: [{removeViewBox: false}]
        })))
        .pipe(gulp.dest(paths.build.images));
});

//编译jade
gulp.task('templates', function () {
    return gulp.src(paths.src.jade + '**/*.jade')
        .pipe(changedInPlace({firstPass: true}))
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(paths.build.html))
        .pipe(reload({stream: true}));

});

//启动服务器
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: "build/views"
        }
    });
    gulp.watch(paths.src.scripts + "*.js", ['js']);
    gulp.watch(paths.src.libs + "**/*.*", ['moveFiles']);
    gulp.watch(paths.src.styles + "*.scss", ['sass']);
    gulp.watch(paths.src.images + "**/*.{png,jpg,gif}", ['img']);
    gulp.watch(paths.src.jade + '**/*.jade', ['templates']);
    // gulp.watch(paths.build.html).on('change', browserSync.reload);
});
