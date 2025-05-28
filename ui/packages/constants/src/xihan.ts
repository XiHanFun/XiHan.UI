import { version } from "../package.json";

/**
 * 曦寒项目信息
 */
export class XiHan {
  /**
   * 曦寒Logo
   */
  static Logo = `
   _  __ ______  _____    _   __
  | |/ //  _/ / / /   |  / | / /
  |   / / // /_/ / /| | /  |/ /
 /   |_/ // __  / ___ |/ /|  /
/_/|_/___/_/ /_/_/  |_/_/ |_/`;

  static Version = version;

  /**
   * 曦寒版权
   */
  static Copyright = `Copyright (C)2021-Present ZhaiFanhua All Rights Reserved.`;

  /**
   * 曦寒组织
   */
  static Org = `https://github.com/XiHanFun`;

  /**
   * 曦寒仓库
   */
  static Rep = `https://github.com/XiHanFun/XiHan.UI`;

  /**
   * 曦寒文档
   */
  static Doc = `https://docs.xihanfun.com`;

  /**
   * 曦寒寄语
   */
  static SendWord = `
碧落降恩承淑颜，共挚崎缘挽曦寒。
迁般故事终成忆，谨此葳蕤换思短。
              —— 致她`;

  /**
   * 曦寒标语
   */
  static Tagline = `快速、轻量、高效、用心的开发框架和组件库。基于 DotNet 和 Vue 构建。`;

  /**
   * 入口程序版本
   */
  static EntryAssemblyVersion = ``;

  /**
   * 曦寒
   */
  static SayHello() {
    return `
欢迎使用曦寒组件
${this.Logo}
${this.Version}
${this.Copyright}
${this.Org}
${this.Rep}
${this.Doc}
${this.SendWord}

${this.Tagline}
`;
  }
}
