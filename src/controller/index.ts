import { Request, Response } from "express";
import ResultAjax from '@common/result/ResultAjax';

class IndexController {
	// 测试
	test = async (req: Request, res: Response) => {
		console.log('req :>> ', (req as any).user);
		res.send(ResultAjax.success(req.headers))
	};
}

// 创建一个上述类的一个实例，将其导出
export const indexController = new IndexController();