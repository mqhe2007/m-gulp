# m-gulp

基于gulp的前端自动化工作流配置。

**工作流工具** 只辅助开发人员进行复杂，单调，琐碎重复的工作（见自动处理项章节）。不涉及具体开发技术框架及选型，任何umd类型的库，框架，包都可以直接使用。

### 自动处理项

- [x] JS压缩

- [x] stylus编译

- [x] autoprefixer

- [x] 图片压缩

- [x] include

- [x] 多端同步

- [x] ES6语法编写

### 使用

1、`yarn init` 初始化工程创建目录

目录结构见目录说明章节

2、`yarn dev` 启动开发服务器

此命令使build目录产生的文件可直接作为部署文件，建议仅作测试部署之用。具体内容参见终端打印信息。

3、`yarn build` 编译项目

通常情况下，开发完毕准备发布生产包时需要使用此命令，因为此命令比`yarn build`命令多了文件的压缩、混淆等处理过程。

### 目录说明

```
build          工作流产出目录
 ├ public      资源文件
src            源文件目录
 ├ components  html公用代码片段（组件）
 ├ images      图片资源
 ├ libs        三方库资源
 ├ pages       html文件（页面级）
 ├ scripts     脚本文件
 ├ styles      样式文件（stylus）
.gitignore     git忽略文件
gulpfile.js    gulp配置文件
package.json   npm包配置文件
README.md      自述文件
yarn.lock      依赖锁定文件
```

请注意，初始化命令创建的目录结构不可更改！
如果需要修改目录结构，需修改gulpfile.js文件配置。