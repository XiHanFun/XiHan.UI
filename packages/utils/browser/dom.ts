// DOM 操作相关

/**
 * 检查元素是否包含特定的类名
 *
 * @param el {Element} - 待检查的元素
 * @param cls {string} - 类名，用于检查元素是否包含
 * @returns {boolean} - 如果元素包含该类名则返回true，否则返回false
 */
export const hasClass = (el: Element, cls: string): boolean => {
  // 验证传入的元素和类名是否有效，若任一无效则直接返回false
  if (!el || !cls) return false;

  // 使用Element的classList属性来检查是否包含指定类名
  return el.classList.contains(cls);
};

/**
 * 给指定元素添加一个或多个类名
 *
 * @param el 要添加类名的元素如果为null或undefined，则函数不执行任何操作
 * @param cls 要添加的类名或类名数组如果为空字符串，则函数不执行任何操作
 */
export const addClass = (el: Element, cls: string) => {
  // 检查传入的元素和类名是否有效，如果任一无效，则不执行任何操作
  if (!el || !cls.trim()) return;

  // 将类名字符串按空格分割成数组，并将每个类名添加到元素的类名列表中
  el.classList.add(...cls.split(" "));
};

/**
 * 移除元素上的一个或多个类名
 *
 * @param el 要操作的元素
 * @param cls 要移除的类名，可以是单个类名或多个类名以空格分隔的字符串
 */
export const removeClass = (el: Element, cls: string) => {
  // 检查元素或类名是否为空，如果为空则直接返回
  if (!el || !cls.trim()) return;

  // 将类名字符串按空格分割成数组，并移除元素上的这些类名
  el.classList.remove(...cls.split(" "));
};
