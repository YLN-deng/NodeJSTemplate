/**
 * BaseResultCode 类用于定义常用的返回码和描述
 */
class BaseResultCode {
    /**
     * 返回码
     */
    public code: number;
    /**
     * 返回描述
     */
    public desc: string;

    /**
     * 构造函数
     * @param code 返回码
     * @param desc 返回描述
     */
    constructor(code: number, desc: string) {
        this.code = code;
        this.desc = desc;
    }

    /**
     * 表示操作成功的返回码和描述
     */
    public static SUCCESS = new BaseResultCode(200, '请求成功');
    /**
     * 表示操作失败的返回码和描述
     */
    public static FAILED = new BaseResultCode(500, '系统错误');
    /**
     * 表示参数校验失败的返回码和描述
     */
    public static VALIDATE_FAILED = new BaseResultCode(400, '参数校验失败');
    /**
     * 表示接口不存在的返回码和描述
     */
    public static API_NOT_FOUND = new BaseResultCode(404, '接口不存在');
}

export default BaseResultCode;
