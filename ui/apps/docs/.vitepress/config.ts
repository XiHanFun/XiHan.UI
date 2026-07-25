import { defineConfig } from 'vitepress'

// 文档站基础配置；信息架构与 API 文档自动生成后续补充。
export default defineConfig({
  title: 'XiHan.UI',
  description: '跨框架、企业级、设计系统驱动的 UI 基础设施',
  lang: 'zh-CN',
  themeConfig: {
    nav: [{ text: '指南', link: '/' }],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/XiHanFun/XiHan.UI' },
    ],
  },
})
