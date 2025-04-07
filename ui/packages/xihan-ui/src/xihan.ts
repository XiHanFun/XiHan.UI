import { version } from "../package.json";

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
    return version;
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
               —— 致她
`;
  }

  /**
   * 标语
   */
  static get Tagline(): string {
    return `快速、轻量、高效、用心的开发框架和组件库。基于 DotNet 和 Vue 构建。`;
  }
}
