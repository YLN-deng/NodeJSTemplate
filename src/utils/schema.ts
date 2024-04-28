// schema.ts

import { ValidationError } from "class-validator";

  // 将单个 class-validator 错误对象转换为自定义格式的方法
  export const formatValidationError = (error: ValidationError) => {
    const constraints = error.constraints;
    if (constraints) {
      const property = Object.keys(constraints)[0];
      return {
        code: 400,
        msg: constraints[property],
        time: Date.now(),
        field: property,
      };
    } else {
      return {
        code: 400,
        msg: "填写信息有误",
        time: Date.now(),
        field: error.property,
      };
    }
  }
