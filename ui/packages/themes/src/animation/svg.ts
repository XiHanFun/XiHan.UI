/**
 * SVG动画辅助工具模块
 * 提供SVG路径动画、形状变形等功能
 */

import { createTransition } from "./transition";
import type { TransitionOptions, TransitionController } from "./transition";

/**
 * SVG路径数据
 */
export interface PathData {
  type: string;
  values: number[];
}

/**
 * 解析SVG路径
 * @param path SVG路径字符串
 * @returns 解析后的路径数据
 */
export function parsePath(path: string): PathData[] {
  const pathCommands = path.match(/[a-df-z][^a-df-z]*/gi) || [];
  const result: PathData[] = [];

  for (const command of pathCommands) {
    const type = command[0];
    const values = command.slice(1).trim().split(/[ ,]+/).map(Number);

    result.push({ type, values });
  }

  return result;
}

/**
 * 序列化SVG路径
 * @param pathData 路径数据
 * @returns SVG路径字符串
 */
export function serializePath(pathData: PathData[]): string {
  return pathData.map(({ type, values }) => `${type}${values.join(" ")}`).join(" ");
}

/**
 * 插值两个SVG路径
 * @param pathA 起始路径
 * @param pathB 目标路径
 * @param progress 插值进度 (0-1)
 * @returns 插值后的路径
 */
export function interpolatePath(pathA: string, pathB: string, progress: number): string {
  const parsedA = parsePath(pathA);
  const parsedB = parsePath(pathB);

  // 如果路径命令不匹配，无法插值
  if (parsedA.length !== parsedB.length) {
    console.warn("路径命令数量不匹配，无法插值");
    return progress < 0.5 ? pathA : pathB;
  }

  const result: PathData[] = [];

  for (let i = 0; i < parsedA.length; i++) {
    const commandA = parsedA[i];
    const commandB = parsedB[i];

    if (commandA.type !== commandB.type) {
      console.warn(`路径命令类型不匹配: ${commandA.type} 与 ${commandB.type}`);
      return progress < 0.5 ? pathA : pathB;
    }

    if (commandA.values.length !== commandB.values.length) {
      console.warn(`路径命令参数数量不匹配: ${commandA.values.length} 与 ${commandB.values.length}`);
      return progress < 0.5 ? pathA : pathB;
    }

    const interpolatedValues = commandA.values.map((valueA, index) => {
      const valueB = commandB.values[index];
      return valueA + (valueB - valueA) * progress;
    });

    result.push({
      type: commandA.type,
      values: interpolatedValues,
    });
  }

  return serializePath(result);
}

/**
 * 路径动画选项
 */
export interface PathAnimationOptions extends TransitionOptions {
  /**
   * 是否保持路径长度一致
   */
  preserveLength?: boolean;
}

/**
 * 创建SVG路径过渡动画
 * @param element SVG路径元素
 * @param fromPath 起始路径
 * @param toPath 目标路径
 * @param options 动画选项
 * @returns 动画控制器
 */
export function animatePath(
  element: SVGPathElement,
  fromPath: string,
  toPath: string,
  options: PathAnimationOptions = {},
): TransitionController {
  const { preserveLength = false, ...transitionOptions } = options;

  // 如果需要保持路径长度一致，预处理路径
  if (preserveLength) {
    // 此处可以添加路径规范化逻辑，确保路径点数一致
    // 例如可以将两个路径重新采样为相同数量的点
  }

  return createTransition(
    progress => {
      const interpolated = interpolatePath(fromPath, toPath, progress);
      element.setAttribute("d", interpolated);
    },
    {
      duration: 300,
      ...transitionOptions,
    },
  );
}

/**
 * SVG绘制动画
 * @param pathElement SVG路径元素
 * @param options 动画选项
 * @returns 动画控制器
 */
export function drawSVGPath(pathElement: SVGPathElement, options: TransitionOptions = {}): TransitionController {
  // 获取路径长度
  const pathLength = pathElement.getTotalLength();

  // 设置初始状态
  pathElement.style.strokeDasharray = `${pathLength} ${pathLength}`;
  pathElement.style.strokeDashoffset = `${pathLength}`;
  pathElement.style.visibility = "visible";

  return createTransition(
    progress => {
      // 计算当前的线条偏移量
      const offset = pathLength - progress * pathLength;
      pathElement.style.strokeDashoffset = offset.toString();
    },
    {
      duration: 1000,
      ...options,
    },
  );
}

