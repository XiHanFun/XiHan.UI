# BackTop 回到顶部 <Badge type="info" text="alpha" />

滚动超过指定距离后显示返回入口。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/back-top" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/back-top.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/back-top" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/back-top" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/back-top.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

滚动后显示回到顶部按钮

<XhDemo src="back-top/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="back-top"`：**`root`** · **`trigger`**

## 示例

### 显示阈值

提前显示回到顶部按钮

<XhDemo src="back-top/02-visibility-height" />

### 滚动方式

平滑返回或立即返回

<XhDemo src="back-top/03-behavior" />

### 变体

选择与所在表面匹配的样式

<XhDemo src="back-top/04-variant" />

## 设计指引

### 何时使用

- 长页面或独立滚动区域。

### 何时不用

- 短页面不需要返回入口。
- 多个悬浮操作使用[浮动按钮](./float-button)。

### 特性

- `visibilityHeight` 设置显示阈值。
- `behavior` 支持平滑或立即返回。
- 默认使用磨砂浮动表面，也可通过 `variant` 调整外观。
- 减少动效、减少透明度与强制色模式会自动降级。

### 组合

- 指定 `target` 后监听并滚动该容器；未指定时作用于页面。

### 最佳实践

- 避开固定工具条和移动端手势区。
- 保持默认的按需显示，不在页面顶部常驻。

### 反模式

- 在短页面或已有返回入口的位置重复使用。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-back-top>` |
| Vue 组件 | `XhBackTopRoot` `XhBackTopTrigger` |
| 组合式函数 | `useBackTop` |
| 状态机 | `backTopMachine` |
| 皮肤 | `@xihan-ui/styles/back-top.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `visibilityHeight` | `number` |  | 滚过这么多像素按钮才露面，默认 200。 |
| `behavior` | `BackTopBehavior` |  | 滚回顶部的方式，默认 smooth。 |
| `translations` | `Partial<BackTopTranslations>` |  |  |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定底色、描边与前景怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定按钮用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onVisibilityChange` | `(details: BackTopVisibilityChangeDetails) => void` |  | 露面与否变化时回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `visibility-change` | `BackTopVisibilityChangeDetails` | 露面与否变化；detail 为 `{ visible: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhBackTopRoot` | `default` | `BackTopRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'visible' \| 'hidden' |
| `trigger` | 'visible' \| 'hidden' |

以下名称仅用于内部状态机。

**状态**：`hidden` · `visible`

**事件**：`SCROLL.RESOLVE` · `TRIGGER.CLICK`

**判据**：`shouldShow` · `shouldHide`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 按钮此刻露不露面。 |
| `scrollToTop` | `() => void` | 程序化滚回顶部，与点按钮走同一条路。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 滚回顶部；按 behavior 决定是一步到位还是平滑滚过去 |
| `Tab` / `Shift+Tab` | trigger 露面时 | 走到按钮上；收起时整个 root 带 hidden，按钮不在 Tab 序列里 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-label` | props.translations.trigger |

## 样式参考

### 皮肤

`@xihan-ui/styles/back-top.css` 使用 `[data-scope="back-top"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'visible' \| 'hidden' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-state` | 'visible' \| 'hidden' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-back-top-bg` | `trigger` | `background-color` | `default` | `--xh-_back-top-bg` | back-top 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-back-top-bg-active` | `trigger` | `background-color` | `active` | `--xh-_back-top-bg-active` | back-top 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-back-top-bg-hover` | `trigger` | `background-color` | `@media (hover: hover)`<br>`hover` | `--xh-_back-top-bg-hover` | back-top 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-back-top-border` | `trigger` | `border` | `default` | `--xh-_back-top-border` | back-top 的 trigger 部件 border 覆盖槽。 |
| `--xh-back-top-border-hover` | `trigger` | `border-color` | `@media (hover: hover)`<br>`hover` | `--xh-_back-top-border-hover` | back-top 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-back-top-fg` | `trigger` | `color` | `default` | `--xh-_back-top-fg` | back-top 的 trigger 部件 color 覆盖槽。 |
| `--xh-back-top-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | back-top 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-back-top-inset-block` | `root` | `inset-block-end` | `default` | `--xh-space-8` | back-top 的 root 部件 inset-block-end 覆盖槽。 |
| `--xh-back-top-inset-inline` | `root` | `inset-inline-end` | `default` | `--xh-space-8` | back-top 的 root 部件 inset-inline-end 覆盖槽。 |
| `--xh-back-top-layer` | `root` | `z-index` | `default` | `--xh-layer-sticky` | back-top 的 root 部件 z-index 覆盖槽。 |
| `--xh-back-top-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-circle` | back-top 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-back-top-shadow` | `trigger` | `box-shadow` | `default` | `--xh-_back-top-shadow` | back-top 的 trigger 部件 box-shadow 覆盖槽。 |
| `--xh-back-top-size` | `trigger` | `block-size`<br>`inline-size` | `default` | `--xh-_back-top-size` | back-top 的 trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover` · `pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
