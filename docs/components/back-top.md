# 回到顶部 <Badge type="info" text="back-top" />

滚过一段距离后露面的按钮，点它滚回顶部。

## 何时使用

- 页面很长且没有别的快速返回方式。

## 何时不用

- 页面本来就不长：滚过 200px 就出现的按钮只会挡内容。
- 需要的是一组动作而不只是回顶：用[浮动按钮](./float-button)。

## 特性

- `visibilityHeight` 决定滚过多少像素才露面。
- `behavior` 决定一步跳回还是平滑滚过去。
- `translations` 换掉读屏念出的名字。

## 示例

### 基础用法

滚过 200px 按钮才露面，点它滚回顶部

<XhDemo src="back-top/01-basic" />

### 露面阈值

visibility-height 决定滚过多少像素按钮才出现

<XhDemo src="back-top/02-visibility-height" />

### 滚动方式

behavior=auto 一步跳回顶部，smooth 平滑滚过去

<XhDemo src="back-top/03-behavior" />

### 语气与尺寸

tone 决定按钮用哪族颜色，size 换一档尺寸；translations 换掉读屏念出的名字

<XhDemo src="back-top/04-tone-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-back-top>` |
| Vue 组件 | `XhBackTopRoot` `XhBackTopTrigger` |
| 组合式函数 | `useBackTop` |
| 状态机 | `backTopMachine` |
| 皮肤 | `@xihan-ui/styles/back-top.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="back-top"`：**`root`** · **`trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `visibilityHeight` | `number` |  | 滚过这么多像素按钮才露面，默认 200。 |
| `behavior` | `BackTopBehavior` |  | 滚回顶部的方式，默认 smooth。 |
| `translations` | `Partial<BackTopTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定按钮用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onVisibleChange` | `(details: BackTopVisibleChangeDetails) => void` |  | 露面与否变化时回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `visible-change` | `BackTopVisibleChangeDetails` | 露面与否变化；detail 为 `{ visible: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhBackTopRoot` | `default` | `BackTopRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'visible' \| 'hidden' |
| `trigger` | 'visible' \| 'hidden' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`hidden` · `visible`

**事件**：`SCROLL.RESOLVE` · `TRIGGER.CLICK`

**判据**：`shouldShow` · `shouldHide`

## connect API

`useBackTop` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 按钮此刻露不露面。 |
| `scrollToTop` | `() => void` | 程序化滚回顶部，与点按钮走同一条路。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 滚回顶部；按 behavior 决定是一步到位还是平滑滚过去 |
| `Tab` / `Shift+Tab` | trigger 露面时 | 走到按钮上；收起时整个 root 带 hidden，按钮不在 Tab 序列里 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-label` | props.translations.trigger |

## 样式

默认皮肤 `@xihan-ui/styles/back-top.css` 按部件选择：`[data-scope="back-top"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'visible' \| 'hidden' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-state` | 'visible' \| 'hidden' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-back-top-bg` · `--xh-back-top-bg-active` · `--xh-back-top-bg-hover` · `--xh-back-top-border` · `--xh-back-top-border-hover` · `--xh-back-top-fg` · `--xh-back-top-icon-size` · `--xh-back-top-inset-block` · `--xh-back-top-inset-inline` · `--xh-back-top-layer` · `--xh-back-top-radius` · `--xh-back-top-shadow` · `--xh-back-top-size`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤内置条件规则：`hover: hover` · `pointer: coarse`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[滚动区域](./scroll-area)配合时把滚动容器指给它，别让它盯着窗口。

## 最佳实践

- 位置要躲开固定工具条与移动端手势区。
- 平滑滚动对晕动敏感的用户不友好，系统开了减弱动效时应退回一步跳回。

## 反模式

- 恒显：没滚动时它没有意义，只是一块遮挡。
- 在短页面上加它。
