/**
 * XSS过滤
 * @param html 需要过滤的HTML
 * @returns 过滤后的HTML
 */
export const escapeHtml = (html: string): string => {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

/**
 * 安全地处理URL
 * @param url URL
 * @returns 安全地处理后的URL
 */
export const sanitizeUrl = (url: string): string => {
  try {
    new URL(url);
    return url;
  } catch {
    return "";
  }
};

/**
 * 安全地处理HTML
 * @param html HTML
 * @returns 安全地处理后的HTML
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
};

/**
 * 安全地处理URL参数
 * @param url URL
 * @returns 安全地处理后的URL参数
 */
export const sanitizeUrlParams = (url: string): string => {
  const urlObj = new URL(url);
  urlObj.searchParams.forEach((value, key) => {
    urlObj.searchParams.set(key, sanitizeHtml(value));
  });
  return urlObj.toString();
};

/**
 * 安全地处理表单数据
 * @param formData 表单数据
 * @returns 安全地处理后的表单数据
 */
export const sanitizeFormData = (formData: FormData): FormData => {
  const sanitizedData = new FormData();
  formData.forEach((value, key) => {
    sanitizedData.set(key, sanitizeHtml(value as string));
  });
  return sanitizedData;
};

export const xssUtils = {
  escapeHtml,
  sanitizeUrl,
  sanitizeHtml,
  sanitizeUrlParams,
  sanitizeFormData,
} as const;

export default xssUtils;
