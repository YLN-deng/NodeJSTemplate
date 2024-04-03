import authSchema from "./verify";

// 定义验证账号注册和登录表单数据的规则对象
const reg_login_schema = {
  body: {
    user_name: authSchema.user_name, // 使用 userSchema 中的 user_name 验证规则
    user_password: authSchema.user_password, // 使用 userSchema 中的 user_password 验证规则
  },
};

// 定义验证邮箱注册和登录表单数据的规则对象
const reg_login_email_schema = {
  body: {
    user_email: authSchema.user_email, // 使用 userSchema 中的 user_email 验证规则
    user_password: authSchema.user_password, // 使用 userSchema 中的 user_password 验证规则
  },
};

export { reg_login_schema, reg_login_email_schema };
