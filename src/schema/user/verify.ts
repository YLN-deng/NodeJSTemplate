// 导入定义验证规则的包
import joi from "joi";

// 定义用户数据验证规则对象
const userSchema = {
  // 用户ID验证规则
  user_id: joi
    .number()      // 必须是数字类型
    .integer()     // 必须是整数类型
    .min(1)        // 必须大于等于1
    .required(),   // 必填字段

  // 用户电子邮件地址验证规则
  user_email: joi
    .string()      // 字符串类型
    .email()       // 符合电子邮件地址格式
    .required(),   // 必填字段

  // 用户名验证规则
  user_name: joi
    .string()      // 字符串类型
    .alphanum()    // 只能包含字母和数字
    .min(1)        // 最小长度为1
    .max(16)       // 最大长度为16
    .required(),   // 必填字段

  // 用户密码验证规则
  user_password: joi
    .string()                          // 字符串类型
    .pattern(/^[\S]{6,18}$/)           // 由6到18个非空字符组成
    .required(),                       // 必填字段
};

// 导出用户数据验证规则对象
export default userSchema;
