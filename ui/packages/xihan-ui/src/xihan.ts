/**
 * 曦寒项目信息
 */
export class XiHan {
  /**
   * Logo
   */
  static get Logo(): string {
    return `
██╗  ██╗██╗██╗  ██╗ █████╗ ███╗   ██╗
╚██╗██╔╝██║██║  ██║██╔══██╗████╗  ██║
 ╚███╔╝ ██║███████║███████║██╔██╗ ██║
 ██╔██╗ ██║██╔══██║██╔══██║██║╚██╗██║
██╔╝ ██╗██║██║  ██║██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝`;
  }

  /**
   * 版本
   */
  static get Version(): string {
    // 在TypeScript中无法直接获取Assembly版本，可以从import.meta.env或定义常量
    return `__VERSION__`;
  }

  /**
   * 版权
   */
  static get Copyright(): string {
    return `Copyright (C)2021-Present ZhaiFanhua All Rights Reserved.`;
  }

  /**
   * 文档
   */
  static get Doc(): string {
    return `https://docs.xihanfun.com`;
  }

  /**
   * 组织
   */
  static get Org(): string {
    return `https://github.com/XiHanFun`;
  }

  /**
   * 仓库
   */
  static get Rep(): string {
    return `https://github.com/XiHanFun/XiHan.UI`;
  }

  /**
   * 寄语
   */
  static get SendWord(): string {
    return `
碧落降恩承淑颜，共挚崎缘挽曦寒。
迁般故事终成忆，谨此葳蕤换思短。
`;
  }

  /**
   * 标语
   */
  static get Tagline(): string {
    return `快速、轻量、高效、用心的开发框架和组件库。基于 DotNet 和 Vue 构建。`;
  }

  /**
   * 欢迎使用曦寒
   */
  static SayHello(): void {
    console.log(this.Logo);
    console.log(this.Version);
    console.log(this.Copyright);
    console.log(this.Doc);
    console.log(this.Org);
    console.log(this.Rep);
    console.log(this.SendWord);
    console.log(this.Tagline);
  }
}
