/**
 * DOM 元素操作工具
 */

export interface ElementOptions {
  tag?: string;
  className?: string | string[];
  id?: string;
  attributes?: Record<string, string>;
  styles?: Record<string, string | number>;
  children?: (HTMLElement | string)[];
  parent?: HTMLElement;
}

/**
 * 创建 DOM 元素
 */
export function createElement(options: ElementOptions): HTMLElement {
  const { tag = "div", className, id, attributes, styles, children, parent } = options;

  const element = document.createElement(tag);

  // 设置 ID
  if (id) {
    element.id = id;
  }

  // 设置类名
  if (className) {
    if (Array.isArray(className)) {
      element.classList.add(...className);
    } else {
      element.className = className;
    }
  }

  // 设置属性
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  // 设置样式
  if (styles) {
    Object.entries(styles).forEach(([key, value]) => {
      (element.style as any)[key] = value;
    });
  }

  // 添加子元素
  if (children) {
    children.forEach(child => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  // 添加到父元素
  if (parent) {
    parent.appendChild(element);
  }

  return element;
}

/**
 * 查找元素
 */
export const find = {
  /**
   * 根据选择器查找单个元素
   */
  one<T extends HTMLElement = HTMLElement>(selector: string, context?: HTMLElement | Document): T | null {
    return (context || document).querySelector<T>(selector);
  },

  /**
   * 根据选择器查找多个元素
   */
  all<T extends HTMLElement = HTMLElement>(selector: string, context?: HTMLElement | Document): T[] {
    return Array.from((context || document).querySelectorAll<T>(selector));
  },

  /**
   * 根据 ID 查找元素
   */
  byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
  },

  /**
   * 根据类名查找元素
   */
  byClass<T extends HTMLElement = HTMLElement>(className: string, context?: HTMLElement | Document): T[] {
    return Array.from((context || document).getElementsByClassName(className)) as T[];
  },

  /**
   * 根据标签名查找元素
   */
  byTag<T extends HTMLElement = HTMLElement>(tagName: string, context?: HTMLElement | Document): T[] {
    return Array.from((context || document).getElementsByTagName(tagName)) as T[];
  },

  /**
   * 查找最近的匹配祖先元素
   */
  closest<T extends HTMLElement = HTMLElement>(element: HTMLElement, selector: string): T | null {
    return element.closest<T>(selector);
  },

  /**
   * 查找下一个兄弟元素
   */
  next<T extends HTMLElement = HTMLElement>(element: HTMLElement, selector?: string): T | null {
    let sibling = element.nextElementSibling as T | null;
    while (sibling) {
      if (!selector || sibling.matches(selector)) {
        return sibling;
      }
      sibling = sibling.nextElementSibling as T | null;
    }
    return null;
  },

  /**
   * 查找上一个兄弟元素
   */
  prev<T extends HTMLElement = HTMLElement>(element: HTMLElement, selector?: string): T | null {
    let sibling = element.previousElementSibling as T | null;
    while (sibling) {
      if (!selector || sibling.matches(selector)) {
        return sibling;
      }
      sibling = sibling.previousElementSibling as T | null;
    }
    return null;
  },

  /**
   * 查找所有兄弟元素
   */
  siblings<T extends HTMLElement = HTMLElement>(element: HTMLElement, selector?: string): T[] {
    const siblings: T[] = [];
    let sibling = element.parentElement?.firstElementChild as T | null;

    while (sibling) {
      if (sibling !== element && (!selector || sibling.matches(selector))) {
        siblings.push(sibling);
      }
      sibling = sibling.nextElementSibling as T | null;
    }

    return siblings;
  },
};

/**
 * 元素操作工具
 */
export const element = {
  /**
   * 移除元素
   */
  remove(element: HTMLElement): void {
    element.remove();
  },

  /**
   * 克隆元素
   */
  clone(element: HTMLElement, deep = true): HTMLElement {
    return element.cloneNode(deep) as HTMLElement;
  },

  /**
   * 替换元素
   */
  replace(oldElement: HTMLElement, newElement: HTMLElement): void {
    oldElement.parentNode?.replaceChild(newElement, oldElement);
  },

  /**
   * 在元素前插入
   */
  insertBefore(newElement: HTMLElement, targetElement: HTMLElement): void {
    targetElement.parentNode?.insertBefore(newElement, targetElement);
  },

  /**
   * 在元素后插入
   */
  insertAfter(newElement: HTMLElement, targetElement: HTMLElement): void {
    targetElement.parentNode?.insertBefore(newElement, targetElement.nextSibling);
  },

  /**
   * 包装元素
   */
  wrap(element: HTMLElement, wrapper: HTMLElement): void {
    element.parentNode?.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  },

  /**
   * 解包元素
   */
  unwrap(element: HTMLElement): void {
    const parent = element.parentElement;
    if (parent && parent.parentElement) {
      while (element.firstChild) {
        parent.parentElement.insertBefore(element.firstChild, parent);
      }
      parent.remove();
    }
  },

  /**
   * 清空元素内容
   */
  empty(element: HTMLElement): void {
    element.innerHTML = "";
  },

  /**
   * 获取元素位置信息
   */
  getRect(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  },

  /**
   * 获取元素相对于文档的偏移
   */
  getOffset(element: HTMLElement): { top: number; left: number } {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
    };
  },

  /**
   * 检查元素是否在视口中
   */
  isInViewport(element: HTMLElement, threshold = 0): boolean {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= windowHeight + threshold &&
      rect.right <= windowWidth + threshold
    );
  },

  /**
   * 滚动到元素
   */
  scrollIntoView(element: HTMLElement, options?: ScrollIntoViewOptions): void {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
      ...options,
    });
  },

  /**
   * 获取元素的计算样式
   */
  getComputedStyle(element: HTMLElement, property?: string): string | CSSStyleDeclaration {
    const computed = window.getComputedStyle(element);
    return property ? computed.getPropertyValue(property) : computed;
  },

  /**
   * 检查元素是否匹配选择器
   */
  matches(element: HTMLElement, selector: string): boolean {
    return element.matches(selector);
  },

  /**
   * 获取元素的文本内容
   */
  getText(element: HTMLElement): string {
    return element.textContent || "";
  },

  /**
   * 设置元素的文本内容
   */
  setText(element: HTMLElement, text: string): void {
    element.textContent = text;
  },

  /**
   * 获取元素的 HTML 内容
   */
  getHtml(element: HTMLElement): string {
    return element.innerHTML;
  },

  /**
   * 设置元素的 HTML 内容
   */
  setHtml(element: HTMLElement, html: string): void {
    element.innerHTML = html;
  },
};

