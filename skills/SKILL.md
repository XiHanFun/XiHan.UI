---
name: xihan-ui
description: 设计、实现、重构、审查或使用 XiHan.UI 组件时使用。覆盖 Core/Headless 分层、Vue/React/Web Components 适配器、DTCG 令牌、共享 CSS、统一组件设计、文档与质量门禁；也用于确认 @xihan-ui API、parts、事件和样式槽。普通非 XiHan.UI 前端任务不要加载。
---

# XiHan.UI

先识别任务类型，只读取对应资料。

## 路由

| 任务 | 必须读取 |
| --- | --- |
| 设计新组件、视觉重构、样式审查 | `references/component-design.md` |
| 点击触感、圆角、透明浮层、材质迁移 | `references/component-design.md` + `references/interaction-and-frosted.md` |
| 修改 Core、Headless、适配器、生成物或提交 | `references/repository-workflow.md` |
| 编写或迁移 Vue/React/Web Components 用法 | `references/framework-adapters.md` |
| 同时涉及设计与实现 | 先读设计规范，再读仓库流程；适配器细节按需读取 |

不要一次加载与任务无关的 reference。

## 不可变约束

- Core/Headless 是跨框架行为真源；适配器只桥接响应式、DOM 和渲染。
- 三端公开 props、事件、parts、默认值和状态语义必须一致。
- 默认皮肤只消费语义令牌、`data-scope`、`data-part` 和状态事实。
- 不添加静默兜底、推测性兼容或重复 API。
- 普通 control 4px、surface 8px、overlay 12px；pill 只用于有胶囊身份的组件。
- 离散 Action Control 按下 120ms 缩放至 0.97，释放 200ms 回到 1。
- 禁止 glass；透明浮层只允许使用 frosted 柔和模糊材质。
- 视觉改动必须用真实 Chromium 验证；jsdom 不替代计算样式、布局和动画完成。
- 一个组件或一个共享配方独立提交，不混入无关清理。

## 先查事实

在仓库根运行：

```bash
node skills/scripts/list-components.mjs [关键词]
node skills/scripts/get-component-docs.mjs <组件标识>
node skills/scripts/get-tokens.mjs [名字片段]
node skills/scripts/get-skin.mjs <组件标识>
```

这些脚本只读取当前 XiHan.UI 检出；找不到仓库或文件时直接失败，不回落到已发布站点。可用 `XIHAN_UI_ROOT` 显式指定仓库根。

组件实现前至少确认：

1. 组件是否已经存在。
2. anatomy 与 required parts。
3. Props、事件、插槽和键盘表。
4. 当前皮肤消费的语义令牌和组件槽。
5. 是否已有可复用 Family Recipe 或 Core 行为。

## 修改边界

- 用户要求解释、审查或诊断时只做只读检查，不擅自实现。
- 用户要求实现或重构时，完成源码、三端、测试、文档、生成物和 changeset 的同一功能闭环。
- 公开面删除或改名必须显式破坏，不保留旧别名；添加 major changeset。
- 保留工作区中用户已有改动，不使用破坏性 Git 命令。

## 验证

按风险从小到大验证：

1. 相关 lint、单测或浏览器用例。
2. 共享包构建后再跑其消费者。
3. `ui/` 下运行 `pnpm gate`。
4. 需要发布或影响多包时运行 `pnpm build`。
5. 文档变化在 `docs/` 下运行 `pnpm build`。

覆盖率、类型检查或快照单独通过都不等于功能完成。
