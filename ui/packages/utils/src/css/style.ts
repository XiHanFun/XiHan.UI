/**
 * 样式操作
 */
export const style = {
  /**
   * 获取元素计算样式
   * @param element 元素
   * @param property 属性
   * @returns 属性值
   */
  get(element: HTMLElement, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property);
  },

  /**
   * 设置元素样式
   * @param element 元素
   * @param property 属性
   * @param value 值
   */
  set(element: HTMLElement, property: string | Record<string, string | number>, value?: string | number): void {
    if (typeof property === "string") {
      element.style[property as any] = String(value);
    } else {
      Object.entries(property).forEach(([prop, val]) => {
        element.style[prop as any] = String(val);
      });
    }
  },

  /**
   * 添加类名
   * @param element 元素
   * @param classNames 类名
   */
  addClass(element: HTMLElement, ...classNames: string[]): void {
    element.classList.add(...classNames.filter(Boolean));
  },

  /**
   * 移除类名
   * @param element 元素
   * @param classNames 类名
   */
  removeClass(element: HTMLElement, ...classNames: string[]): void {
    element.classList.remove(...classNames.filter(Boolean));
  },

  /**
   * 切换类名
   * @param element 元素
   * @param className 类名
   * @param force 强制切换
   */
  toggleClass(element: HTMLElement, className: string, force?: boolean): void {
    element.classList.toggle(className, force);
  },

  /**
   * 检查是否包含类名
   * @param element 元素
   * @param className 类名
   * @returns 是否包含类名
   */
  hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  },

  /**
   * 获取或设置元素的display属性
   * @param element 元素
   * @param value 值
   * @returns 值
   */
  display(element: HTMLElement, value?: string): string {
    if (value === undefined) {
      return this.get(element, "display");
    }
    this.set(element, "display", value);
    return value;
  },

  /**
   * 显示元素
   * @param element 元素
   */
  show(element: HTMLElement): void {
    const display = element.style.display;
    if (display === "none") {
      element.style.display = element.dataset.defaultDisplay || "block";
    }
  },

  /**
   * 隐藏元素
   * @param element 元素
   */
  hide(element: HTMLElement): void {
    const display = this.get(element, "display");
    if (display !== "none") {
      element.dataset.defaultDisplay = display;
      element.style.display = "none";
    }
  },

  /**
   * 切换元素显示状态
   * @param element 元素
   */
  toggle(element: HTMLElement): void {
    if (this.get(element, "display") === "none") {
      this.show(element);
    } else {
      this.hide(element);
    }
  },
};

/**
 * CSS变量操作
 */
export const cssVar = {
  /**
   * 获取CSS变量值
   * @param name 变量名
   * @param element 元素
   * @returns 变量值
   */
  get(name: string, element?: HTMLElement): string {
    const target = element || document.documentElement;
    return getComputedStyle(target).getPropertyValue(`--${name}`).trim();
  },

  /**
   * 设置CSS变量值
   * @param name 变量名
   * @param value 值
   * @param element 元素
   */
  set(name: string, value: string, element?: HTMLElement): void {
    const target = element || document.documentElement;
    target.style.setProperty(`--${name}`, value);
  },

  /**
   * 移除CSS变量
   * @param name 变量名
   * @param element 元素
   */
  remove(name: string, element?: HTMLElement): void {
    const target = element || document.documentElement;
    target.style.removeProperty(`--${name}`);
  },

  /**
   * 获取所有CSS变量
   * @param element 元素
   * @returns 所有CSS变量
   */
  getAll(element?: HTMLElement): Record<string, string> {
    const target = element || document.documentElement;
    const styles = getComputedStyle(target);
    const vars: Record<string, string> = {};

    Object.keys(styles).forEach(key => {
      if (key.startsWith("--")) {
        vars[key.slice(2)] = styles.getPropertyValue(key).trim();
      }
    });

    return vars;
  },
};
