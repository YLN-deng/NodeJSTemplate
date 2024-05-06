import { Request, Response } from "express";
import logger from "@utils/logger";

import {getUserListServer, getUserIDServer, updateUserServer, deleteUserServer} from '@apps/server/user';

class UsersController {
  /**
   * 查询所有用户
   * @param req
   * @param res
   * @returns
   */
  getUserList = async (req: Request, res: Response) => {
    try {
      await getUserListServer(req, res);
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
      await getUserIDServer(req, res);
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
      await updateUserServer(req, res);
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
      await deleteUserServer(req, res)
    } catch (error) {
      logger.error("删除用户时发生错误:", error);
      return (res as any).AjaxResult.fail(500);
    }
  };
}

// 创建一个上述类的一个实例，将其导出
export const usersController = new UsersController();
