**Node 接口api服务**


**基于 Express TypeORM Typescript 搭建**

***

**安装运行**

```
npm install

npm run dev

```

**打包运行**

```
npm run build

npm run start
```

***

**运行项目环境**

 [安装 Node](https://blog.csdn.net/shi15926lei/article/details/134962893)
 [安装 Redis](https://blog.csdn.net/weixin_44893902/article/details/123087435)
 [安装 Mysql](https://blog.csdn.net/m0_52559040/article/details/121843945)
 [安装 Memcached](https://blog.csdn.net/ZCY5202015/article/details/133882508)

***

**配置文件**

```
# 运行环境
NODE_ENV = 'development'
# 端口
NODE_PORT = 8787
# 路由白名单
NODE_WHITE_LIST_ROUTES = '/auth/login,/auth/register,/auth/mailer'
# 重要表单请求频率限制
NODE_REPORT_REQUEST_LIMITS = '/users/update,/users/delete'
# token
# 加密和解密 token 的密匙
NODE_JWTSECRETKEY = "node . ^_^"
# token 的有效期
NODE_EXPIRESIN = "7d"
# 登录错误限流
# IP 每日最大错误尝试次数
NODE_LOGIN_NUMBER_OF_ERRORS_IP = 100
# 按用户名和 IP 划分的最大连续失败数
NODE_LOGIN_NUMBER_OF_ERRORS_USER_IP = 10
# 数据库
# 数据库地址
NODE_HOST = "localhost"
# 数据库用户名称
NODE_USER_NAME = "root"
# 数据库密码
NODE_PASSWORD = "root"
# 数据库
NODE_DATABASE = "tsnode"
# redis
# redis服务地址
NODE_REDIS_HOST = "127.0.0.1"
# redis密码
NODE_REDIS_PASSWORD = null
# redis服务端口
NODE_REDIS_PORT = 6379
#Memcached
# Memcached服务地址接口
NODE_MEMCACHED = '127.0.0.1:11211'
# 微信小程序
# 微信小程序appid
NODE_WECHATID = ""
# 微信小程序密钥
NODE_WECHATSECRET = ""
# QQ邮箱
# QQ邮箱地址
NODE_QQEMAIL_USER = ""
# QQ邮箱授权码
NODE_QQEMAIL_CODE = ""
# QQ邮箱并发数量
NODE_EMAIL_QUEUE = 10

```

***

