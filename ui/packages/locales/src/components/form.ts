// 表单组件国际化
import type { DeepPartial } from "../types";

export interface FormLocale {
  optional: string;
  defaultValidateMessages: {
    default: string;
    required: string;
    enum: string;
    whitespace: string;
    date: {
      format: string;
      parse: string;
      invalid: string;
    };
    types: {
      string: string;
      method: string;
      array: string;
      object: string;
      number: string;
      date: string;
      boolean: string;
      integer: string;
      float: string;
      regexp: string;
      email: string;
      url: string;
    };
    string: {
      len: string;
      min: string;
      max: string;
      range: string;
    };
    number: {
      len: string;
      min: string;
      max: string;
      range: string;
    };
    array: {
      len: string;
      min: string;
      max: string;
      range: string;
    };
    pattern: {
      mismatch: string;
    };
  };
}

export const FormLocale: Record<string, DeepPartial<FormLocale>> = {
  "zh-CN": {
    optional: "（可选）",
    defaultValidateMessages: {
      default: "字段验证错误${label}",
      required: "${label}是必填字段",
      enum: "${label}必须是其中一个[${enum}]",
      whitespace: "${label}不能为空字符",
      date: {
        format: "${label}日期格式无效",
        parse: "${label}不能转换为日期",
        invalid: "${label}是一个无效日期",
      },
      types: {
        string: "${label}不是一个有效的${type}",
        method: "${label}不是一个有效的${type}",
        array: "${label}不是一个有效的${type}",
        object: "${label}不是一个有效的${type}",
        number: "${label}不是一个有效的${type}",
        date: "${label}不是一个有效的${type}",
        boolean: "${label}不是一个有效的${type}",
        integer: "${label}不是一个有效的${type}",
        float: "${label}不是一个有效的${type}",
        regexp: "${label}不是一个有效的${type}",
        email: "${label}不是一个有效的电子邮件",
        url: "${label}不是一个有效的URL",
      },
      string: {
        len: "${label}须为${len}个字符",
        min: "${label}最少${min}个字符",
        max: "${label}最多${max}个字符",
        range: "${label}须在${min}到${max}字符之间",
      },
      number: {
        len: "${label}必须等于${len}",
        min: "${label}最小值为${min}",
        max: "${label}最大值为${max}",
        range: "${label}须在${min}到${max}之间",
      },
      array: {
        len: "${label}须为${len}个条目",
        min: "${label}最少${min}个条目",
        max: "${label}最多${max}个条目",
        range: "${label}须在${min}到${max}个条目之间",
      },
      pattern: {
        mismatch: "${label}与模式不匹配${pattern}",
      },
    },
  },
  "en-US": {
    optional: "(optional)",
    defaultValidateMessages: {
      default: "Field validation error for ${label}",
      required: "${label} is required",
      enum: "${label} must be one of [${enum}]",
      whitespace: "${label} cannot be empty",
      date: {
        format: "${label} is invalid for format date",
        parse: "${label} could not be parsed as date",
        invalid: "${label} is invalid date",
      },
      types: {
        string: "${label} is not a valid ${type}",
        method: "${label} is not a valid ${type}",
        array: "${label} is not a valid ${type}",
        object: "${label} is not a valid ${type}",
        number: "${label} is not a valid ${type}",
        date: "${label} is not a valid ${type}",
        boolean: "${label} is not a valid ${type}",
        integer: "${label} is not a valid ${type}",
        float: "${label} is not a valid ${type}",
        regexp: "${label} is not a valid ${type}",
        email: "${label} is not a valid email",
        url: "${label} is not a valid URL",
      },
      string: {
        len: "${label} must be exactly ${len} characters",
        min: "${label} must be at least ${min} characters",
        max: "${label} cannot be longer than ${max} characters",
        range: "${label} must be between ${min}-${max} characters",
      },
      number: {
        len: "${label} must equal ${len}",
        min: "${label} cannot be less than ${min}",
        max: "${label} cannot be greater than ${max}",
        range: "${label} must be between ${min}-${max}",
      },
      array: {
        len: "${label} must be exactly ${len} in length",
        min: "${label} cannot be less than ${min} in length",
        max: "${label} cannot be greater than ${max} in length",
        range: "${label} must be between ${min}-${max} in length",
      },
      pattern: {
        mismatch: "${label} does not match pattern ${pattern}",
      },
    },
  },
};
