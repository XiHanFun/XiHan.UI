/**
 * CSRF Token生成
 *
 * @returns 生成的CSRF Token
 */
export const generateCsrfToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
};
