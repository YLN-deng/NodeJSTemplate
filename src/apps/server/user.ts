import { Request, Response } from "express";
import { User } from "apps/models/User";
import connection from "@database/index";

/**
 * 查询用户信息
 * @param req 
 * @param res 
 * @returns 用户信息
 */
const getUserListService = async (req: Request, res: Response) => {
  const users = await connection.getRepository(User).find();
  return (res as any).AjaxResult.success(200, users);
};

/**
 * 查询单个用户信息
 * @param req 
 * @param res 
 * @returns 用户信息
 */
const getUserIDService = async (req: Request, res: Response) => {
    const { id } = req.params; 
      
    // 获取用户信息
    const user = await connection.getRepository(User)
      .createQueryBuilder("user")
      .select(["user.user_id", "user.user_name", "user.user_account", "user.user_email"]) // 指定要返回的字段
      .where("user.user_id = :id", { id }) // 使用参数绑定，确保安全
      .getOne();

    if (!user) {
      return (res as any).AjaxResult.bizFail(400,"用户不存在"); // 如果未找到用户，返回 400
    }

    // 返回用户信息
    return (res as any).AjaxResult.success(200,user); 
}

/**
 * 更新单个用户信息
 * @param req 
 * @param res 
 * @returns 更新后用户信息
 */
const updateUserService = async (req: Request, res: Response) => {
    const { id } = req.params; 

    // 获取要更新的用户信息
    const user = await connection.getRepository(User)
      .createQueryBuilder("user")
      .select(["user.user_id", "user.user_name", "user.user_account", "user.user_email"])
      .where("user.user_id = :id", { id })
      .getOne()

    // 判断user是否为空
    if (!user) {
      return (res as any).AjaxResult.bizFail(400,"用户不存在"); // 如果未找到用户，返回 400
    }

    // 将req.body对象赋值给user
    connection.getRepository(User).merge(user, req.body);

    // 保存req.body的对象
    const updatedUser = await connection.getRepository(User).save(user);
    return (res as any).AjaxResult.success(200, updatedUser);
}

/**
 * 删除用户信息
 * @param req 
 * @param res 
 * @returns 
 */
const deleteUserService = async (req: Request, res: Response) => {
    const { id } = req.params; 
    
    // 检查用户是否存在
    const user = await connection.getRepository(User).findOneBy({user_id: Number(id)});
    if (!user) {
      return (res as any).AjaxResult.bizFail(400,"该用户不存在")
    }

    // 如果用户存在，执行删除操作
    await connection.getRepository(User).delete(id); // 直接传递 userId
    return (res as any).AjaxResult.success(200);
}

export {
  getUserListService,
  getUserIDService,
  updateUserService,
  deleteUserService
}
