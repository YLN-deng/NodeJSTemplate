#!/usr/bin/env node

/**
 * 模块依赖关系。
 */
import app from '../app';
import http from 'http';
import errorHandler from "errorhandler";
import logger from '@utils/logger';

/**
 * 错误处理程序。 提供全栈
 */
if (process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}

/**
 * 从环境中获取端口并存储在 Express 中。
 */
const port = normalizePort(process.env.NODE_PORT || '8787');

app.set('port', port);

/**
 * 创建 HTTP 服务器。
 */

const server = http.createServer(app);

/**
 * 在所有网络接口上侦听提供的端口。
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * 将端口标准化为数字、字符串或 false。
 */

function normalizePort(val:string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * HTTP 服务器“错误”事件的事件侦听器。
 */

function onError(error:any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // 使用友好的消息处理特定的监听错误
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' 当前用户权限不足');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(bind + ' 端口已经被占用');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * HTTP 服务器“监听”事件的事件监听器。
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr!.port;

  // 显示服务端口
  logger.debug(`服务已启动 :>> ${bind}`);
}
