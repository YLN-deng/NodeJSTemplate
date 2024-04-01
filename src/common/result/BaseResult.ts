import BizResultCode from './BaseResultCode';

class ResultAjax {
    code: number; // 返回code
    msg: string; // 返回消息
    data: any; // 返回数据
    time: number; // 返回时间

    /**
     * 构造函数
     * @param code 返回code
     * @param msg 返回消息
     * @param data 返回具体对象
     */
    constructor(code: number, msg: string, data: any) {
        this.code = code;
        this.msg = msg;
        this.data = data;
        this.time = Date.now();
    }

    /**
     * 成功
     * @param data 返回对象
     * @return ResultAjax
     */
    static success(data: any): ResultAjax {
        return new ResultAjax(BizResultCode.SUCCESS.code, BizResultCode.SUCCESS.desc, data);
    }

    /**
     * 失败
     * @param errData 错误数据
     * @return ResultAjax
     */
    static fail(errData: any): ResultAjax {
        return new ResultAjax(BizResultCode.FAILED.code, BizResultCode.FAILED.desc, errData);
    }

    /**
     * 参数校验失败
     * @param param 参数
     * @return ResultAjax
     */
    static validateFailed(param: any): ResultAjax {
        return new ResultAjax(BizResultCode.VALIDATE_FAILED.code, BizResultCode.VALIDATE_FAILED.desc, param);
    }

    /**
     * 拦截到的业务异常
     * @param bizException 业务异常
     * @return ResultAjax
     */
    static bizFail(bizException: any): ResultAjax {
        return new ResultAjax(bizException.code, bizException.msg, null);
    }
}

export default ResultAjax;
