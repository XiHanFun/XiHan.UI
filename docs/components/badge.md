# Badge 徽标

提示某个对象有需要注意的变化：未读数量、当前状态、是否为新。徽标表达“发生了什么”，不表达“这是什么”；后者由[标签](./tag)承担。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/badge" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/badge.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/badge" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/badge" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/badge.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

被标记的元素写进默认插槽，角标自行贴到它的角上；计数、上限截断与 0 值收起都由角标计算

<XhDemo src="badge/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="badge"`：**`root`** · **`indicator`**

## 示例

### 圆点与落点

dot 只表示有而不表示数量；placement 决定挂在哪个角，rtl 下 end 自动落到左边

<XhDemo src="badge/02-dot" />

### 语气与尺寸

tone 决定使用哪族颜色：角标实际以未读红点与在线/离线点为主；size 改变圆点直径、两位数时的最小宽度与字号

<XhDemo src="badge/03-tone-size" />

### 自定义角标内容

拆为 Root + Indicator 两件：角标内可自行排版，插槽可得到计算好的计数；不写内容才回落为数字，showZero 让 0 保留显示

<XhDemo src="badge/04-custom-indicator" />

### 呼吸

pulse 让圆点呼吸，表达正在进行、给不出进度的状态；状态仍要写在文字里，减弱动效下圆点停在满亮

<XhDemo src="badge/05-pulse" />

## 设计指引

### 何时使用

- 计数角标：未读消息、购物车件数、待办条数。
- 小圆点：只表示有新内容，不表示数量。
- 状态提示：在线 / 离线、进行中、新。
- 附着在按钮、头像、标签页、菜单项上，报告该对象的状态。

### 何时不用

- 表达分类、技能、筛选条件等实体身份时，使用[标签](./tag)，它可以被移除。
- 用户需要点击它进行筛选或删除时，徽标不接受交互，应使用标签。
- 表达进度时，使用[进度条](./progress)。
- 可开关的选项使用[切换按钮](./toggle)。

### 特性

- 语气与尺寸两轴与其他组件同源；角标只有一种形态，没有形态轴。
- 默认使用 neutral；未读、错误等强提醒显式使用 danger。
- `placement` 决定挂在哪个角，四角可选，跟随文字方向。
- `count` 输出数字，超过 `max`（默认 99）时显示为“99+”。
- 计数为 0 时整个收起，需要显示 0 时开启 `showZero`。
- `dot` 收成一个圆点，只表示存在，不表示数量。
- 计数盒三档最小尺寸为 14 / 28 / 32px，角标只探出宿主四分之一，保持与宿主的视觉连接；sm 是贴在图标按钮角上的小号，字仍是 12px。
- `label` 为读屏提供完整语句，避免只读出一个数字。

### 组合

- 挂在[头像](./avatar)、[按钮](./button)、[标签页](./tabs)的标签上作为角标：被标记的对象直接写进默认插槽，定位与偏移由组件承担，不需要外层再提供定位上下文。

### 最佳实践

- 角标必须给 `label`：读屏只读出一个数字时，用户无法判断它的含义。
- 状态不能只用颜色区分，文字必须说明。
- 数量变化的场景交给 `count` 计算，不自行拼接“99+”，避免上限口径不一致。

### 反模式

- 将徽标用作分类标签：它不可交互、不可移除。
- 一屏内大量使用高饱和度徽标，会使提醒失去意义。
- 用徽标承载长句子。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-badge>` |
| Vue 组件 | `XhBadge` `XhBadgeIndicator` `XhBadgeRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/badge.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 计数。提供后角标自行显示数字，超过 max 时显示为「max+」。 与 indicator 的默认插槽二选一：插槽有内容时以插槽为准。 |
| `dot` | `boolean` |  | 只显示圆点，不显示数字。提供后 count 只用于决定是否显示。 |
| `label` | `string` |  | 读屏朗读该角标的方式。 角标挂在按钮、头像上时只朗读数字无法表达含义，需要由宿主提供「3 条未读」这类完整语句。 |
| `max` | `number` |  | 计数上限，默认 99：超过时只显示 99+，避免角标变形。 |
| `placement` | `BadgePlacement` |  | 挂在哪个角，默认 top-end（右上角；rtl 下自动落到左上）。 |
| `pulse` | `boolean` |  | 圆点呼吸：表达正在进行、给不出进度的状态（直播、录制、通话中）。只在 dot 模式下生效， 数字角标不呼吸——明暗起伏会压低数字的对比度。减弱动效下停在满不透明度。 |
| `showZero` | `boolean` |  | 计数为 0 时是否仍然显示，默认不显示：没有未读时不应出现角标。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。影响圆点直径、两位数时的最小宽度与字号。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色，默认 neutral。 角标实际使用中主要为 danger（未读红点）与 success / neutral（在线 / 离线点）。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhBadge` | `default` | — |  |
| `XhBadgeIndicator` | `default` | `{ text: string }` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhBadgeIndicator` | `children` | `SlotChildren<BadgeIndicatorSlotProps>` |  |  |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 当前是否应渲染：计数为 0 且未开启 showZero 时为假。 |
| `text` | `string` | 计算后的显示文本：超过 max 时显示为「99+」；dot 模式与无 count 时为空串。 |
| `getRootProps` | `() => T['element']` | 锚点：被标记的对象（按钮、头像、标签页）放置在其中。 |
| `getIndicatorProps` | `() => T['element']` | 角标本身，绝对定位在 root 的某个角。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `indicator` | `aria-label` | props.label |
| `indicator` | `role` | 'status' \| undefined |

## 样式参考

### 皮肤

`@xihan-ui/styles/badge.css` 使用 `[data-scope="badge"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-placement` | props.placement |
| `indicator` | `data-dot` | ''（条件成立时才出现） |
| `indicator` | `data-placement` | props.placement |
| `indicator` | `data-pulse` | ''（条件成立时才出现） |
| `indicator` | `data-size` | props.size |
| `indicator` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-badge-bg` | `indicator` | `background` | `default` | `--xh-_tone` | badge 的 indicator 部件 background 覆盖槽。 |
| `--xh-badge-dot-radius` | `indicator` | `border-radius` | `dot` | `--xh-shape-circle` | badge 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-badge-dot-size` | `indicator` | `block-size`<br>`inline-size`<br>`min-inline-size` | `dot` | `--xh-_badge-dot` | badge 的 indicator 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-badge-fg` | `indicator` | `color` | `default` | `--xh-_tone-on` | badge 的 indicator 部件 color 覆盖槽。 |
| `--xh-badge-font-size` | `indicator` | `font-size` | `default` | `--xh-_badge-font` | badge 的 indicator 部件 font-size 覆盖槽。 |
| `--xh-badge-font-weight` | `indicator` | `font-weight` | `default` | `--xh-font-weight-medium` | badge 的 indicator 部件 font-weight 覆盖槽。 |
| `--xh-badge-min-size` | `indicator` | `block-size`<br>`min-inline-size` | `default` | `--xh-_badge-min` | badge 的 indicator 部件 block-size、min-inline-size 覆盖槽。 |
| `--xh-badge-px` | `indicator` | `padding-inline` | `default` | `--xh-_badge-px` | badge 的 indicator 部件 padding-inline 覆盖槽。 |
| `--xh-badge-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | badge 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-badge-ring` | `indicator` | `border` | `default` | `--xh-bg-surface` | badge 的 indicator 部件 border 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-breathe` · `xh-breathe-halo` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