/**
 * 创建SVG元素的变形动画
 * @param element SVG元素
 * @param fromAttrs 起始属性
 * @param toAttrs 目标属性
 * @param options 动画选项
 * @returns 动画控制器
 */
export function morphSVG(
  element: SVGElement,
  fromAttrs: Record<string, string | number>,
  toAttrs: Record<string, string | number>,
  options: TransitionOptions = {},
): TransitionController {
  // 收集所有需要动画的属性
  const allKeys = new Set([...Object.keys(fromAttrs), ...Object.keys(toAttrs)]);

  // 初始化起始状态
  for (const key of Object.keys(fromAttrs)) {
    element.setAttribute(key, fromAttrs[key].toString());
  }

  return createTransition(
    progress => {
      // 更新每个属性
      for (const key of allKeys) {
        const fromValue = fromAttrs[key] !== undefined ? fromAttrs[key] : toAttrs[key];
        const toValue = toAttrs[key] !== undefined ? toAttrs[key] : fromAttrs[key];

        // 如果值类型相同，进行插值
        if (typeof fromValue === typeof toValue) {
          if (typeof fromValue === "number") {
            const value = (fromValue as number) + ((toValue as number) - (fromValue as number)) * progress;
            element.setAttribute(key, value.toString());
          } else if (key === "d" && typeof fromValue === "string" && typeof toValue === "string") {
            // 特殊处理路径插值
            const interpolated = interpolatePath(fromValue as string, toValue as string, progress);
            element.setAttribute(key, interpolated);
          } else {
            // 非数值和路径属性，使用简单的过渡
            element.setAttribute(key, progress < 0.5 ? fromValue.toString() : toValue.toString());
          }
        }
      }
    },
    {
      duration: 300,
      ...options,
    },
  );
}

/**
 * 创建SVG色彩变化动画
 * @param element SVG元素
 * @param attributeName 颜色属性名 (fill, stroke等)
 * @param fromColor 起始颜色
 * @param toColor 目标颜色
 * @param options 动画选项
 * @returns 动画控制器
 */
export function animateSVGColor(
  element: SVGElement,
  attributeName: string,
  fromColor: string,
  toColor: string,
  options: TransitionOptions = {},
): TransitionController {
  // 解析颜色
  const parseColor = (color: string): number[] => {
    // 简单解析颜色
    if (color.startsWith("#")) {
      // 十六进制颜色
      const hex = color.slice(1);
      if (hex.length === 3) {
        return [parseInt(hex[0] + hex[0], 16), parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16)];
      } else if (hex.length === 6) {
        return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
      }
    } else if (color.startsWith("rgb")) {
      // RGB颜色
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        return [parseInt(matches[0], 10), parseInt(matches[1], 10), parseInt(matches[2], 10)];
      }
    }

    // 默认返回黑色
    return [0, 0, 0];
  };

  const fromRGB = parseColor(fromColor);
  const toRGB = parseColor(toColor);

  return createTransition(
    progress => {
      const r = Math.round(fromRGB[0] + (toRGB[0] - fromRGB[0]) * progress);
      const g = Math.round(fromRGB[1] + (toRGB[1] - fromRGB[1]) * progress);
      const b = Math.round(fromRGB[2] + (toRGB[2] - fromRGB[2]) * progress);

      element.setAttribute(attributeName, `rgb(${r}, ${g}, ${b})`);
    },
    {
      duration: 300,
      ...options,
    },
  );
}

/**
 * 创建SVG描边动画
 * @param element SVG路径元素
 * @param options 动画选项
 * @returns 动画控制器
 */
