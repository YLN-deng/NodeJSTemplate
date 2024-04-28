import { Request, Response, NextFunction } from "express";
import BaseResult from '@common/HttpResult/BaseResult';

const ajaxResultMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (res as any).AjaxResult = {
    success: (code: number, data?: any) => {
      return res.status(code).json(BaseResult.success(data));
    },
    fail: (code: number, data?: any) => {
      return res.status(code).json(BaseResult.fail(data));
    },
    validateFailed: (code: number, data?: any) => {
      return res.status(code).json(BaseResult.validateFailed(data));
    },
    bizFail: (code: number, msg?: any) => {
      return res.status(code).json(BaseResult.bizFail({code,msg}));
    }
  };
  
  next();
};

export default ajaxResultMiddleware;
