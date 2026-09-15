# Reasoning 思考过程 <Badge type="info" text="alpha" />

模型的推理片段：默认随写入自动展开，完成后自动收起，用户手动操作过一次后不再自动开合。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/reasoning" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/reasoning.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/reasoning" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/reasoning" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/reasoning.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

想的时候自动展开、想完自动收起；状态文案由组件按在不在想与时长给出

<XhDemo src="reasoning/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="reasoning"`：**`root`** · **`trigger`** · `icon` · `indicator` · `label` · `duration` · **`content`**

## 示例

### 无壳内联形态

ghost 档不占一块面，开关收成只占文字宽度的小药丸，适合在一段回答里穿插好几处

<XhDemo src="reasoning/02-inline" />

### 语气与尺寸

tone 换指示符与状态文案的色族，size 换标题行与正文的几何档；五份都挂在思考中，正文自动展开

<XhDemo src="reasoning/03-tone-size" />

### 受控开合与禁用

open 交给宿主：外面一颗钮统一开合几段思考，自动开合让位；disabled 的那一段开关按不动，停在给定的那一档

<XhDemo src="reasoning/04-controlled" />

## 设计指引

### 何时使用

- 展示推理模型输出的思考过程，且它边生成边显示。
- 希望读者可以回看推理过程，但默认不占版面。

### 何时不用

- 展示一次工具调用时，使用[工具调用](./tool-call)，两者共用同一台状态机但正文形态不同。
- 内容不是散文而是结构化数据时，属于工具调用的参数与结果。

### 特性

- 自动开合与[工具调用](./tool-call)是同一台状态机：锁存依靠转移的放置位置，不依靠布尔位，用户点击过一次之后阶段变化就不再触发自动开合。
- 思考时长由两个时刻计算，任一缺席即无法计算：流被中止时兜底收尾不写结束时刻，推理块只有起点没有终点，这一情况必须被处理。
- 名称与时长都排在开关内，“思考过程，用时 12 秒”整句构成开关的可访问名称。
- 状态文案由组件提供：进行中显示“在想”的文案，完成后把秒数代入 `thoughtFor` 的 `{seconds}`，无法计算时长时回落到折叠区的名称。名称位不写内容时显示的就是它。
- 形态三档：`outline` 描边、`subtle` 底色分区（默认档）、`ghost` 无壳内联。一段回答中穿插多处思考时使用 `ghost`，它不占一块面，开关收为只占文字宽度的小胶囊。
- 开合有动画：展开与收起是行高与内缩同帧动画，收起在动画完成后才真正隐藏。

### 组合

- 正文使用[流式正文](./markdown-stream)：思考过程是散文，与工具调用的等宽结构块不同。正文放在一个容器内：展开动画测量的是第一行的行高，散落的多个兄弟节点无法正确收起。
- 多段推理并排且一次只展开一段时使用[手风琴](./accordion)。
- 需要让“进行中 → 完成”被读屏播报时，把会话级的活动区域放在推理块外，由它读出结果。

### 最佳实践

- 完成后显示时长，读者据此判断是否值得展开。
- 默认收起。思考过程是给需要查看的人看的，不是回答本身。

### 反模式

