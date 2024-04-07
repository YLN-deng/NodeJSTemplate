import {
    IsAlphanumeric,
    IsNotEmpty,
    MinLength,
    MaxLength,
    IsString,
    Matches,
    IsEmail
} from 'class-validator';

// 账号登录验证类
export class AuthAccount {
    @IsString()                                                         // 检查该值是否为字符串
    @MinLength(6, { message: '账号长度不能小于 6 位' })                    // 检查字符串的长度是否不小于给定的数字
    @MaxLength(18, { message: '账号长度不能多于 18 位' })                  // 检查字符串的长度是否不超过给定数字
    @IsAlphanumeric()                                                   // 检查字符串是否仅包含字母和数字
    @IsNotEmpty({ message: "账号不能为空" })
    user_account!: string;

    @IsString()
    @MinLength(6, { message: '密码长度不能小于 6 位' })                    // 检查字符串的长度是否不小于给定的数字
    @MaxLength(18, { message: '密码长度不能多于 18 位' })                  // 检查字符串的长度是否不超过给定数字
    @IsNotEmpty({ message: "密码不能为空" })
    @Matches(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{6,18}$/, { message: '密码由字母和数字组成' })
    user_password!: string;
}

// 邮箱登录验证类
export class AuthEmail {
    @IsString()
    @IsEmail({}, { message: "邮箱地址格式不正确" })
    @IsNotEmpty({ message: "邮箱地址不能为空" })
    user_email!: string;

    @IsString()
    @MinLength(6, { message: '密码长度不能小于 6 位' })                    // 检查字符串的长度是否不小于给定的数字
    @MaxLength(18, { message: '密码长度不能多于 18 位' })                  // 检查字符串的长度是否不超过给定数字
    @IsNotEmpty({ message: "密码不能为空" })
    @Matches(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{6,18}$/, { message: '密码由字母和数字组成' })
    user_password!: string;
}