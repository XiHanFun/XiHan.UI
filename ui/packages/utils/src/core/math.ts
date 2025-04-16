/**
 * 精确加法
 * @param num1 需要加的数
 * @param num2 被加的数
 * @returns 精确加法后的结果
 */
export function add(num1: number, num2: number): number {
  const num1Digits = (num1.toString().split(".")[1] || "").length;
  const num2Digits = (num2.toString().split(".")[1] || "").length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}

/**
 * 精确减法
 * @param num1 需要减去的数
 * @param num2 被减去的数
 * @returns 精确减法后的结果
 */
export function subtract(num1: number, num2: number): number {
  const num1Digits = (num1.toString().split(".")[1] || "").length;
  const num2Digits = (num2.toString().split(".")[1] || "").length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum - num2 * baseNum) / baseNum;
}

/**
 * 精确乘法
 * @param num1 乘数
 * @param num2 被乘数
 * @returns 精确乘法后的结果
 */
export function multiply(num1: number, num2: number): number {
  const num1Str = num1.toString();
  const num2Str = num2.toString();
  const num1Digits = (num1Str.split(".")[1] || "").length;
  const num2Digits = (num2Str.split(".")[1] || "").length;
  const baseNum = Math.pow(10, num1Digits + num2Digits);
  return (Number(num1Str.replace(".", "")) * Number(num2Str.replace(".", ""))) / baseNum;
}

/**
 * 精确除法
 * @param num1 被除数
 * @param num2 除数
 * @param digits 结果小数位数，默认为10
 * @returns 精确除法后的结果
 */
export function divide(num1: number, num2: number, digits = 10): number {
  if (num2 === 0) {
    throw new Error("除数不能为零");
  }
  const num1Digits = (num1.toString().split(".")[1] || "").length;
  const num2Digits = (num2.toString().split(".")[1] || "").length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits) + digits);
  return (num1 * baseNum) / (num2 * Math.pow(10, Math.max(num1Digits, num2Digits)));
}

/**
 * 计算百分比
 * @param num 需要计算的数
 * @param total 总数
 * @param decimals 小数位数
 * @returns 百分比字符串
 */
export function percentage(num: number, total: number, decimals = 2): string {
  if (total === 0) return "0%";
  return `${((num / total) * 100).toFixed(decimals)}%`;
}

/**
 * 随机数生成
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 数值范围限制
 * @param num 需要限制的数
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * 精确舍入到指定小数位
 * @param num 需要舍入的数
 * @param decimals 小数位数
 * @returns 舍入后的数
 */
export function round(num: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * 数组求和
 * @param arr 数字数组
 * @returns 求和结果
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => add(acc, val), 0);
}

/**
 * 数组平均值
 * @param arr 数字数组
 * @returns 平均值
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return divide(sum(arr), arr.length);
}

/**
 * 角度转弧度
 * @param degrees 角度
 * @returns 弧度
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 弧度转角度
 * @param radians 弧度
 * @returns 角度
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * 值的比例映射
 * @param value 原始值
 * @param fromLow 原始范围最小值
 * @param fromHigh 原始范围最大值
 * @param toLow 目标范围最小值
 * @param toHigh 目标范围最大值
 * @returns 映射后的值
 */
export function map(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
  const ratio = (value - fromLow) / (fromHigh - fromLow);
  return toLow + ratio * (toHigh - toLow);
}

/**
 * 检查数字是否在范围内
 * @param num 需要检查的数字
 * @param min 范围最小值
 * @param max 范围最大值
 * @param inclusive 是否包含边界值，默认为true
 * @returns 是否在范围内
 */
export function inRange(num: number, min: number, max: number, inclusive = true): boolean {
  return inclusive ? num >= min && num <= max : num > min && num < max;
}

/**
 * 生成随机颜色 (十六进制格式)
 * @param alpha 是否包含透明度通道
 * @returns 颜色十六进制字符串
 */
export function randomColor(alpha = false): string {
  const r = random(0, 255);
  const g = random(0, 255);
  const b = random(0, 255);

  if (alpha) {
    const a = round(Math.random(), 2);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${Math.round(
      a * 255,
    )
      .toString(16)
      .padStart(2, "0")}`;
  }

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * 阶乘计算
 * @param n 需要计算阶乘的非负整数
 * @returns 阶乘结果
 */
export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("阶乘只接受非负整数");
  }

  if (n <= 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * 计算两点之间的距离
 * @param x1 第一个点的x坐标
 * @param y1 第一个点的y坐标
 * @param x2 第二个点的x坐标
 * @param y2 第二个点的y坐标
 * @returns 两点间的距离
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * 判断一个数是否为质数
 * @param n 需要判断的数
 * @returns 是否为质数
 */
export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  const sqrtN = Math.sqrt(n);
  for (let i = 5; i <= sqrtN; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }

  return true;
}

/**
 * 计算数值精确到指定有效数字位数
 * @param num 需要处理的数值
 * @param sigDigits 有效数字位数
 * @returns 处理后的数值
 */
export function toSignificantDigits(num: number, sigDigits: number): number {
  if (num === 0) return 0;

  const magnitude = Math.floor(Math.log10(Math.abs(num)));
  const factor = Math.pow(10, sigDigits - magnitude - 1);

  return Math.round(num * factor) / factor;
}
