import { Request, Response } from "express"
import logger from "@utils/logger";

class IndexController {
	// 测试
	test = async (req: Request, res: Response) => {
		//获取解析的token信息
		console.log('req :>> ', (req as any).user);
	};
}

// 创建一个上述类的一个实例，将其导出
export const indexController = new IndexController();