/**
 * RTL (从右到左) 支持工具
 */

/**
 * RTL语言配置
 */
export interface RTLConfig {
  /**
   * 是否启用RTL
   */
  enabled: boolean;

  /**
   * RTL方向
   */
  dir: "rtl" | "ltr";

  /**
   * 文本对齐方式
   */
  textAlign: "right" | "left";
}

/**
 * RTL (从右到左) 语言代码列表
 * 包括阿拉伯语、希伯来语、波斯语等
 */
export const RTL_LOCALES = [
  "ar", // 阿拉伯语
  "ar-AE", // 阿拉伯语 (阿联酋)
  "ar-BH", // 阿拉伯语 (巴林)
  "ar-DZ", // 阿拉伯语 (阿尔及利亚)
  "ar-EG", // 阿拉伯语 (埃及)
  "ar-IQ", // 阿拉伯语 (伊拉克)
  "ar-JO", // 阿拉伯语 (约旦)
  "ar-KW", // 阿拉伯语 (科威特)
  "ar-LB", // 阿拉伯语 (黎巴嫩)
  "ar-LY", // 阿拉伯语 (利比亚)
  "ar-MA", // 阿拉伯语 (摩洛哥)
  "ar-OM", // 阿拉伯语 (阿曼)
  "ar-QA", // 阿拉伯语 (卡塔尔)
  "ar-SA", // 阿拉伯语 (沙特阿拉伯)
  "ar-SD", // 阿拉伯语 (苏丹)
  "ar-SY", // 阿拉伯语 (叙利亚)
  "ar-TN", // 阿拉伯语 (突尼斯)
  "ar-YE", // 阿拉伯语 (也门)
  "he", // 希伯来语
  "he-IL", // 希伯来语 (以色列)
  "fa", // 波斯语
  "fa-IR", // 波斯语 (伊朗)
  "ur", // 乌尔都语
  "ur-PK", // 乌尔都语 (巴基斯坦)
  "dv", // 迪维希语
  "dv-MV", // 迪维希语 (马尔代夫)
  "ks", // 克什米尔语
  "ks-IN", // 克什米尔语 (印度)
  "ku", // 库尔德语
  "pa-Arab", // 旁遮普语 (阿拉伯文字)
  "ps", // 普什图语
  "ps-AF", // 普什图语 (阿富汗)
  "sd", // 信德语
  "sd-Arab", // 信德语 (阿拉伯文字)
  "ug", // 维吾尔语
];

/**
 * 检查语言是否是从右到左(RTL)的
 * @param locale 语言代码
 * @returns 是否是RTL语言
 */
export function isRTL(locale: string): boolean {
  // 提取主要语言代码（如果有）
  const primaryCode = locale.split("-")[0].toLowerCase();

  // 检查完整代码或主要代码是否在RTL语言列表中
  return RTL_LOCALES.includes(locale) || RTL_LOCALES.includes(primaryCode);
}

/**
 * 获取语言的方向
 * @param locale 语言代码
 * @returns 文本方向 ('rtl' 或 'ltr')
 */
export function getDirection(locale: string): "rtl" | "ltr" {
  return isRTL(locale) ? "rtl" : "ltr";
}

/**
 * 获取RTL配置
 * @param locale 语言代码
 * @returns RTL配置对象
 */
export function getRTLConfig(locale: string): RTLConfig {
  const isRtl = isRTL(locale);

  return {
    enabled: isRtl,
    dir: isRtl ? "rtl" : "ltr",
    textAlign: isRtl ? "right" : "left",
  };
}

/**
 * 翻转CSS值
 * @param value CSS值
 * @returns 翻转后的值
 */
export function flipValue(value: string): string {
  const valueMap: Record<string, string> = {
    left: "right",
    right: "left",
    start: "end",
    end: "start",
    ltr: "rtl",
    rtl: "ltr",
    "flex-start": "flex-end",
    "flex-end": "flex-start",
    "border-left": "border-right",
    "border-right": "border-left",
    "margin-left": "margin-right",
    "margin-right": "margin-left",
    "padding-left": "padding-right",
    "padding-right": "padding-left",
    "text-align: left": "text-align: right",
    "text-align: right": "text-align: left",
  };

  return valueMap[value] || value;
}

/**
 * 翻转位置值
 * @param directions 位置数组 [上, 右, 下, 左]
 * @returns 翻转后的位置数组 [上, 左, 下, 右]
 */
export function flipPositionValues(directions: (string | number)[]): (string | number)[] {
  if (directions.length !== 4) {
    return directions;
  }

  // 交换右边和左边的值 [上, 右, 下, 左] -> [上, 左, 下, 右]
  return [directions[0], directions[3], directions[2], directions[1]];
}

/**
 * 翻转CSS边距或填充值
 * @param value CSS边距或填充值 (例如 "10px 20px 15px 30px")
 * @returns 翻转后的值
 */
export function flipBoxValues(value: string): string {
  const values = value.split(/\s+/);

  if (values.length === 4) {
    // 四个值：上 右 下 左 -> 上 左 下 右
    return `${values[0]} ${values[3]} ${values[2]} ${values[1]}`;
  } else if (values.length === 3) {
    // 三个值：上 左右 下 -> 不变
    return value;
  } else if (values.length === 2) {
    // 两个值：上下 左右 -> 不变
    return value;
  }

  // 单值或无效情况：不变
  return value;
}

