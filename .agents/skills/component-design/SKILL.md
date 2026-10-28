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

- 圆角由一颗种子 `--xh-radius-seed`（8px）派生：inset 4px、control / surface / overlay 8px、sheet 10px（Dialog、Drawer、Notification 卡片）；内层圆角不大于外层减内衬；pill 只用于明确的胶囊身份。
- 尺寸按 §6.8 的缺省 / 下限 / 上限表取档：新组件先找同类组件，取同一组语义尺寸令牌；有上限就要有面内滚动或条目截断，浮层上限再与可用区取 `min()`；表里没有的档先加语义令牌，不在皮肤写字面尺寸。
- 离散 Action Control 按下 150ms 换到 active 底，缩放取 `--xh-motion-scale-press`（缺省 1）；释放 200ms 回到 rest；集合项只换面、不整体缩放。
- 动效按 §9 的角色取令牌，时长两档：换色 150ms、几何 200ms；几何动画不用 `micro` / `enter` / `exit` 时长；有进场即有退场；初始内容不播进场；弹层只有一套进出场（§9.5）；勾选标记描线生长、全选与半选交叉缩放（§9.13）；减弱动效去位移、留淡变（§14.4）。
- 字段缺省白底（`--xh-bg-field`）+ `--xh-border-control`；聚焦环两层：1px 品牌内圈 + 3px 品牌 30% 光环，不随 tone、即时出现，字段的内圈就是品牌描边（§7.2、§8.3）。
- 阴影三档按面的类型取：raised sm、floating / frosted md、sheet lg（§5.3）。
- 禁止 glass 材质和兼容别名；锚定浮层走 frosted 配方（缺省实体底 + 描边 + md 档投影）；导航层在 `data-material="liquid"` 下可用 liquid（§8.5），内容层、浮层与模态不用。
- Tooltip 两个主题都不反白，与 Popover 同一副浮层面，写了 tone 才取语气实底；悬停 150ms 出、100ms 收（§8.4、§9.9）。模态遮罩浅色 40%、深色 60%。
- 控件内图标 sm / md / lg 为 16 / 18 / 20（§6.5）；字段清空钮圆形、有值且悬停或聚焦才出现，触屏常显（§8.3）；Alert 带语气淡边；Progress 线形厚 4 / 8 / 12。
- 字体继承宿主，皮肤不写 `font-family`；缺省栈 `--xh-font-family-sans` 只经可选入口 `@xihan-ui/styles/global.css` 落到 `:root`（§6.4）。Button 另有 `dashed` / `link` 两档变体，其余按钮形触发器不开放（§5.2）。
- 彩色面声明墨色域（§7.7），中性描边与淡底取墨色比例，不直接取中性原语。
- 弹簧只用于手势松手（缺省）与 liquid 档的切换、指示（§9.11）；断点按视口，低于断点用补集写法，不用容器查询（§14.6）。
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
