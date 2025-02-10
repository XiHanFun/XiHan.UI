/**
 * 字符串格式化工具
 */
export const stringUtils = {
  /**
   * 首字母大写
   * @param str - 输入字符串
   * @returns 首字母大写的字符串
   * @example capitalize('hello') => 'Hello'
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * 首字母小写
   * @param str - 输入字符串
   * @returns 首字母小写的字符串
   * @example uncapitalize('Hello') => 'hello'
   */
  uncapitalize(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  },

  /**
   * 转换为小驼峰命名
   * @param str - 输入字符串
   * @returns 小驼峰格式的字符串
   * @example toCamelCase('hello-world') => 'helloWorld'
   * @example toCamelCase('hello_world') => 'helloWorld'
   */
  toCamelCase(str: string): string {
    const pascalCase = str
      .replace(/^[-_]/, "") // 移除开头的连字符或下划线
      .replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  },

  /**
   * 转换为大驼峰命名
   * @param str - 输入字符串
   * @returns 大驼峰格式的字符串
   * @example toPascalCase('hello-world') => 'HelloWorld'
   * @example toPascalCase('hello_world') => 'HelloWorld'
   */
  toPascalCase(str: string): string {
    const pascalCase = str
      .replace(/^[-_]/, "") // 移除开头的连字符或下划线
      .replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
    return pascalCase.charAt(0).toUpperCase() + pascalCase.slice(1);
  },

  /**
   * 转换为下划线命名
   * @param str - 输入字符串
   * @returns 下划线格式的字符串
   * @example toSnakeCase('helloWorld') => 'hello_world'
   */
  toSnakeCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  },

  /**
   * 转换为中划线命名
   * @param str - 输入字符串
   * @returns 中划线格式的字符串
   * @example toKebabCase('helloWorld') => 'hello-world'
   */
  toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  },

  /**
   * 截断字符串
   * @param str - 输入字符串
   * @param length - 截断长度
   * @param suffix - 后缀字符串
   * @returns 截断后的字符串
   * @example truncate('hello world', 5) => 'hello...'
   */
  truncate(str: string, length: number, suffix = "..."): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + suffix;
  },

  /**
   * 格式化字符串
   * @param template - 模板字符串
   * @param args - 替换参数
   * @returns 格式化后的字符串
   * @example format('Hello {0}', 'World') => 'Hello World'
   */
  format(template: string, ...args: string[]): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(args[key] ?? ""));
  },

  /**
   * 模板字符串替换
   * @param template - 模板字符串
   * @param data - 替换数据对象
   * @returns 替换后的字符串
   * @example template('Hello {name}', { name: 'World' }) => 'Hello World'
   */
  template(template: string, data: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? ""));
  },

  /**
   * 转义 HTML 特殊字符
   * @param str - 输入字符串
   * @returns 转义后的字符串
   * @example escapeHtml('<div>') => '&lt;div&gt;'
   */
  escapeHtml(str: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return str.replace(/[&<>"']/g, m => map[m]);
  },
};