/**
 * 翻转边框半径值
 * @param value CSS边框半径值 (例如 "10px 20px 15px 30px")
 * @returns 翻转后的值
 */
export function flipBorderRadius(value: string): string {
  const values = value.split(/\s+/);

  if (values.length === 4) {
    // 四个值：左上 右上 右下 左下 -> 右上 左上 左下 右下
    return `${values[1]} ${values[0]} ${values[3]} ${values[2]}`;
  } else if (values.length === 3) {
    // 三个值：左上 右上左下 右下 -> 右上 左上右下 左下
    return `${values[1]} ${values[0]} ${values[1]} ${values[2]}`;
  } else if (values.length === 2) {
    // 两个值：左上右下 右上左下 -> 右上左下 左上右下
    return `${values[1]} ${values[0]}`;
  }

  // 单值或无效情况：不变
  return value;
}

/**
 * 翻转变换原点
 * @param value CSS变换原点 (例如 "left center")
 * @returns 翻转后的值
 */
export function flipTransformOrigin(value: string): string {
  const originMap: Record<string, string> = {
    left: "right",
    right: "left",
    "left top": "right top",
    "left center": "right center",
    "left bottom": "right bottom",
    "right top": "left top",
    "right center": "left center",
    "right bottom": "left bottom",
  };

  return originMap[value] || value;
}

/**
 * 翻转CSS属性
 * @param property CSS属性
 * @returns 翻转后的属性
 */
export function flipProperty(property: string): string {
  const propertyMap: Record<string, string> = {
    left: "right",
    right: "left",
    "margin-left": "margin-right",
    "margin-right": "margin-left",
    "padding-left": "padding-right",
    "padding-right": "padding-left",
    "border-left": "border-right",
    "border-right": "border-left",
    "border-left-color": "border-right-color",
    "border-right-color": "border-left-color",
    "border-left-width": "border-right-width",
    "border-right-width": "border-left-width",
    "border-left-style": "border-right-style",
    "border-right-style": "border-left-style",
    "border-top-left-radius": "border-top-right-radius",
    "border-top-right-radius": "border-top-left-radius",
    "border-bottom-left-radius": "border-bottom-right-radius",
    "border-bottom-right-radius": "border-bottom-left-radius",
    "text-align": "text-align", // 特殊处理，值需要翻转
  };

  return propertyMap[property] || property;
}

/**
 * 翻转角度
 * @param angle 角度
 * @returns 翻转后的角度
 */
export function flipAngle(angle: number): number {
  // 针对旋转等角度值，翻转方向
  return -angle;
}

/**
 * 翻转CSS翻译变换
 * @param value CSS翻译值 (例如 "translate(10px, 0)")
 * @returns 翻转后的值
 */
export function flipTranslate(value: string): string {
  // 匹配translate(x, y)或translate(x)
  const translateMatch = value.match(/translate\(([^,)]+)(?:,\s*([^)]+))?\)/);

  if (translateMatch) {
    const x = translateMatch[1];
    const y = translateMatch[2] || "0";

    // 水平方向取负值
    if (x.includes("-")) {
      return `translate(${x.replace("-", "")}, ${y})`;
    } else {
      return `translate(-${x}, ${y})`;
    }
  }

  // 匹配translateX(x)
  const translateXMatch = value.match(/translateX\(([^)]+)\)/);

  if (translateXMatch) {
    const x = translateXMatch[1];

    // 水平方向取负值
    if (x.includes("-")) {
      return `translateX(${x.replace("-", "")})`;
    } else {
      return `translateX(-${x})`;
    }
  }

  return value;
}

/**
 * 创建RTL样式类
 * @param className 原始类名
 * @returns RTL版本的类名
 */
export function getRTLClassName(className: string): string {
  return `${className}-rtl`;
}

/**
 * 获取应用于HTML或BODY元素的RTL属性
 * @param isRtl 是否是RTL
 * @returns HTML属性对象
 */
export function getRTLHtmlAttributes(isRtl: boolean): Record<string, string> {
  return {
    dir: isRtl ? "rtl" : "ltr",
    class: isRtl ? "rtl" : "ltr",
  };
}

/**
 * 创建条件RTL样式
 * @param baseStyle 基础样式
 * @param rtlStyle RTL样式
 * @param isRtl 是否启用RTL
 * @returns 最终样式对象
 */
export function createRTLStyles(
  baseStyle: Record<string, any>,
  rtlStyle: Record<string, any>,
  isRtl: boolean,
): Record<string, any> {
  if (!isRtl) {
    return baseStyle;
  }

  return { ...baseStyle, ...rtlStyle };
}

/**
 * 自动翻转指定的样式
 * @param styles 原始样式
 * @param isRtl 是否启用RTL
 * @returns 翻转后的样式
 */
export function autoFlipStyles(styles: Record<string, any>, isRtl: boolean): Record<string, any> {
  if (!isRtl) {
    return styles;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(styles)) {
    const flippedKey = flipProperty(key);

    if (key === flippedKey && key === "text-align") {
      // 对于text-align，需要翻转值
      result[key] = flipValue(value as string);
    } else if (key !== flippedKey) {
      // 针对需要翻转的属性
      result[flippedKey] = value;
    } else {
      // 对于其他属性，保持不变
      result[key] = value;
    }
  }

  return result;
}
