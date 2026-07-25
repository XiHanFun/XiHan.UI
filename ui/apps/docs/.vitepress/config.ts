import { defineConfig } from 'vitepress'

// M0 占位文档站。信息架构与 API 自动生成在 M6b 落地（见 §18）。
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
