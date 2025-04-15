/**
 * JSON Schema 验证和处理工具
 */

/**
 * 简单的 Schema 类型定义
 */
type SchemaType = "string" | "number" | "boolean" | "object" | "array" | "null" | "integer" | "any";

/**
 * Schema 属性定义
 */
interface SchemaProperty {
  type: SchemaType | SchemaType[];
  required?: boolean;
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
  enum?: any[];
  pattern?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  default?: any;
  description?: string;
}

/**
 * Schema 定义
 */
interface Schema {
  type: SchemaType | SchemaType[];
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  description?: string;
}

/**
 * 验证错误
 */
interface ValidationError {
  path: string;
  message: string;
}

/**
 * 验证结果
 */
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * 验证值类型
 * @param value 要验证的值
 * @param type 期望的类型
 * @returns 是否匹配类型
 */
const validateType = (value: any, type: SchemaType | SchemaType[]): boolean => {
  if (type === "any") return true;

  const types = Array.isArray(type) ? type : [type];

  for (const t of types) {
    switch (t) {
      case "string":
        if (typeof value === "string") return true;
        break;
      case "number":
        if (typeof value === "number" && !isNaN(value)) return true;
        break;
      case "integer":
        if (typeof value === "number" && !isNaN(value) && Number.isInteger(value)) return true;
        break;
      case "boolean":
        if (typeof value === "boolean") return true;
        break;
      case "object":
        if (typeof value === "object" && value !== null && !Array.isArray(value)) return true;
        break;
      case "array":
        if (Array.isArray(value)) return true;
        break;
      case "null":
        if (value === null) return true;
        break;
      case "any":
        return true;
    }
  }

  return false;
};

/**
 * 验证属性的约束条件
 * @param value 要验证的值
 * @param schema 属性的schema定义
 * @param path 当前属性的路径
 * @returns 验证错误数组
 */
const validateConstraints = (value: any, schema: SchemaProperty, path: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({
        path,
        message: `字符串长度应不小于 ${schema.minLength}`,
      });
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({
        path,
        message: `字符串长度应不大于 ${schema.maxLength}`,
      });
    }

    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push({
        path,
        message: `字符串不匹配指定的模式: ${schema.pattern}`,
      });
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        path,
        message: `值不在允许的枚举范围内: ${schema.enum.join(", ")}`,
      });
    }
  }

  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({
        path,
        message: `数值应不小于 ${schema.minimum}`,
      });
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({
        path,
        message: `数值应不大于 ${schema.maximum}`,
      });
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        path,
        message: `值不在允许的枚举范围内: ${schema.enum.join(", ")}`,
      });
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({
        path,
        message: `数组长度应不小于 ${schema.minItems}`,
      });
    }

    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({
        path,
        message: `数组长度应不大于 ${schema.maxItems}`,
      });
    }

    if (schema.items) {
      value.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;

        if (!validateType(item, schema.items!.type)) {
          errors.push({
            path: itemPath,
            message: `类型不匹配，期望 ${schema.items!.type}`,
          });
        } else {
          errors.push(...validateConstraints(item, schema.items!, itemPath));
        }
      });
    }
  }

  return errors;
};

/**
 * 验证对象是否符合Schema
 * @param data 要验证的数据
 * @param schema schema定义
 * @param path 当前路径
 * @returns 验证结果
 */
const validateObject = (data: any, schema: Schema, path = "$"): ValidationError[] => {
  const errors: ValidationError[] = [];

  // 验证类型
  if (!validateType(data, schema.type)) {
    return [
      {
        path,
        message: `类型不匹配，期望 ${Array.isArray(schema.type) ? schema.type.join(" 或 ") : schema.type}`,
      },
    ];
  }

  // 如果不是对象，不需要继续验证属性
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return errors;
  }

  // 验证必填属性
  if (schema.required) {
    for (const requiredProp of schema.required) {
      if (data[requiredProp] === undefined) {
        errors.push({
          path: `${path}.${requiredProp}`,
          message: `必填属性缺失`,
        });
      }
    }
  }

  // 验证属性
  if (schema.properties) {
    for (const prop in schema.properties) {
      if (data[prop] !== undefined) {
        const propSchema = schema.properties[prop];
        const propPath = `${path}.${prop}`;

        if (!validateType(data[prop], propSchema.type)) {
          errors.push({
            path: propPath,
            message: `类型不匹配，期望 ${Array.isArray(propSchema.type) ? propSchema.type.join(" 或 ") : propSchema.type}`,
          });
        } else {
          // 验证属性的约束条件
          errors.push(...validateConstraints(data[prop], propSchema, propPath));

          // 递归验证嵌套对象
          if (
            propSchema.type === "object" &&
            propSchema.properties &&
            typeof data[prop] === "object" &&
            data[prop] !== null
          ) {
            errors.push(...validateObject(data[prop], propSchema as Schema, propPath));
          }
        }
      } else if (schema.properties[prop].required) {
        errors.push({
          path: `${path}.${prop}`,
          message: `必填属性缺失`,
        });
      }
    }
  }

  // 验证是否允许额外属性
  if (schema.additionalProperties === false && schema.properties) {
    for (const prop in data) {
      if (!schema.properties[prop]) {
        errors.push({
          path: `${path}.${prop}`,
          message: `不允许额外的属性`,
        });
      }
    }
  }

  return errors;
};

/**
 * 验证数据是否符合Schema
 * @param data 要验证的数据
 * @param schema Schema定义
 * @returns 验证结果
 */
export function validate(data: any, schema: Schema): ValidationResult {
  const errors = validateObject(data, schema);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 根据Schema设置默认值
 * @param data 原始数据
 * @param schema Schema定义
 * @returns 设置了默认值的数据
 */
export function applyDefaults<T>(data: T, schema: Schema): T {
  const result = { ...data } as any;

  if (schema.properties) {
    for (const prop in schema.properties) {
      const propSchema = schema.properties[prop];

      if (result[prop] === undefined && propSchema.default !== undefined) {
        result[prop] = propSchema.default;
      }

      // 递归处理嵌套对象
      if (
        result[prop] !== undefined &&
        propSchema.type === "object" &&
        propSchema.properties &&
        typeof result[prop] === "object" &&
        result[prop] !== null
      ) {
        result[prop] = applyDefaults(result[prop], propSchema as Schema);
      }
    }
  }

  return result as T;
}

/**
 * 创建基于Schema的对象构建器
 * @param schema Schema定义
 * @returns 构建器函数
 */
export function createBuilder<T>(schema: Schema) {
  return (data: Partial<T> = {}): T => {
    const result = applyDefaults(data, schema) as T;
    return result;
  };
}

export type { Schema, SchemaProperty, SchemaType, ValidationResult, ValidationError };
