import { Request, Response } from "express";
import requestIp from 'request-ip';

class IndexController {
	// 测试
	test = async (req: Request, res: Response) => {
		console.log('req :>> ', (req as any).user);
		const clientIp = requestIp.getClientIp(req) || '';
		console.log('clientIp :>> ', clientIp);
		(res as any).AjaxResult.success(200,req.headers);
	};
}

// 创建一个上述类的一个实例，将其导出
export const indexController = new IndexController();