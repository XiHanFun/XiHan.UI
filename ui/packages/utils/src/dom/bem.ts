/**
 * BEM命名规范
 * block: 块，独立实体，有意义的独立元素
 * element: 元素，块的一部分，没有独立含义
 * modifier: 修饰符，块或元素的特定状态
 */
export class BEM {
  private block: string;
  private options: {
    elementSeparator: string;
    modifierSeparator: string;
  };

  constructor(block: string, options = { elementSeparator: "__", modifierSeparator: "--" }) {
    this.block = block;
    this.options = options;
  }

  /**
   * 生成块类名
   */
  b(): string {
    return this.block;
  }

  /**
   * 生成元素类名
   */
  e(element: string): string {
    return `${this.block}${this.options.elementSeparator}${element}`;
  }

  /**
   * 生成修饰符类名
   */
  m(modifier: string): string {
    return `${this.block}${this.options.modifierSeparator}${modifier}`;
  }

  /**
   * 生成元素的修饰符类名
   */
  em(element: string, modifier: string): string {
    return `${this.e(element)}${this.options.modifierSeparator}${modifier}`;
  }
}
