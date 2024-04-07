import { blacklistManager } from "@common/BlacklistManager/BlacklistManager";
import { User } from "@models/User";
import connection from "@database/index";
import logger from "@utils/logger";

const authorise = async (account: string, password: string) => {
  try {
    const user = await connection.getRepository(User).findOne({
      where: {
        user_account: account,
      },
    });

    if (user) {
      // 如果找到了用户，可以进行密码验证
      if (user.user_password === password) {
        // 获取token加密和解密的密匙
        const secretKey = process.env.NODE_JWTSECRETKEY;
        // 获取失败返回错误信息
        if (!secretKey)
          return { isLoggedIn: false, exists: false, message: "凭证获取失败" };
        // token 生成信息
        const payload = {
          user_id: user.user_id,
          user_name: user.user_name,
          user_account: user.user_account,
          user_email: user.user_email,
        };
        // 生成 token
        const token = await blacklistManager.generateJWT( payload, secretKey, "1h" );
        if (!token) {
          return {
            isLoggedIn: false,
            exists: true,
            message: "生成会话错误",
          };
        }
        return {
          isLoggedIn: true,
          exists: true,
          token: token, // 将token对象返回
        };
      } else {
        // 密码不匹配
        return {
          isLoggedIn: false,
          exists: true,
          message: "账号或密码错误",
        };
      }
    } else {
      // 用户不存在
      return {
        isLoggedIn: false,
        exists: false,
        message: "用户不存在",
      };
    }
  } catch (error:any) {
    // 处理数据库查询错误
    logger.error("数据库查询错误:", error);
    return {
      isLoggedIn: false,
      exists: false,
      message: error,
    };
  }
};

export { authorise };
