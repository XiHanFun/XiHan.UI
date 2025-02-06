// 字符串相关

/**
 * 生成一个唯一的ID
 *
 * @param prefix 可选参数，用于设置ID的前缀
 * @returns 返回一个唯一的ID，格式为：前缀 + 当前时间戳 + 随机数
 */
export const generateId = (prefix = ""): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}${timestamp}${random}`;
};

/**
 * 检查字符串是否为空
 *
 * @param str 需要检查的字符串
 * @returns 如果字符串为空或只包含空格，则返回true，否则返回false
 */
export const isEmptyString = (str: string): boolean => {
  return !str.trim();
};
