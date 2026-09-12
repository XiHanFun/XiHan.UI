# Button 按钮

用于触发即时操作。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/button" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/button.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/vue/src/components/button.ts" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/react/src/components/button.tsx" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/button.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

触发一次操作

<XhDemo src="button/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="button"`：**`root`** · `label` · `indicator` · `prefix` · `suffix`

## 示例

### 变体

设置按钮外观

<XhDemo src="button/02-variant" />

### 尺寸

小、中、大三档

<XhDemo src="button/03-size" />

### 图标

在文字前后放置图标

<XhDemo src="button/04-with-icons" />

### 仅图标

紧凑的图标操作

<XhDemo src="button/05-icon-only" />

### 加载

保留按钮标签并阻止重复操作

<XhDemo src="button/06-loading" />

### 异步操作

点击后显示加载状态

<XhDemo src="button/07-loading-triggered" />

### 全宽

占满容器宽度

<XhDemo src="button/08-full-width" />

### 禁用

暂时不可执行的操作

<XhDemo src="button/09-disabled" />

### 链接

保留原生导航能力

<XhDemo src="button/10-as-link" />

## 设计指引

### 何时使用

- 提交表单或执行命令。
- 打开菜单、对话框等浮层。
- 需要明确主次关系的一组操作。

### 何时不用

- 导航到其他地址时，将按钮渲染为链接。
- 表达持续的开关状态时，使用[切换按钮](./toggle)。
- 在多个选项中选择时，使用[切换按钮组](./toggle-group)或[单选组](./radio-group)。

### 特性

- 支持四种变体、六种颜色和三种尺寸。
- 支持文字、图标、图标加文字与全宽按钮。
- `loading` 保留焦点并阻止重复操作。
- `as="a"` 保留原生链接能力。

### 组合

- 使用 `prefix` 与 `suffix` 放置图标。
- 使用 `indicator` 提供加载图形。
- 使用[按钮组](./button-group)组合相关操作。

### 最佳实践

- 每个视图只保留一个主要操作。
- 图标按钮必须提供 `aria-label`。
- 加载时保留原有标签，避免按钮宽度变化。

### 反模式

- 不要使用按钮模拟普通链接。
- 不要在按钮中嵌套可聚焦元素。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button>` |
| Vue 组件 | `XhButton` `XhButtonIndicator` `XhButtonLabel` `XhButtonPrefix` `XhButtonSuffix` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/button.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ariaLabel` | `string` |  | 作者写在根节点上的可及名（aria-label / aria-labelledby）。 宿主只把它们转告连接层，用来判断图标按钮有没有名字；属性本身仍由宿主写进根节点。 |
| `ariaLabelledby` | `string` |  |  |
| `as` | `ButtonElement` |  | 渲染成哪个标签，默认 button。 写成 a 时不再产出 type 与原生 disabled（两者在链接上无效），禁用改由 aria-disabled 表达， 点击仍被拦下。作者自行给 href。 |
| `disabled` | `boolean` |  |  |
| `fullWidth` | `boolean` |  | 撑满行宽：表单末尾的提交按钮与移动端常用。 |
| `iconOnly` | `boolean` |  | 只有图标：左右内距清零、宽高相等。宽度跟着当前尺寸档的高度走， 不必把档位写进行内样式。图标按钮没有可见文字，作者须自行给可及名。 |
| `loading` | `boolean` |  | 加载态：用 aria-disabled + 拦截事件表达，保留焦点。 |
| `shape` | `ButtonShape` |  | 圆角档：rounded 是常规控件圆角，pill 是胶囊，square 是直角。 缺省即跟着 --xh-shape-control 走，与不写这一项时逐值相同。 |
| `size` | `Size` |  |  |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `type` | `'button' \| 'submit' \| 'reset'` |  |  |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `disabled` | `boolean` |  |
| `loading` | `boolean` |  |
| `getRootProps` | `() => T['button']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getPrefixProps` | `() => T['element']` |  |
| `getSuffixProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in root, interactive | 激活按钮（原生行为） |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-disabled` | 'true' \| undefined |
| `indicator` | `aria-hidden` | 'true' |
| `prefix` | `aria-hidden` | 'true' |
| `suffix` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/button.css` 使用 `[data-scope="button"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-icon-only` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-shape` | props.shape |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'icon' \| 'text' |
| `root` | `data-xh-action-size` | props.size |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-button-bg` | `root` | `background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`loading`<br>`not([data-scope='button-group'] *)`<br>`not([data-variant])`<br>`variant`<br>`variant=solid` | `--xh-_tone`<br>`--xh-bg-brand` | button 的 root 部件 background-color 覆盖槽。 |
| `--xh-button-bg-active` | `root` | `background-color` | `active`<br>`disabled`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-brand-active` | button 的 root 部件 background-color 覆盖槽。 |
| `--xh-button-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-brand-hover` | button 的 root 部件 background-color 覆盖槽。 |
| `--xh-button-fg` | `root` | `color` | `active`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope='button-group'] *)`<br>`not([data-variant])`<br>`variant`<br>`variant=solid` | `--xh-_tone-on`<br>`--xh-fg-on-brand` | button 的 root 部件 color 覆盖槽。 |
| `--xh-button-font-size` | `root` | `font-size` | `default` | `--xh-_button-group-font-size` | button 的 root 部件 font-size 覆盖槽。 |
| `--xh-button-font-weight` | `root` | `font-weight` | `default` | `--xh-text-label-weight` | button 的 root 部件 font-weight 覆盖槽。 |
| `--xh-button-gap` | `root` | `gap` | `default` | `--xh-_button-group-gap` | button 的 root 部件 gap 覆盖槽。 |
| `--xh-button-h` | `root` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_button-group-h` | button 的 root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-button-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | button 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-button-px` | `root` | `padding-inline` | `default` | `--xh-_button-group-px` | button 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-button-radius` | `root` | `border-radius` | `default` | `--xh-_button-radius` | button 的 root 部件 border-radius 覆盖槽。 |
| `--xh-button-shadow` | `root` | `box-shadow` | `default` | `none` | button 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-button-shadow-hover` | `root` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` | button 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-button-spin-duration` | `indicator`<br>`root` | `animation` | `loading` | `--xh-spin-duration` | button 的 indicator、root 部件 animation 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-spin` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
