# 网维工作系统 工单快速录入系统

## USE

### 构建页面

``` bash
npm i
npm run build
# 目标页面和资源/脚本 均在 dist目录下了
```

[构建脚本来源](https://github.com/hangxingliu/fe-build-scripts)

### 线上部署

复制dist目录下的内容到服务器静态资源目录下的任意路径即可(然后访问对应路径的URL即可)   
**记得删除掉`dist/scripts/`下面的`.map`文件**

### 本地测试

``` bash
echo '{"host": "服务器域名,例如: xxx.xxx.com"}' > server.config.json
npm run server
# 然后访问http://127.0.0.1:8000即可
```

## TODO

[TODO.md]()

## LICENSE

[Apache-2.0](LICENSE)

## Author

[LiuYue](https://github.com/hangxingliu)