/**
 * 获取鼠标相对于视口的位置
 * @param event 鼠标事件对象
 * @returns 返回鼠标相对于视口的坐标
 */
export function getPosition(event: MouseEvent): { x: number; y: number } {
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

/**
 * 获取鼠标相对于页面的位置（包含滚动距离）
 * @param event 鼠标事件对象
 * @returns 返回鼠标相对于页面的坐标
 */
export function getPagePosition(event: MouseEvent): { x: number; y: number } {
  return {
    x: event.pageX,
    y: event.pageY,
  };
}

/**
 * 获取鼠标相对于目标元素的位置
 * @param event 鼠标事件对象
 * @param target 目标元素
 * @returns 返回鼠标相对于目标元素的坐标
 */
export function getRelativePosition(event: MouseEvent, target: Element): { x: number; y: number } {
  const rect = target.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

/**
 * 监听全局鼠标移动
 * @param callback 回调函数，接收鼠标位置参数
 * @returns 返回取消监听的函数
 */
export function onMouseMove(callback: (position: { x: number; y: number }) => void): () => void {
  const handler = (event: MouseEvent) => {
    callback(getPosition(event));
  };
  window.addEventListener("mousemove", handler);
  return () => window.removeEventListener("mousemove", handler);
}

/**
 * 判断是否为右键点击
 * @param event 鼠标事件对象
 * @returns 返回是否为右键点击
 */
export function isRightClick(event: MouseEvent): boolean {
  return event.button === 2;
}

/**
 * 阻止鼠标右键默认行为
 * @param element 目标元素，默认为 document
 * @returns 返回取消阻止的函数
 */
export function preventRightClick(element: Element | Document = document): () => void {
  const handler = (event: Event) => (event as MouseEvent).preventDefault();
  element.addEventListener("contextmenu", handler);
  return () => element.removeEventListener("contextmenu", handler);
}

/**
 * 获取鼠标按下的按键
 * @param event 鼠标事件对象
 * @returns 返回按下的按键名称
 */
export function getButton(event: MouseEvent): "left" | "middle" | "right" | "unknown" {
  switch (event.button) {
    case 0:
      return "left";
    case 1:
      return "middle";
    case 2:
      return "right";
    default:
      return "unknown";
  }
}

/**
 * 监听双击事件
 * @param element 目标元素
 * @param callback 回调函数
 * @param options 配置选项
 * @returns 返回取消监听的函数
 */
export function onDoubleClick(
  element: Element,
  callback: (event: MouseEvent) => void,
  options: AddEventListenerOptions = {},
): () => void {
  const handler = (event: Event) => callback(event as MouseEvent);
  element.addEventListener("dblclick", handler, options);
  return () => element.removeEventListener("dblclick", handler);
}

/**
 * 监听鼠标悬停
 * @param element 目标元素
 * @param onEnter 鼠标进入回调
 * @param onLeave 鼠标离开回调
 * @returns 返回取消监听的函数
 */
export function onHover(
  element: Element,
  onEnter: (event: MouseEvent) => void,
  onLeave: (event: MouseEvent) => void,
): () => void {
  const handleEnter = (event: Event) => onEnter(event as MouseEvent);
  const handleLeave = (event: Event) => onLeave(event as MouseEvent);

  element.addEventListener("mouseenter", handleEnter);
  element.addEventListener("mouseleave", handleLeave);
  return () => {
    element.removeEventListener("mouseenter", handleEnter);
    element.removeEventListener("mouseleave", handleLeave);
  };
}
