import { blacklistManager } from "@common/BlacklistManager/BlacklistManager";
import { User } from "@models/User";
import connection from "@database/index";
import logger from "@utils/logger";
import {generateHash, comparePassword} from '@utils/bcrypt';

const authorise = async (account: string, password: string) => {
  try {
    // 创建用户实例信息
    let user;
    // 检测是否是邮箱，或者账号
    if(account.includes("@")) {
      user = await connection.getRepository(User).findOne({
        where: {
          user_email: account,
        },
      });
    }else {
      user = await connection.getRepository(User).findOne({
        where: {
          user_account: account,
        },
      });
    }

    if (user) {
      // 如果找到了用户，可以进行密码哈希验证
      const resultComparePassword = await comparePassword(password,user.user_password);
      if (resultComparePassword) {
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
        // 所有处理无误后返回token信息
        return {
          isLoggedIn: true,
          exists: true,
          token: token, // 将token对象返回
        };
      } else {
        // resultComparePassword为false时，密码不匹配
        return {
          isLoggedIn: false,
          exists: true,
          message: "密码错误",
        };
      }
    } else {
      // user为空时，用户不存在
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