export function animateStroke(
  element: SVGPathElement | SVGElement,
  options: TransitionOptions & {
    direction?: "forward" | "reverse" | "center" | "ends";
    delay?: number;
  } = {},
): TransitionController {
  const { direction = "forward", ...transitionOptions } = options;

  // 获取路径长度
  const pathLength =
    element instanceof SVGPathElement
      ? element.getTotalLength()
      : element.hasAttribute("d")
        ? (element as unknown as SVGPathElement).getTotalLength()
        : 1000;

  // 设置初始状态
  element.style.strokeDasharray = `${pathLength}`;

  if (direction === "forward") {
    element.style.strokeDashoffset = `${pathLength}`;
  } else if (direction === "reverse") {
    element.style.strokeDashoffset = `-${pathLength}`;
  } else if (direction === "center") {
    element.style.strokeDasharray = `0 ${pathLength / 2} ${pathLength} 0`;
    element.style.strokeDashoffset = `0`;
  } else if (direction === "ends") {
    element.style.strokeDasharray = `${pathLength / 2} ${pathLength}`;
    element.style.strokeDashoffset = `-${pathLength / 2}`;
  }

  return createTransition(
    progress => {
      if (direction === "forward") {
        element.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
      } else if (direction === "reverse") {
        element.style.strokeDashoffset = `-${pathLength * (1 - progress)}`;
      } else if (direction === "center") {
        const dashLength = (progress * pathLength) / 2;
        element.style.strokeDasharray = `${dashLength} ${pathLength / 2 - dashLength} ${pathLength} 0`;
      } else if (direction === "ends") {
        const dashLength = (progress * pathLength) / 2;
        element.style.strokeDasharray = `${pathLength / 2} ${pathLength - dashLength * 2} ${dashLength}`;
      }
    },
    {
      duration: 1000,
      ...transitionOptions,
    },
  );
}

/**
 * 根据SVG路径创建路径点集合
 * @param path SVG路径元素或路径字符串
 * @param numPoints 采样点数量
 * @returns 路径点集合 [x, y][]
 */
export function getPathPoints(path: SVGPathElement | string, numPoints: number = 100): [number, number][] {
  let pathElement: SVGPathElement;

  if (typeof path === "string") {
    // 创建临时SVG路径
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    tempSvg.style.position = "absolute";
    tempSvg.style.visibility = "hidden";

    pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute("d", path);
    tempSvg.appendChild(pathElement);
    document.body.appendChild(tempSvg);
  } else {
    pathElement = path;
  }

  // 获取路径长度
  const pathLength = pathElement.getTotalLength();

  // 采样路径点
  const points: [number, number][] = [];
  for (let i = 0; i < numPoints; i++) {
    const distance = (i / (numPoints - 1)) * pathLength;
    const point = pathElement.getPointAtLength(distance);
    points.push([point.x, point.y]);
  }

  // 如果创建了临时SVG，则移除
  if (typeof path === "string") {
    document.body.removeChild(pathElement.parentNode as Node);
  }

  return points;
}

/**
 * 沿SVG路径移动元素
 * @param element DOM元素
 * @param path SVG路径元素或路径字符串
 * @param options 动画选项
 * @returns 动画控制器
 */
export function moveAlongPath(
  element: HTMLElement | SVGElement,
  path: SVGPathElement | string,
  options: TransitionOptions & {
    rotate?: boolean;
    offset?: { x: number; y: number };
  } = {},
): TransitionController {
  const { rotate = false, offset = { x: 0, y: 0 }, ...transitionOptions } = options;

  let pathElement: SVGPathElement;

  if (typeof path === "string") {
    // 创建临时SVG路径
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    tempSvg.style.position = "absolute";
    tempSvg.style.visibility = "hidden";

    pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute("d", path);
    tempSvg.appendChild(pathElement);
    document.body.appendChild(tempSvg);
  } else {
    pathElement = path;
  }

  // 获取路径长度
  const pathLength = pathElement.getTotalLength();

  // 保存原始变换
  const originalTransform = element.style.transform || "";

  return createTransition(
    progress => {
      // 计算当前路径位置
      const distance = progress * pathLength;
      const point = pathElement.getPointAtLength(distance);

      // 应用位置变换
      let transform = `translate(${point.x + offset.x}px, ${point.y + offset.y}px)`;

      // 如果需要旋转，计算路径切线角度
      if (rotate) {
        const prevDistance = Math.max(0, distance - 1);
        const nextDistance = Math.min(pathLength, distance + 1);

        const prevPoint = pathElement.getPointAtLength(prevDistance);
        const nextPoint = pathElement.getPointAtLength(nextDistance);

        // 计算角度
        const dx = nextPoint.x - prevPoint.x;
        const dy = nextPoint.y - prevPoint.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        transform += ` rotate(${angle}deg)`;
      }

      element.style.transform = transform;
    },
    {
      duration: 2000,
      ...transitionOptions,
      onComplete: () => {
        // 动画完成后清理
        if (typeof path === "string") {
          document.body.removeChild(pathElement.parentNode as Node);
        }

        // 调用原始完成回调
        if (transitionOptions.onComplete) {
          transitionOptions.onComplete();
        }
      },
    },
  );
}
