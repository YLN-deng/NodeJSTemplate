// 导入定义验证规则的包
import joi from "joi";
import userSchema from './verify';

// 验证更新用户基本信息的规则对象
const update_userinfo_schema = {
  body: {
    user_id: userSchema.user_id,       // 使用 userSchema 中的 user_id 验证规则
    user_name: userSchema.user_name,   // 使用 userSchema 中的 user_name 验证规则
    user_email: userSchema.user_email, // 使用 userSchema 中的 user_email 验证规则
  }
}

// 验证更新密码的规则对象
const update_password_schema = {
  body: {
    oldPwd: userSchema.user_password,  // 使用 userSchema 中的 user_password 验证规则
    newPwd: joi.string()
    .not(joi.ref('oldPwd'))       // 新密码不能与旧密码相同
    .pattern(/^[\S]{6,18}$/)      // 符合密码格式要求
    .required(),
  }
}

export {
  update_userinfo_schema,
  update_password_schema,
}
