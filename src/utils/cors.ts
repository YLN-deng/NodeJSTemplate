import cors from "cors";

// 允许跨域请求的来源
const allowedOrigins = ["http://localhost:8787", "http://example2.com"];

// 封装的 CORS 中间件配置函数
export const corsOptions = (): cors.CorsOptions => {
  return {
    origin: function (origin, callback) {
      // 检查请求来源是否在允许列表中
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("跨域请求"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], //自定义头部
    credentials: true,
  };
};
