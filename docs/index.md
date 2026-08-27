---
layout: home
title: 曦寒视图组件
titleTemplate: 快速 轻量 高效 用心的框架无关跨端组件库

hero:
  name: 曦寒视图组件
  text: 框架无关的跨端组件库
  tagline: 快速、轻量、高效、用心 · 121 个组件 · 无头内核 + 多适配器
  image:
    src: /images/logo.png
    alt: 曦寒视图组件
  actions:
    - theme: brand
      text: 快速上手
      link: /quickstart

    - theme: alt
      text: 组件库简介
      link: /introduction

    - theme: alt
      text: 架构总览
      link: /overview

features:
  - title: 无头内核
    icon: 🧠
    details: 解剖、状态机与无障碍逻辑住在框架无关的内核里，适配器只负责把属性铺到宿主元素上，不重新实现任何行为。
    link: /guide/anatomy
    linkText: "了解解剖与部件契约"

  - title: 一份行为，两套宿主
    icon: 🔁
    details: Vue 组件与自定义元素跑的是同一个状态机、同一份 connect。跨适配器一致性套件逐帧比对归一化后的 DOM，证明「框架无关」不是口号。
    link: /adapters/vue
    linkText: "查看适配器"

  - title: 无障碍是判据
    icon: ♿
    details: 每个组件都有一份机读的键盘规格表，共 479 条，它同时是测试的分母——用例少覆盖一条即判套件失败。扫描跑在真实 Chromium 上。
    link: /guide/a11y
    linkText: "了解无障碍规格"

  - title: 样式与逻辑解耦
    icon: 🎨
    details: 皮肤只认 data-scope / data-part 与状态属性，不认框架也不认类名。令牌从 DTCG 源产出 CSS 变量，整包换皮肤不用碰一行 JS。
    link: /guide/styling
    linkText: "了解皮肤与样式分层"

  - title: 依赖面收得很紧
    icon: 📦
    details: 全部库包的运行时第三方依赖只有一个。浮层定位、代码着色、虚拟滚动、Web Components 响应式基类、流式 Markdown 均为自研。
    link: /npm-package-dependency
    linkText: "查看包与依赖关系"

  - title: AI 对话内核
    icon: 🤖
    details: SSE 读取、协议归一、parts 归约、会话 store 全在零 DOM 的内核里，配套 Thread / Composer / CodeBlock 三件与流式 Markdown 渲染。
    link: /guide/ai
    linkText: "了解 AI 对话内核"
---
