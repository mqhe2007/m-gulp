'use strict'
//引入gulp及各种插件;
let gulp = require('gulp'), // gulp前端自动化工作流
  mkdirp = require('mkdirp'), // node文件处理模块
  del = require('del'), // 删除文件或文件夹
  gulpif = require('gulp-if'), //逻辑判断
  changedInPlace = require('gulp-changed-in-place'), // 只允许改动过的文件通过流(对比编译前的文件)
  uglify = require('gulp-uglify'), // 压缩JS代码
  autoprefixer = require('gulp-autoprefixer'), // CSS私有前缀处理
  imagemin = require('gulp-imagemin'), // 图片压缩
  stylus = require('gulp-stylus'),
  sourcemaps = require('gulp-sourcemaps'), // 生成源文件映射，便于调试
  browserSync = require('browser-sync').create(), // 浏览器同步测试工具
  reload = browserSync.reload,
  gulpSequence = require('gulp-sequence'), // 按顺序执行任务
  rev = require('gulp-rev'), // 为资源加上版本号
  revRewrite = require('gulp-rev-rewrite'), // 把html中的资源替换为加上版本号的资源
  babel = require('gulp-babel'),
  revDelete = require('gulp-rev-delete-original')

//设置各种输入输出文件夹的路径;
let paths = {
  src: {
    libs: 'src/libs/',
    scripts: 'src/scripts/',
    styles: 'src/styles/',
    images: 'src/images/',
    html: 'src/html/'
  },
  build: {
    html: 'build/',
    libs: 'build/public/libs/',
    scripts: 'build/public/scripts/',
    styles: 'build/public/styles/',
    images: 'build/public/images/'
  }
}

// 初始化工程（生成工程目录）
gulp.task('init', function() {
  for (let x in paths) {
    for (let y in paths[x]) {
      mkdirp(paths[x][y])
      console.log('生成：', paths[x][y])
    }
  }
})

// gulp的默认任务，此处用来做任务列表提醒
gulp.task('default', function() {
  console.log('\x1B[33m%s\x1b[0m', '请使用以下命令启动任务：')
  console.log('1、gulp dev -启动开发服务')
  console.log('2、gulp build -启动打包服务')
})

// 开启glup工作流
gulp.task(
  'start',
  gulpSequence('clean', ['js', 'style', 'lib', 'image'], 'hash', 'html', 'server')
)

// 清空build目录
gulp.task('clean', function() {
  return del('build/*')
})

// 处理js
gulp.task('js', function() {
  del.sync(paths.build.scripts + '*')
  console.log('删除历史脚本')
  return gulp
    .src(paths.src.scripts + '**/*.js')
    .pipe(gulpif(process.env.NODE_ENV === 'production', sourcemaps.init()))
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
    .pipe(gulpif(process.env.NODE_ENV === 'production', sourcemaps.write()))
    .pipe(gulp.dest(paths.build.scripts))
    .pipe(reload({ stream: true }))
})

//引用库处理
gulp.task('lib', function() {
  return gulp
    .src(paths.src.libs + '**/*.min.js')
    .pipe(gulp.dest(paths.build.libs))
})

//处理样式表
gulp.task('style', function() {
  del.sync(paths.build.styles + '*')
  console.log('删除历史样式表')
  return gulp
    .src(paths.src.styles + '*.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.build.styles))
    .pipe(reload({ stream: true }))
})

// 为css,js添加版本号

gulp.task('hash', () => {
  del.sync(paths.build.html + 'public/rev-manifest.json')
  console.log('删除历史替换清单')
  return gulp
    .src([paths.build.scripts + '**/*', paths.build.styles + '**/*'], {base: 'build'})
    .pipe(rev())
    .pipe(revDelete())
    .pipe(gulp.dest('build'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('build/public'))
})

//压缩图片
gulp.task('image', function() {
  return gulp
    .src(paths.src.images + '**/*.{png,jpg,gif}')
    .pipe(
      gulpif(
        process.env.NODE_ENV === 'production',
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.jpegtran({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
          })
        ])
      )
    )
    .pipe(gulp.dest(paths.build.images))
    .pipe(reload({ stream: true }))
})

//编译html
gulp.task('html', function() {
  const manifest = gulp.src('build/public/rev-manifest.json')
  return gulp
    .src(paths.src.html + '**/*.html')
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(revRewrite({ manifest }))
    .pipe(gulp.dest(paths.build.html))
    .pipe(reload({ stream: true }))
})

//启动服务器
gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: 'build'
    }
  })
  gulp.watch('*.js', { cwd: paths.src.scripts }, ['js'])
  gulp.watch('**/*.min.js', { cwd: paths.src.libs }, ['lib'])
  gulp.watch('*.styl', { cwd: paths.src.styles }, function(event) {
    console.log(event.type)
    gulpSequence('style', 'hash', 'html')()
  })
  gulp.watch('**/*.{png,jpg,gif}', { cwd: paths.src.images }, ['image'])
  gulp.watch('**/*.html', { cwd: paths.src.html }, ['html'])
})
