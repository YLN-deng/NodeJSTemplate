import { Request, Response } from "express";
import logger from "@utils/logger";

import {getUserListService, getUserIDService, updateUserService, deleteUserService} from '@apps/server/user';

class UsersController {
  /**
   * 查询所有用户
   * @param req
   * @param res
   * @returns
   */
  getUserList = async (req: Request, res: Response) => {
    try {
      await getUserListService(req, res);
    } catch (error) {
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
      await getUserIDService(req, res);
    } catch (error) {
      logger.error("查询单个用户 ID 时发生错误:", error);
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
      await updateUserService(req, res);
    } catch (error) {
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
      await deleteUserService(req, res)
    } catch (error) {
      logger.error("删除用户时发生错误:", error);
      return (res as any).AjaxResult.fail(500);
    }
  };
}

// 创建一个上述类的一个实例，将其导出
export const usersController = new UsersController();
