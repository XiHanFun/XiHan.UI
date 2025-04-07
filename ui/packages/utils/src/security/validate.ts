/**
 * 验证邮箱
 * @param value 需要验证的邮箱地址
 * @returns 如果邮箱地址有效，则返回true，否则返回false
 */
export const isEmail = (value: string): boolean => {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
};

/**
 * 验证手机号（中国大陆）
 * @param value 需要验证的手机号
 * @returns 如果手机号有效，则返回true，否则返回false
 */
export const isMobile = (value: string): boolean => {
  return /^1[3-9]\d{9}$/.test(value);
};

/**
 * 验证身份证号（中国大陆）
 * @param value 需要验证的身份证号
 * @returns 如果身份证号有效，则返回true，否则返回false
 */
export const isIdCard = (value: string): boolean => {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
};

/**
 * 验证URL
 * @param value 需要验证的URL
 * @returns 如果URL有效，则返回true，否则返回false
 */
export const isUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证密码强度
 * @param password 需要验证的密码
 * @returns 返回密码强度等级(1-4)，数字越大强度越高
 */
export const checkPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++; // 长度大于8

  if (/[A-Z]/.test(password)) strength++; // 包含大写字母
  if (/[0-9]/.test(password)) strength++; // 包含数字
  if (/[^A-Za-z0-9]/.test(password)) strength++; // 包含特殊字符
  return strength;
};

/**
 * 验证是否为空
 * @param value 需要验证的值
 * @returns 如果值为空，则返回true，否则返回false
 */
export const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === "";
};