- 把思考过程当作回答显示：两者混在一起时读者分不清结论。
- 用它承载工具调用的参数与结果：正文排版是散文形态，等宽结构块会挤在一起。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-reasoning>` |
| Vue 组件 | `XhReasoningContent` `XhReasoningDuration` `XhReasoningIcon` `XhReasoningIndicator` `XhReasoningLabel` `XhReasoningRoot` `XhReasoningTrigger` |
| 组合式函数 | `useReasoning` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/reasoning.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `endTime` | `number` |  | 思考结束的时刻。**可能缺席**：流被中止时兜底收尾不写这一个。 |
| `size` | `Size` |  |  |
| `startTime` | `number` |  | 开始思考的时刻，毫秒时间戳。 |
| `streaming` | `boolean` |  | 还在思考。适配器把它折成机器的 running。 |
| `tone` | `Tone` |  |  |
| `translations` | `Partial<ReasoningTranslations>` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline 描边、subtle 底色分区（缺省档）、ghost 无壳内联。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ToolCallOpenChangeDetails` | 开合变化；detail 为 `{ open: boolean, source: 'user' \| 'auto' \| 'api' }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhReasoningRoot` | `default` | `ReasoningRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `streaming` | `boolean` |  |
| `disabled` | `boolean` |  |
| `durationMs` | `number \| undefined` | 想了多久，毫秒；两个时刻任一缺席即 undefined。 |
| `statusText` | `string` | 当前该显示哪句状态文案，已按 streaming 与时长选好。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getIconProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getDurationProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | 焦点在折叠开关上且未禁用 | 展开或收起思考正文，并把自动开合永久停用 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `icon` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'region' |

- 开关带 `aria-expanded` 与 `aria-controls`，正文区是 `role=region` 且由开关命名。
- 不另发 `aria-label`：另发会覆盖节点内的文字，两者不一致时读屏读出的与屏幕不符。
- 组件自身不开活动区域：整段思考每来一个字都播报会淹没读屏。

## 样式参考

### 皮肤

`@xihan-ui/styles/reasoning.css` 使用 `[data-scope="reasoning"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-streaming` | ''（条件成立时才出现） |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-streaming` | ''（条件成立时才出现） |
| `icon` | `data-streaming` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `label` | `data-streaming` | ''（条件成立时才出现） |
| `duration` | `data-streaming` | ''（条件成立时才出现） |
| `content` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-reasoning-bg` | `root` | `background` | `default`<br>`variant=outline` | `--xh-bg-subtle`<br>`--xh-bg-surface` | reasoning 的 root 部件 background 覆盖槽。 |
| `--xh-reasoning-border` | `root` | `border-color` | `variant=outline` | `--xh-border-subtle` | reasoning 的 root 部件 border-color 覆盖槽。 |
| `--xh-reasoning-content-fg` | `content` | `color` | `default` | `--xh-fg-muted` | reasoning 的 content 部件 color 覆盖槽。 |
| `--xh-reasoning-content-font-size` | `content` | `font-size` | `default` | `--xh-text-secondary-size` | reasoning 的 content 部件 font-size 覆盖槽。 |
| `--xh-reasoning-content-leading` | `content` | `line-height` | `default` | `--xh-text-prose-leading` | reasoning 的 content 部件 line-height 覆盖槽。 |
| `--xh-reasoning-content-pe` | `content` | `padding-inline-end` | `default` | `--xh-reasoning-px` | reasoning 的 content 部件 padding-inline-end 覆盖槽。 |
| `--xh-reasoning-content-ps` | `content` | `padding-inline-start` | `default` | `--xh-space-3` | reasoning 的 content 部件 padding-inline-start 覆盖槽。 |
| `--xh-reasoning-duration-fg` | `duration` | `color` | `default` | `--xh-fg-subtle` | reasoning 的 duration 部件 color 覆盖槽。 |
| `--xh-reasoning-duration-font-size` | `duration` | `font-size` | `default` | `--xh-text-caption-size` | reasoning 的 duration 部件 font-size 覆盖槽。 |
| `--xh-reasoning-font-size` | `trigger` | `font-size` | `default` | `--xh-_reasoning-font-size` | reasoning 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-reasoning-icon-fg` | `icon` | `color` | `default` | `--xh-fg-subtle` | reasoning 的 icon 部件 color 覆盖槽。 |
| `--xh-reasoning-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | reasoning 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-reasoning-icon-streaming-fg` | `icon` | `color` | `streaming` | `--xh-fg-muted` | reasoning 的 icon 部件 color 覆盖槽。 |
| `--xh-reasoning-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-subtle` | reasoning 的 indicator 部件 color 覆盖槽。 |
| `--xh-reasoning-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | reasoning 的 label 部件 font-weight 覆盖槽。 |
| `--xh-reasoning-label-streaming-fg` | `label` | `color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`motion=reduce`<br>`streaming`<br>`where([data-motion='reduce'])` | `--xh-fg-default` | reasoning 的 label 部件 color 覆盖槽。 |
| `--xh-reasoning-px` | `content`<br>`trigger` | `margin-inline-start`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-_reasoning-px` | reasoning 的 content、trigger 部件 margin-inline-start、padding-inline、padding-inline-end 覆盖槽。 |
| `--xh-reasoning-py` | `*`<br>`content`<br>`trigger` | `padding-block`<br>`padding-block-end` | `@keyframes xh-reasoning-collapse`<br>`@keyframes xh-reasoning-expand`<br>`default` | `--xh-_reasoning-py` | reasoning 的 *、content、trigger 部件 padding-block、padding-block-end 覆盖槽。 |
| `--xh-reasoning-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | reasoning 的 root 部件 border-radius 覆盖槽。 |
| `--xh-reasoning-rail` | `content` | `border-inline-start` | `default` | `--xh-border-subtle` | reasoning 的 content 部件 border-inline-start 覆盖槽。 |
| `--xh-reasoning-rail-inset` | `content` | `margin-inline-start` | `default` | `--xh-reasoning-px` | reasoning 的 content 部件 margin-inline-start 覆盖槽。 |
| `--xh-reasoning-rail-width` | `content` | `border-inline-start` | `default` | `--xh-stroke-thin` | reasoning 的 content 部件 border-inline-start 覆盖槽。 |
| `--xh-reasoning-shadow` | `root` | `box-shadow` | `default`<br>`tone` | `--xh-elevation-raised` | reasoning 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-reasoning-shimmer-duration` | `label` | `animation` | `streaming` | `--xh-shimmer-duration` | reasoning 的 label 部件 animation 覆盖槽。 |
| `--xh-reasoning-shimmer-from` | `label` | `background-image` | `streaming` | `--xh-fg-subtle` | reasoning 的 label 部件 background-image 覆盖槽。 |
| `--xh-reasoning-shimmer-to` | `label` | `background-image` | `streaming` | `--xh-fg-default` | reasoning 的 label 部件 background-image 覆盖槽。 |
| `--xh-reasoning-tone-bar` | `root` | `box-shadow` | `tone` | `--xh-stroke-thick` | reasoning 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-reasoning-tone-fg` | `root` | `box-shadow` | `tone` | `--xh-_tone-soft` | reasoning 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-reasoning-trigger-bg-hover` | `trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | reasoning 的 trigger 部件 background 覆盖槽。 |
| `--xh-reasoning-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-muted` | reasoning 的 trigger 部件 color 覆盖槽。 |
| `--xh-reasoning-trigger-gap` | `trigger` | `gap` | `default` | `--xh-space-2` | reasoning 的 trigger 部件 gap 覆盖槽。 |
| `--xh-reasoning-trigger-radius` | `root`<br>`trigger` | `border-radius` | `variant=ghost` | `--xh-shape-control` | reasoning 的 root、trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-reasoning-collapse` · `xh-reasoning-expand` · `xh-reasoning-fade-in` · `xh-reasoning-shimmer` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
