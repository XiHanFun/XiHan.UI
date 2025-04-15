/**
 * 通用脱敏
 * @param value 需要脱敏的值
 * @param start 开始位置
 * @param end 结束位置
 * @returns 返回脱敏后的值
 */
export function mask(value: string, start = 3, end = 4): string {
  const length = value.length;
  const maskLength = length - start - end;
  if (maskLength <= 0) return value;
  return value.substring(0, start) + "*".repeat(maskLength) + value.substring(length - end);
}

/**
 * 手机号脱敏
 * @param phone 手机号
 * @returns 返回脱敏后的手机号
 */
export function mobile(phone: string): string {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

/**
 * 邮箱脱敏
 * @param email 邮箱
 * @returns 返回脱敏后的邮箱
 */
export function email(email: string): string {
  return email.replace(/^(.{3}).*(@.*)$/, "$1***$2");
}

/**
 * 身份证脱敏
 * @param id 身份证
 * @returns 返回脱敏后的身份证
 */
export function idCard(id: string): string {
  return id.replace(/^(.{6}).*(.{4})$/, "$1********$2");
}

/**
 * 银行卡脱敏
 * @param card 银行卡
 * @returns 返回脱敏后的银行卡
 */
export function bankCard(card: string): string {
  return card.replace(/^(\d{4})\d+(\d{4})$/, "$1 **** **** $2");
}

/**
 * 地址脱敏
 * @param addr 地址
 * @param keepStart 保留开始位置
 * @param keepEnd 保留结束位置
 * @returns 返回脱敏后的地址
 */
export function address(addr: string, keepStart = 6, keepEnd = 0): string {
  if (addr.length <= keepStart + keepEnd) return addr;
  return addr.substring(0, keepStart) + "****" + addr.substring(addr.length - keepEnd);
}
