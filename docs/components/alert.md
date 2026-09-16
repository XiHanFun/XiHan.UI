# Alert 警告提示

页面内常驻的一条提示，说明一件与当前上下文有关的事。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/alert" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/alert.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/alert" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/alert" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/alert.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在中性抬升表面中说明当前状态与影响

<XhDemo src="alert/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="alert"`：**`root`** · `indicator` · **`content`** · `title` · `description` · `action` · `close-trigger`

## 示例

### 颜色

tone 只改配色，语义仍由内容与 role 决定

<XhDemo src="alert/02-tone" />

### 可关闭

closable 开启后才渲染关闭按钮；open 受控时由宿主决定去留

<XhDemo src="alert/03-closable" />

### 图标

icon 部件排在标题前面，颜色取当前语气的强调色；内容由作者放置，字形与内联 svg 均可

<XhDemo src="alert/04-icon" />

### 操作

将与提示直接相关的短操作放在尾端

<XhDemo src="alert/05-action" />

## 设计指引

### 何时使用

- 表单顶部的整体错误、页面级的状态说明、功能公告。
- 信息需要持续存在，直到用户处理或关闭。

### 何时不用

- 一次操作的结果反馈使用[轻提示](./toast)，它会自动消失。
- 需要用户当场决定并阻断流程时使用[对话框](./dialog)。
- 单个字段的错误使用[表单字段](./field)的错误文本。

### 特性

- 默认使用中性描边表面，语气只强调标题与图标，说明保持次级前景。
- `content` 是标题与说明共用的必需文本列，操作和关闭入口排在尾端。
- `closable` 显示关闭按钮，关闭状态可受控。

### 组合

- 图标使用[图标](./icon)，行动入口使用[按钮](./button)。

### 最佳实践

- 说明发生了什么、影响是什么、用户可以做什么，三项缺一不可。
- 严重程度不能只靠颜色表达，标题文字本身应说明。

### 反模式

- 同一屏堆叠多条提示，用户会全部略过。
- 将提示用作营销位。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-alert>` |
| Vue 组件 | `XhAlertAction` `XhAlertCloseTrigger` `XhAlertContent` `XhAlertDescription` `XhAlertIndicator` `XhAlertRoot` `XhAlertTitle` |
| 状态机 | `alertMachine` |
| 皮肤 | `@xihan-ui/styles/alert.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色，默认 info。 danger / warning 使用 role="alert"，其余使用 role="status"。 |
| `closable` | `boolean` |  | 关闭按钮是否可用，默认 true。false 时该按钮同时被禁用与收起。 |
| `open` | `boolean` |  | 受控显隐；未提供该 prop 即非受控。 |
| `defaultOpen` | `boolean` |  | 非受控初始显隐，默认显示。 |
| `onOpenChange` | `(details: AlertOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `translations` | `Partial<AlertTranslations>` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `AlertOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `tone` | `string` |  |
| `closable` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` | 文本列容器：标题与说明纵向排列。 |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getActionProps` | `() => T['element']` | 操作槽：划定按钮区，按钮本身由作者提供。 |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 收起提示并通知 open=false |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-atomic` | 'true' |
| `root` | `aria-describedby` | `description` 部件的 id |
| `root` | `aria-labelledby` | `title` 部件的 id |
| `root` | `aria-live` | live |
| `root` | `role` | role |
| `indicator` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/alert.css` 使用 `[data-scope="alert"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-alert-action-gap` | `action` | `gap` | `default` | `--xh-space-2` | alert 的 action 部件 gap 覆盖槽。 |
| `--xh-alert-bg` | `root` | `background` | `default` | `--xh-bg-surface` | alert 的 root 部件 background 覆盖槽。 |
| `--xh-alert-border` | `root` | `border` | `default` | `--xh-border-default` | alert 的 root 部件 border 覆盖槽。 |
| `--xh-alert-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | alert 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-alert-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | alert 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-alert-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | alert 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-alert-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | alert 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-alert-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | alert 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-alert-close-size` | `close-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | alert 的 close-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-alert-content-gap` | `content` | `gap` | `default` | `--xh-space-1` | alert 的 content 部件 gap 覆盖槽。 |
| `--xh-alert-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | alert 的 description 部件 color 覆盖槽。 |
| `--xh-alert-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | alert 的 description 部件 font-size 覆盖槽。 |
| `--xh-alert-fg` | `root` | `color` | `default` | `--xh-fg-default` | alert 的 root 部件 color 覆盖槽。 |
| `--xh-alert-font-size` | `root` | `font-size` | `default` | `--xh-text-body-size` | alert 的 root 部件 font-size 覆盖槽。 |
| `--xh-alert-gap` | `root` | `gap` | `default` | `--xh-space-4` | alert 的 root 部件 gap 覆盖槽。 |
| `--xh-alert-icon-size` | `close-trigger`<br>`root` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | alert 的 close-trigger、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-alert-indicator-fg` | `indicator` | `color` | `default` | `--xh-_tone-fg` | alert 的 indicator 部件 color 覆盖槽。 |
| `--xh-alert-indicator-p` | `indicator` | `padding` | `default` | `--xh-space-1` | alert 的 indicator 部件 padding 覆盖槽。 |
| `--xh-alert-leading` | `root` | `line-height` | `default` | `--xh-leading-normal` | alert 的 root 部件 line-height 覆盖槽。 |
| `--xh-alert-px` | `root` | `padding-inline` | `default` | `--xh-surface-px-sm` | alert 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-alert-py` | `root` | `padding-block` | `default` | `--xh-surface-py-sm` | alert 的 root 部件 padding-block 覆盖槽。 |
| `--xh-alert-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | alert 的 root 部件 border-radius 覆盖槽。 |
| `--xh-alert-shadow` | `root` | `box-shadow` | `default` | `none` | alert 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-alert-title-fg` | `title` | `color` | `default` | `--xh-_tone-fg` | alert 的 title 部件 color 覆盖槽。 |
| `--xh-alert-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | alert 的 title 部件 font-size 覆盖槽。 |
| `--xh-alert-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | alert 的 title 部件 font-weight 覆盖槽。 |
| `--xh-alert-title-leading` | `title` | `line-height` | `default` | `--xh-leading-tight` | alert 的 title 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
