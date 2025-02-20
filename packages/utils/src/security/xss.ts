/**
 * XSS过滤
 *
 * @param html 需要过滤的HTML字符串
 * @returns 过滤后的安全HTML字符串
 */
export const escapeHtml = (html: string): string => {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

/**
 * 安全地处理URL
 *
 * @param url 需要处理的URL
 * @returns 安全处理后的URL
 */
export const sanitizeUrl = (url: string): string => {
  try {
    new URL(url);
    return url;
  } catch {
    return "";
  }
};
