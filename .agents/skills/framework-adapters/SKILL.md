---
name: xihan-ui-framework-adapters
description: 编写、迁移、审查或调试 XiHan.UI 的 Vue、React 和 Web Components 适配器及用法时使用。适用于三端 API 对齐、插槽/children、事件、Light DOM、Portal 和生命周期问题；共享行为应使用组件开发技能处理。
---

# XiHan.UI 框架适配器

先读 `references/framework-adapters.md`，再检查目标组件的 Headless `connect`、anatomy、types、meta 和另外两个适配器。

## 不可变约束

- Headless 契约是行为真源；适配器不得改变默认值、状态、键盘或事件载荷。
- React 使用函数组件和显式 props 类型；Vue 使用组合式、带类型 emits 和 slots。
- Web Components 使用作者提供的 Light DOM；作者节点以 `data-xh-part` 声明角色，升级后投影为稳定 parts。
- 非冒泡事件使用原生监听，不假设框架合成事件等价。
- Portal、DOM 引用和监听在挂载后建立，并在卸载时释放；SSR 首屏不读取浏览器对象决定结构。
- 三端公开名称、必需部件、受控语义、错误行为和可访问属性保持一致。

## 工作方式

1. 先确定问题来自 Headless 契约还是单一适配器桥接。
2. 共享缺陷回到 Core/Headless 修复，不在三个适配器分别打补丁。
3. 适配器专属差异只处理框架语法、生命周期和 DOM 能力。
4. 同步更新三端示例、类型、CEM 和一致性测试。

验证至少包含目标适配器测试、三端一致性套件和相关 Chromium 用例。
