/**
 * 敏感信息脱敏
 *
 * @param value 需要脱敏的值
 * @param start 保留开始位数
 * @param end 保留结束位数
 * @returns 脱敏后的字符串
 */
export const maskSensitiveInfo = (value: string, start = 3, end = 4): string => {
  const length = value.length;
  const maskLength = length - start - end;
  if (maskLength <= 0) return value;

  return value.substring(0, start) + "*".repeat(maskLength) + value.substring(length - end);
};
