# 思考过程 <Badge type="info" text="reasoning" />

模型「想」的那一段：默认跟着写入自动展开，想完自动收起，用户动手过一次就不再自动。

## 何时使用

- 展示推理模型吐出的思考过程，且它是边想边显示的。
- 想让读者能回头看「它当时是怎么想的」，但默认不占版面。

## 何时不用

- 展示的是一次工具调用：用[工具调用](./tool-call)，两者共用同一台机器但正文形态不同。
- 内容不是散文而是结构化数据：那属于工具调用的参数与结果。

## 特性

- 自动开合与[工具调用](./tool-call)是同一台机器：**锁存靠转移的放置位置，不靠一个布尔位**，
  用户点过一次之后阶段变化就永久够不着自动开合。
- 「想了多久」由两个时刻算出来，**任一缺席即算不出来**——流被中止时兜底收尾不写结束时刻，
  推理块会只有起点没有终点，这一档必须接得住。
- 名字与时长都排在开关里，「思考过程，用时 12 秒」整句自然构成开关的可访问名。
- 状态文案由组件给：在想时是「在想」那一句，想完把秒数代进 `thoughtFor` 的 `{seconds}`，
  算不出时长就回落折叠区的名字。名字位不写内容时显示的就是它。
- 形态三档：`outline` 描边、`subtle` 底色分区（缺省档）、`ghost` 无壳内联——
  一段回答里穿插好几处思考时用 `ghost`，它不占一块面，开关收成只占文字宽度的一枚小药丸。
- 开合有动画：展开与收起是行高与内缩同帧动，收起在动画播完之后才真的落成隐藏。

## 示例

### 基础用法

想的时候自动展开、想完自动收起；状态文案由组件按在不在想与时长给出

<XhDemo src="reasoning/01-basic" />

### 无壳内联形态

ghost 档不占一块面，开关收成只占文字宽度的小药丸，适合在一段回答里穿插好几处

<XhDemo src="reasoning/02-inline" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-reasoning>` |
| Vue 组件 | `XhReasoningContent` `XhReasoningDuration` `XhReasoningIcon` `XhReasoningIndicator` `XhReasoningLabel` `XhReasoningRoot` `XhReasoningTrigger` |
| 组合式函数 | `useReasoning` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/reasoning.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="reasoning"`：**`root`** · **`trigger`** · `icon` · `indicator` · `label` · `duration` · **`content`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `endTime` | `number` |  | 思考结束的时刻。**可能缺席**：流被中止时兜底收尾不写这一个。 |
| `size` | `Size` |  |  |
| `startTime` | `number` |  | 开始思考的时刻，毫秒时间戳。 |
| `streaming` | `boolean` |  | 还在思考。适配器把它折成机器的 running。 |
| `tone` | `Tone` |  |  |
| `translations` | `Partial<ReasoningTranslations>` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline 描边、subtle 底色分区（缺省档）、ghost 无壳内联。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ToolCallOpenChangeDetails` | 开合变化；detail 为 `{ open: boolean, source: 'user' \| 'auto' \| 'api' }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhReasoningRoot` | `default` | `ReasoningRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

## connect API

`useReasoning` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | 焦点在折叠开关上且未禁用 | 展开或收起思考正文，并把自动开合永久停用 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `icon` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'region' |

- 开关带 `aria-expanded` 与 `aria-controls`，正文区是 `role=region` 且由开关命名。
- 不再另发 `aria-label`：另发会盖过节点里的文字，两者不一致时读屏念的与屏幕上看到的对不上。
- 自己不开活区：整段思考每来一个字都播报会把读屏刷爆。

## 样式

默认皮肤 `@xihan-ui/styles/reasoning.css` 按部件选择：`[data-scope="reasoning"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-reasoning-bg` · `--xh-reasoning-border` · `--xh-reasoning-content-fg` · `--xh-reasoning-content-font-size` · `--xh-reasoning-content-leading` · `--xh-reasoning-content-pe` · `--xh-reasoning-content-ps` · `--xh-reasoning-duration-fg` · `--xh-reasoning-duration-font-size` · `--xh-reasoning-font-size` · `--xh-reasoning-icon-fg` · `--xh-reasoning-icon-size` · `--xh-reasoning-icon-streaming-fg` · `--xh-reasoning-indicator-fg` · `--xh-reasoning-label-font-weight` · `--xh-reasoning-label-streaming-fg` · `--xh-reasoning-px` · `--xh-reasoning-py` · `--xh-reasoning-radius` · `--xh-reasoning-rail` · `--xh-reasoning-rail-inset` · `--xh-reasoning-rail-width` · `--xh-reasoning-shadow` · `--xh-reasoning-shimmer-duration` · `--xh-reasoning-shimmer-from` · `--xh-reasoning-shimmer-to` · `--xh-reasoning-tone-bar` · `--xh-reasoning-tone-fg` · `--xh-reasoning-trigger-bg-hover` · `--xh-reasoning-trigger-fg` · `--xh-reasoning-trigger-gap` · `--xh-reasoning-trigger-radius`

## 动效

关键帧 `xh-reasoning-collapse` · `xh-reasoning-expand` · `xh-reasoning-fade-in` · `xh-reasoning-shimmer` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 正文用[流式正文](./markdown-stream)：思考过程是散文，与工具调用的等宽结构块不同。
  正文**放在一个容器里**：展开动画量的是第一行的行高，散落的多个兄弟节点收不干净。
- 多段推理并排、要一次只展开一段时套[手风琴](./accordion)。
- 要让「在想 → 想完」被读屏播报：把会话级的那一个活区放在推理块外面，
  由它念一句结果——组件自己不开活区（见下），整段思考每来一个字都播报会把读屏刷爆。

## 最佳实践

- 想完之后把时长显示出来：读者据此判断这段推理值不值得展开。
- 默认收起。思考过程是给想看的人看的，不是回答本身。

## 反模式

- 把思考过程当回答显示：两者混在一起时读者分不清哪句是结论。
- 用它承载工具调用的参数与结果：正文排版是散文那一套，等宽结构块在这里会挤成一团。
