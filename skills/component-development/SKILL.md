---
name: xihan-ui-component-development
description: 实现、重构、修复或测试 XiHan.UI 组件时使用。覆盖 Core/Headless、Vue/React/Web Components、共享 CSS、生成物、文档、changeset 和质量门禁；仅讨论视觉方案时使用组件设计技能。
---

# XiHan.UI 组件开发

开始前读取 `references/repository-workflow.md`。涉及视觉、交互或样式决策时，同时读取 `../component-design/references/component-design.md`；涉及框架接法或三端差异时读取 `../framework-adapters/references/framework-adapters.md`。

## 先查事实

```bash
node .agents/skills/component-development/scripts/list-components.mjs [关键词]
node .agents/skills/component-development/scripts/get-component-docs.mjs <组件标识>
node .agents/skills/component-development/scripts/get-tokens.mjs [名字片段]
node .agents/skills/component-development/scripts/get-skin.mjs <组件标识>
```

脚本只读取当前检出；找不到仓库或文件时直接失败，不回落到已发布站点。

## 实现边界

- Core 放跨组件且框架无关的行为原语；Headless 是组件状态、事件、键盘、ARIA、anatomy 和默认值真源。
- 适配器只桥接框架响应式、DOM、Portal、原生监听和渲染，不复制共享行为。
- Vue、React 和 Web Components 的 props、事件、parts、默认值与状态语义必须一致。
- 共享 CSS 只消费语义令牌、parts 和状态事实；不从 DOM 内容猜业务状态。
- 删除或改名公开面时显式破坏并添加 major changeset，不保留推测性别名或静默兜底。
- 一个组件或一个共享配方独立提交，契约、三端、测试、文档和生成物形成同一闭环。

## 验证

先跑受影响包和用例，再按改动扩大：

1. Core/Headless 构建及相关单测。
2. 三端一致性和真实浏览器用例。
3. `ui/` 下运行 `pnpm gate`。
4. 影响多包或发布时运行 `pnpm build`。
5. 文档变化在 `docs/` 下运行 `pnpm build`。

重建共享 dist 时不要并行运行其消费者。覆盖率、类型检查或快照单独通过不代表组件完成。