/**
 * 属性操作工具
 */
export const attr = {
  /**
   * 获取属性值
   */
  get(element: HTMLElement, name: string): string | null {
    return element.getAttribute(name);
  },

  /**
   * 设置属性值
   */
  set(element: HTMLElement, name: string, value: string): void {
    element.setAttribute(name, value);
  },

  /**
   * 移除属性
   */
  remove(element: HTMLElement, name: string): void {
    element.removeAttribute(name);
  },

  /**
   * 检查是否有属性
   */
  has(element: HTMLElement, name: string): boolean {
    return element.hasAttribute(name);
  },

  /**
   * 获取所有属性
   */
  getAll(element: HTMLElement): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attrs[attr.name] = attr.value;
    }
    return attrs;
  },

  /**
   * 设置多个属性
   */
  setAll(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  },
};

/**
 * 数据属性操作工具
 */
export const data = {
  /**
   * 获取数据属性值
   */
  get(element: HTMLElement, key: string): string | undefined {
    return element.dataset[key];
  },

  /**
   * 设置数据属性值
   */
  set(element: HTMLElement, key: string, value: string): void {
    element.dataset[key] = value;
  },

  /**
   * 移除数据属性
   */
  remove(element: HTMLElement, key: string): void {
    delete element.dataset[key];
  },

  /**
   * 检查是否有数据属性
   */
  has(element: HTMLElement, key: string): boolean {
    return key in element.dataset;
  },

  /**
   * 获取所有数据属性
   */
  getAll(element: HTMLElement): DOMStringMap {
    return element.dataset;
  },

  /**
   * 设置多个数据属性
   */
  setAll(element: HTMLElement, data: Record<string, string>): void {
    Object.entries(data).forEach(([key, value]) => {
      element.dataset[key] = value;
    });
  },
};
