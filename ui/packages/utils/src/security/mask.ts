/**
 * 数据脱敏工具集
 */
export const maskUtils = {
  /**
   * 通用脱敏
   */
  mask(value: string, start = 3, end = 4): string {
    const length = value.length;
    const maskLength = length - start - end;
    if (maskLength <= 0) return value;
    return value.substring(0, start) + "*".repeat(maskLength) + value.substring(length - end);
  },

  /**
   * 手机号脱敏
   */
  mobile(phone: string): string {
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
  },

  /**
   * 邮箱脱敏
   */
  email(email: string): string {
    return email.replace(/^(.{3}).*(@.*)$/, "$1***$2");
  },

  /**
   * 身份证脱敏
   */
  idCard(id: string): string {
    return id.replace(/^(.{6}).*(.{4})$/, "$1********$2");
  },

  /**
   * 银行卡脱敏
   */
  bankCard(card: string): string {
    return card.replace(/^(\d{4})\d+(\d{4})$/, "$1 **** **** $2");
  },

  /**
   * 地址脱敏
   */
  address(addr: string, keepStart = 6, keepEnd = 0): string {
    if (addr.length <= keepStart + keepEnd) return addr;
    return addr.substring(0, keepStart) + "****" + addr.substring(addr.length - keepEnd);
  },
};
