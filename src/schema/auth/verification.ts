import {
    IsAlphanumeric,
    IsNumberString,
    IsNotEmpty,
    MinLength,
    MaxLength,
    IsString,
    IsEmail,
    Length
} from 'class-validator';

// 账号登录验证类
export class AuthAccount {
    @IsString()                                                         // 检查该值是否为字符串
    @MinLength(6, { message: "账号长度不能小于 6 位" })                   // 检查字符串的长度是否不小于给定的数字
    @MaxLength(18, { message: "账号长度不能多于 18 位" })                 // 检查字符串的长度是否不超过给定数字
    @IsAlphanumeric(undefined, {message:"账号仅包含字母和数字"})          // 检查字符串是否仅包含字母和数字
    @IsNotEmpty({ message: "账号不能为空" })
    user_account!: string;

    @IsString()
    @MinLength(6, { message: "密码长度不能小于 6 位" })                    // 检查字符串的长度是否不小于给定的数字
    @MaxLength(18, { message: "密码长度不能多于 18 位" })                  // 检查字符串的长度是否不超过给定数字
    @IsNotEmpty({ message: "密码不能为空" })
    @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})
    user_password!: string;

    @IsString()
    @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})                   
    @Length(4, 4, { message: "验证码只能是4位" })                         // 检查字符串的长度是否在某个范围内。
    @IsNotEmpty({ message: "验证码不能为空" })
    user_code!: string;
}

// 邮箱登录验证类
export class AuthEmail {
    @IsString()
    @IsEmail({}, { message: "邮箱地址格式不正确" })
    @IsNotEmpty({ message: "邮箱地址不能为空" })
    user_email!: string;

    @IsString()
    @MinLength(6, { message: "密码长度不能小于 6 位" })                    // 检查字符串的长度是否不小于给定的数字
    @MaxLength(18, { message: "密码长度不能多于 18 位" })                  // 检查字符串的长度是否不超过给定数字
    @IsNotEmpty({ message: "密码不能为空" })
    @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})
    user_password!: string;

    @IsString()
    @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})                   
    @Length(4, 4, { message: "验证码只能是4位" })                         // 检查字符串的长度是否在某个范围内。
    @IsNotEmpty({ message: "验证码不能为空" })
    user_code!: string;
}

// 注册验证类
export class RegisterEmail {
    @IsString()
    @IsEmail({}, { message: "邮箱地址格式不正确" })
    @IsNotEmpty({ message: "邮箱地址不能为空" })
    user_email!: string;

    @IsString()
    @IsNumberString({}, { message: "验证码只能是数字"})                     // 检查字符串是否为数字                        
    @Length(6, 6, { message: "验证码只能是6位数" })                         // 检查字符串的长度是否在某个范围内。
    @IsNotEmpty({ message: "验证码不能为空" })
    user_code!: string;

    @IsString()
    @MinLength(6, { message: "密码长度不能小于 6 位" })                    // 检查字符串的长度是否不小于给定的数字
    @MaxLength(18, { message: "密码长度不能多于 18 位" })                  // 检查字符串的长度是否不超过给定数字
    @IsNotEmpty({ message: "密码不能为空" })
    @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})
    user_password!: string;
}
