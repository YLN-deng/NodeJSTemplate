import bcrypt from 'bcrypt';

/**
 * 生成哈希密码
 * @param plainTextPassword 用户输入密码
 * @returns 
 */
const generateHash = async (plainTextPassword:string) => {
    try {
        const saltRounds = 10; // 哈希轮数，控制哈希算法的复杂度
        const hash = await bcrypt.hash(plainTextPassword, saltRounds);
        return hash;
    } catch (error) {
        throw new Error('密码哈希生成失败');
    }
};

/**
 * 验证密码是否匹配哈希密码
 * @param plainTextPassword 
 * @param hashedPassword 
 * @returns 
 */
const comparePassword = async (plainTextPassword:string, hashedPassword:string) => {
    try {
        const match = await bcrypt.compare(plainTextPassword, hashedPassword);
        return match;
    } catch (error) {
        throw new Error('密码比较失败');
    }
};

export { generateHash, comparePassword };
