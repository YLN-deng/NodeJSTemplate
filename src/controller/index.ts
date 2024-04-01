import { Request, Response } from "express";

class IndexController {
	// 测试
	test = async (req: Request, res: Response) => {
		console.log('req :>> ', (req as any).user);
		const typedRes: Response<any, Record<string, any>> = res as Response<any, Record<string, any>>;
        console.log(typedRes); // 输出完整类型信息
		(res as any).AjaxResult.success(200,req.headers);
	};
}

// 创建一个上述类的一个实例，将其导出
export const indexController = new IndexController();