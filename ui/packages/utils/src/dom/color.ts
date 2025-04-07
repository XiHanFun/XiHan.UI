/**
 * 将十六进制颜色转换为RGBA格式字符串
 * @param hex - 十六进制颜色值，例如 "#ff0000" 表示红色
 * @param alpha - 透明度值，取值范围为 0.0 到 1.0，默认值为 1（完全不透明）
 * @returns 返回RGBA格式的颜色字符串，如果输入格式不正确则返回空字符串
 */
export const hexToRgba = (hex: string, alpha = 1): string => {
  // 将十六进制颜色值每两位一组解析为RGB值
  const rgb = hex.match(/\w\w/g)?.map(x => parseInt(x, 16));
  // 如果解析成功，则构造并返回RGBA格式的颜色字符串；否则返回空字符串
  return rgb ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})` : "";
};

/**
 * 将rgba字符串转换为十六进制字符串
 * 该函数旨在处理rgba颜色表示法，并将其转换为对应的十六进制表示
 * 主要用于颜色格式需要转换的场景
 * @param rgba - 输入的rgba颜色字符串，格式如 'rgba(255, 0, 0, 1)'
 * @returns 返回转换后的十六进制颜色字符串，如 '#ff0000'
 *          如果输入格式不正确，返回空字符串 ''
 */
export const rgbaToHex = (rgba: string): string => {
  // 提取rgba字符串中的数字部分，用于后续的颜色值转换
  const values = rgba.match(/\d+/g);
  // 检查提取的结果，如果不符合预期（至少需要rgb三个值），则返回空字符串
  if (!values || values.length < 3) return "";
  // 将提取的数字字符串转换为整数，便于处理颜色值
  const [r, g, b] = values.map(x => parseInt(x));
  // 将rgb颜色值转换为十六进制，并确保每个颜色值占两位，然后拼接成最终的十六进制颜色字符串
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
};
