declare namespace Express {
    interface Response {
      AjaxResult: {
        success: (code: number, data?: any) => Response;
        fail: (code: number, data?: any) => Response;
        validateFailed: (code: number, data?: any) => Response;
        bizFail: (code: number, msg?: any) => Response;
      };
    }
  }