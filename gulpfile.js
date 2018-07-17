'use strict'
//引入gulp及各种插件;
let gulp = require('gulp'), // gulp前端自动化工作流
  mkdirp = require('mkdirp'), // node文件处理模块
  del = require('del'), // 删除文件或文件夹
  gulpif = require('gulp-if'), //逻辑判断
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
  fileinclude = require('gulp-file-include')

//设置各种输入输出文件夹的路径;
let paths = {
  src: {
    libs: 'src/libs/',
    scripts: 'src/scripts/',
    styles: 'src/styles/',
    images: 'src/images/',
    pages: 'src/pages/',
    components: 'src/components/'
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

// 开启glup开发工作流
gulp.task(
  'dev',
  gulpSequence('clean', ['js', 'style', 'lib', 'image'], 'page', 'server')
)

// 开启glup打包工作流
gulp.task('build', () => {
  gulpSequence('clean', ['js', 'style', 'lib', 'image'], 'page')(() => {
    console.log('build完成')
  })
})

// 清空build目录
gulp.task('clean', function() {
  return del('build/*')
})

// 处理js
gulp.task('js', function() {
  del.sync(paths.build.scripts + '*')
  return gulp
    .src(paths.src.scripts + '**/*.js')
    .pipe(gulpif(process.env.NODE_ENV === 'production', sourcemaps.init()))
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
    .pipe(rev())
    .pipe(gulpif(process.env.NODE_ENV === 'production', sourcemaps.write('./')))
    .pipe(gulp.dest(paths.build.scripts))
    .pipe(
      rev.manifest('build/public/rev-manifest.json', {
        base: 'build/public',
        merge: true
      })
    )
    .pipe(gulp.dest('build/public'))
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
  return gulp
    .src(paths.src.styles + '*.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(autoprefixer())
    .pipe(rev())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.build.styles))
    .pipe(
      rev.manifest('build/public/rev-manifest.json', {
        base: 'build/public',
        merge: true
      })
    )
    .pipe(gulp.dest('build/public'))
    .pipe(reload({ stream: true }))
})

//压缩图片
gulp.task('image', function() {
  return gulp
    .src(paths.src.images + '**/*')
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

//编译页面
gulp.task('page', function() {
  const manifest = gulp.src('build/public/rev-manifest.json')
  return gulp
    .src(paths.src.pages + '**/*.html')
    .pipe(fileinclude())
    .pipe(revRewrite({ manifest }))
    .pipe(gulp.dest(paths.build.html))
    .pipe(reload({ stream: true }))
})

//页面重载资源
gulp.task('reload', function() {
  const manifest = gulp.src('build/public/rev-manifest.json')
  return gulp
    .src(paths.src.pages + '**/*.html')
    .pipe(fileinclude())
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
  gulp.watch('*.js', { cwd: paths.src.scripts }, function(event) {
    gulpSequence('js', 'reload')()
  })
  gulp.watch('**/*', { cwd: paths.src.libs }, ['lib'])
  gulp.watch('*.styl', { cwd: paths.src.styles }, function(event) {
    gulpSequence('style', 'reload')()
  })
  gulp.watch('**/*', { cwd: paths.src.images }, ['image'])
  gulp.watch('**/*', { cwd: paths.src.pages }, ['page'])
  gulp.watch('**/*', { cwd: paths.src.components }, ['page'])
})
