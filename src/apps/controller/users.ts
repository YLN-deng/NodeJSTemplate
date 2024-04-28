import { Request, Response } from "express";
import logger from "@utils/logger";

import { User } from "apps/models/User";
import connection from "@database/index";

class UsersController {
  /**
   * 查询所有用户
   * @param req
   * @param res
   * @returns
   */
  getUserList = async (req: Request, res: Response) => {
    try {
      const users = await connection.getRepository(User).find();
      return (res as any).AjaxResult.success(200, users);
    } catch (error) {
      // 处理错误
      logger.error("获取用户时发生错误：", error);
      return (res as any).AjaxResult.fail(500);
    }
  };

  /**
   * 查询单个用户
   * @param req
   * @param res
   * @returns
   */
  getUserID = async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
      // 处理错误
      logger.error("查询单个用户 ID 失败:", error);
      return (res as any).AjaxResult.fail(500);
    }
  };

  /**
   * 更新用户信息
   * @param req
   * @param res
   * @returns
   */
  updateUser = async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
      // 处理错误
      logger.error("更新用户信息时发生错误：", error);
      return (res as any).AjaxResult.fail(500);
    }
  };

  /**
   * 删除用户信息
   * @param req
   * @param res
   * @returns
   */
  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params; 
    
      // 检查用户是否存在
      const user = await connection.getRepository(User).findOneBy({user_id: Number(id)});
      if (!user) {
        return (res as any).AjaxResult.bizFail(400,"该用户不存在")
      }
    
      // 如果用户存在，执行删除操作
      await connection.getRepository(User).delete(id); // 直接传递 userId
      return (res as any).AjaxResult.success(200);
    } catch (error) {
      // 处理错误
      logger.error("Error deleting user:", error);
      return (res as any).AjaxResult.fail(500);
    }
  };
}

// 创建一个上述类的一个实例，将其导出
export const usersController = new UsersController();
