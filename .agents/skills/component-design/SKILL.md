---
name: xihan-ui-component-design
description: 设计、重构或审查 XiHan.UI 组件的视觉、交互、状态、材质、文档示例和组件总览时使用。适用于新增组件设计、样式统一、视觉缺陷和交互反馈；纯行为实现或适配器接线使用对应开发技能。
---

# XiHan.UI 组件设计

组件设计和视觉修改必须先读 `references/component-design.md`。涉及点击触感、圆角、透明浮层、liquid、glass 迁移或动画时，再读 `references/interaction-and-frosted.md`。

## 设计顺序

1. 确认用户任务、使用边界和现有组件是否已覆盖。
2. 定义 anatomy、状态、事件、键盘和生命周期，再确定表现。
3. 归入 Action Control、Field Chrome、Collection Item、Surface、Overlay 或 Feedback 家族；图表部件归图表家具或数据标记。
4. 使用现有语义令牌、Family Recipe 和组件槽确定尺寸、层级与状态。
5. 同步检查组件文档、首个示例和组件总览示意图（设计真源 §15.2），删除重复示例。

## 强制设计规则

数值与细则只在设计真源里写一份，这里只给去处，动手前读对应章节：

| 主题 | 真源章节 |
| --- | --- |
| 圆角种子与形状身份、内层圆角 | §6.3 |
| 缺省 / 下限 / 上限尺寸、面内滚动 | §6.8、§6.6 |
| 排版与字体继承、`global.css` | §6.4 |
| 控件内图标档 | §6.5 |
| 视觉轴（Button 的 `dashed` / `link` 等） | §5.2 |
| 层级与阴影三档 | §5.3 |
| 语义色、交互阶梯、选中与当前态、墨色域 | §7.1–§7.3、§7.7 |
| 数据色与图表家具 | §6.7、§7.6、§12.5 |
| 字段面、聚焦环、边界三选一、清空钮 | §7.2、§8.3 |
| frosted 浮层面、禁止 glass、liquid | §8.1、§8.2、§8.4、§8.5 |
| 按压反馈、披露、浮层进出场、勾选标记、弹簧 | §9.1–§9.5、§9.11、§9.13 |
| 减弱动效、强制色、打印、断点 | §14.4–§14.6 |

另有两条不看章节也要守：

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
