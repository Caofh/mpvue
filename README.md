# mpvue
mpvue空的示例项目

#开发文档

##1.使用本地静态资源构建
~~~
npm run dev
~~~
##2.使用cdn静态资源构建(上测试环境使用此指令)
~~~
npm run test
~~~

##3.使用cdn静态资源+压缩构建(上线使用此指令)
~~~
npm run build
~~~

#demo
##示例包含：
###1.小程序开发普通页面；
###2.小程序分包；
###3.小程序兼容原生代码；


##示例详解
###1.兼容原生小程序迁移：
###。配置src中的app.json，将原生文件夹作为分包
###。将原生开发文件夹复制到根目录（如mpvue/native）
###。在npm run build构建之后执行npm run copy（将native文件夹直接copy到dist/wx中）

###2.mpvue内部分包
###。配置src中的app.json
###。将要分包的文件夹添加到pages内(***只能添加到这)
###详见demo示例

