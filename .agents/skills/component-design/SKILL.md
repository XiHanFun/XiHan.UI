---
name: xihan-ui-component-design
description: 设计、重构或审查 XiHan.UI 组件的视觉、交互、状态、材质、文档示例和组件总览时使用。适用于新增组件设计、样式统一、视觉缺陷和交互反馈；纯行为实现或适配器接线使用对应开发技能。
---

# XiHan.UI 组件设计

组件设计和视觉修改必须先读 `references/component-design.md`。涉及点击触感、圆角、透明浮层、glass 迁移或动画时，再读 `references/interaction-and-frosted.md`。

## 设计顺序

1. 确认用户任务、使用边界和现有组件是否已覆盖。
2. 定义 anatomy、状态、事件、键盘和生命周期，再确定表现。
3. 归入 Action Control、Field Chrome、Collection Item、Surface、Overlay 或 Feedback 家族；图表部件归图表家具或数据标记。
4. 使用现有语义令牌、Family Recipe 和组件槽确定尺寸、层级与状态。
5. 同步检查组件文档、首个示例和组件总览预览，删除重复示例。

## 强制设计规则

- 普通 control 4px、surface 8px、overlay 12px；pill 只用于明确的胶囊身份。
- 离散 Action Control 按下 120ms 缩放至 0.97，释放 200ms 回到 1；集合项只换面、不整体缩放。
- 禁止 glass 材质和兼容别名；透明浮层只允许 frosted 柔和模糊。
- 颜色、间距、圆角、阴影和动效只使用令牌，不在组件中增加散值。
- 图表按数据任务与坐标系划分组件；数据色只经 `--xh-chart-*` 语义层，图表文字不用系列色；不提供双 y 轴。
- rest、hover、pressed、focus-visible、selected/open、disabled、loading、invalid 和退出状态按实际能力补齐。
- 亮色、暗色、compact、RTL、粗指针、reduced motion、reduced transparency、forced colors 和 print 一并审查。

## 查当前事实

需要读取组件、文档、令牌或皮肤时，使用同仓库开发技能提供的只读脚本：

```bash
node .agents/skills/component-development/scripts/list-components.mjs [关键词]
node .agents/skills/component-development/scripts/get-component-docs.mjs <组件标识>
node .agents/skills/component-development/scripts/get-tokens.mjs [名字片段]
node .agents/skills/component-development/scripts/get-skin.mjs <组件标识>
```

不得凭第三方截图或记忆猜当前公开面。视觉结果必须在真实 Chromium 中验证，jsdom 不替代布局、计算样式和动画完成。
