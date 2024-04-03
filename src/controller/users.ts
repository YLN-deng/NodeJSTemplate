import { Request, Response } from "express";
import logger from "@utils/logger";

import { User } from "@models/User";
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
      (res as any).AjaxResult.success(200, users);
    } catch (error) {
      // 处理错误
      logger.error("获取用户时发生错误：", error);
      (res as any).AjaxResult.fail(500);
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
      const id: number = parseInt(req.params.id); // 对 req.params.id 进行类型断言
      console.log('id :>> ', id);
      if (!id || isNaN(id)) {
        (res as any).AjaxResult.validateFailed(400);
      }

      const results = await connection.getRepository(User).findOneBy({
        user_id: id,
      });
      (res as any).AjaxResult.success(200, results);
    } catch (error) {
      // 处理错误
      logger.error("根据ID获取用户时发生错误：", error);
      (res as any).AjaxResult.fail(500);
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
      const id: number = parseInt(req.params.id); // 对 req.params.id 进行类型断言

      // 判断id是否为number或者空
      if (!id || isNaN(id)) {
        (res as any).AjaxResult.validateFailed(400);
      }

      // 判断req.body是否为空
      if (!Object.keys(req.body).length) {
        (res as any).AjaxResult.validateFailed(400);
      }

      // 获取用户数据
      const user = await connection.getRepository(User).findOneBy({
        user_id: id,
      });

      // 判断user是否为空
      if (!user) {
        (res as any).AjaxResult.validateFailed(400);
      } else {
        // 将req.body对象赋值给user
        connection.getRepository(User).merge(user, req.body);
        // 保存req.body的对象
        const results = await connection.getRepository(User).save(user);
        (res as any).AjaxResult.success(200, results);
      }
    } catch (error) {
      // 处理错误
      logger.error("更新用户信息时发生错误：", error);
      (res as any).AjaxResult.fail(500);
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
      const results = await connection.getRepository(User).delete(req.params.id);
      (res as any).AjaxResult.success(200);
    } catch (error) {
      // 处理错误
      logger.error("删除用户信息时发生错误：", error);
      (res as any).AjaxResult.fail(500);
    }
  };
}

// 创建一个上述类的一个实例，将其导出
export const usersController = new UsersController();
