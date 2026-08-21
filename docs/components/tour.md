# 引导 <Badge type="info" text="tour" />

一串聚光灯步骤，逐个指向界面上的元素并解释它。

## 何时使用

- 新功能上线、首次进入复杂界面时的一次性介绍。

## 何时不用

- 界面本身不好懂：改界面，别用引导补丁。
- 用户需要随时查阅的说明：写进帮助或[文字提示](./tooltip)。

## 特性

- 聚光灯把目标从遮罩里挖出来，`spotlightPadding` 决定挖多大。
- `autoScroll` 把目标滚进视野。
- 可以有居中的无目标步（开场与结束）。
- 步序与展开都可受控，另有完成与跳过两个回调。

## 示例

### 基础用法

steps 是唯一事实源，组件只按下标取用；每步的 target 是一个 CSS 选择器，高亮框与浮层都锚在它上面

<XhDemo src="tour/01-basic" />

### 居中步

不写 target 的那一步不锚定任何元素：浮层居中、不画高亮框、也不出箭头，适合当开场白与收尾

<XhDemo src="tour/02-centered" />

### 受控

传了 open 与 step 就由宿主说了算：内部不再自改，只发意图，浮层里的按钮与外面的进度读的是同一份状态

<XhDemo src="tour/03-controlled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tour>` |
| Vue 组件 | `XhTourArrow` `XhTourBackdrop` `XhTourCloseTrigger` `XhTourContent` `XhTourDescription` `XhTourNextTrigger` `XhTourPositioner` `XhTourPrevTrigger` `XhTourProgressText` `XhTourRoot` `XhTourSkipTrigger` `XhTourSpotlight` `XhTourTitle` |
| 组合式函数 | `useTour` |
| 状态机 | `tourMachine` |
| 皮肤 | `@xihan-ui/styles/tour.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tour"`：**`root`** · `backdrop` · `spotlight` · `positioner` · **`content`** · `title` · `description` · `progress-text` · `prev-trigger` · `next-trigger` · `skip-trigger` · `close-trigger` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `steps` | `TourStep[]` |  | 步骤清单。它同时是步序的上界与读屏"第 m 步，共 n 步"的分母。 |
| `step` | `number` |  | 当前步序（0 起）。给定即受控：内部不再自改，只发 onStepChange。 |
| `defaultStep` | `number` |  | 非受控初值，默认 0。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 整份引导的首选放置位，默认 bottom；单步可用自己的 placement 覆盖。 |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  | 浮层与目标的间距（px）。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  | 层外交互关闭，默认 false：引导要退出得走 skip 或 close 这两个明确出口。 |
| `showBackdrop` | `boolean` |  | 画遮罩，默认 true。 |
| `spotlightPadding` | `number` |  | 高亮框在目标四周留出的空白（px），默认 8。 |
| `autoScroll` | `boolean` |  | 展开与换步时自动把目标滚进视口（nearest，已可见时不动），默认 true。 |
| `translations` | `Partial<TourTranslations>` |  |  |
| `onStepChange` | `(details: TourStepChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: TourOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onComplete` | `(details: TourCompleteDetails) => void` |  | 末步再按"下一步"：先发它，再按 onOpenChange 关闭。 |
| `onSkip` | `(details: TourSkipDetails) => void` |  | 用户主动放弃（skip-trigger 或 Escape）：先发它，再按 onOpenChange 关闭。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TourOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `step-change` | `TourStepChangeDetails` | 步序变化；detail 为 `{ step: number }` |
| `complete` | `TourCompleteDetails` | 末步再按下一步；detail 为 `{ step: number }` |
| `skip` | `TourSkipDetails` | 用户放弃（跳过按钮或 Escape）；detail 为 `{ step: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTourRoot` | `default` | `TourRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `spotlight` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `prev-trigger` | 'open' \| 'closed' |
| `next-trigger` | 'open' \| 'closed' |
| `skip-trigger` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `STEP.SET` · `STEP.PREV` · `STEP.NEXT` · `SKIP` · `GEOMETRY.SYNC` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isLastStep` · `isLastStepOpenControlled`

## connect API

`useTour` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `step` | `number` | 当前步序，恒在 [0, count - 1] 内；清单为空时为 0。 |
| `count` | `number` |  |
| `currentStep` | `TourStep \| null` | 当前步的声明；清单为空时为 null。 |
| `firstStep` | `boolean` | 停在首步：上一步按钮据此禁用。 |
| `lastStep` | `boolean` | 停在末步：下一步按钮据此改文案（"完成"）。 |
| `anchored` | `boolean` | 这一步锚定了页面元素：居中步为 false，此时不画高亮框也不出箭头。 |
| `progressText` | `string` | "第 m 步，共 n 步"。作者没写 progress-text 的内容时由适配器填上。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setStep` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count - 1]。 |
| `goToNextStep` | `() => void` | 末步再走一步 = 完成：先发 onComplete，再关闭。 |
| `goToPrevStep` | `() => void` |  |
| `skip` | `() => void` | 放弃引导：先发 onSkip，再关闭。 |
| `remeasure` | `() => void` | 重量高亮框与浮层位置：目标节点被外部改动（换位、变尺寸）后调它校准。 |
| `getRootProps` | `() => T['element']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getSpotlightProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getProgressTextProps` | `() => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getSkipTriggerProps` | `() => T['button']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | open 且焦点在 content 上（不在按钮等控件上） | 走到下一步；停在末步时完成引导并关闭 |
| `Escape` | open 且 closeOnEscape | 放弃引导（发 onSkip）并关闭 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | open | 一概不接管：既不换步也不阻止默认行为，留给页面滚动与读屏浏览 |
| `Tab` / `Shift+Tab` | open | 焦点陷在 content 内循环，跑出去会被拉回来 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `backdrop` | `aria-hidden` | 'true' |
| `spotlight` | `aria-hidden` | 'true' |
| `content` | `aria-describedby` | `description` 部件的 id |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'true' |
| `content` | `role` | 'dialog' |
| `progress-text` | `aria-live` | 'polite' |
| `close-trigger` | `aria-label` | translations?.close |
| `arrow` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/tour.css` 按部件选择：`[data-scope="tour"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-step` | String(step) |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `spotlight` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-position` | 'anchored' \| 'center' |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-step` | String(step) |
| `progress-text` | `data-step` | String(step) |
| `prev-trigger` | `data-state` | 'open' \| 'closed' |
| `next-trigger` | `data-last` | ''（条件成立时才出现） |
| `next-trigger` | `data-state` | 'open' \| 'closed' |
| `skip-trigger` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-tour-arrow-size` · `--xh-tour-backdrop-bg` · `--xh-tour-backdrop-z` · `--xh-tour-bg` · `--xh-tour-border` · `--xh-tour-description-fg` · `--xh-tour-fg` · `--xh-tour-gap` · `--xh-tour-max-h` · `--xh-tour-max-w` · `--xh-tour-next-bg` · `--xh-tour-next-bg-hover` · `--xh-tour-next-fg` · `--xh-tour-positioner-z` · `--xh-tour-progress-fg` · `--xh-tour-progress-font-size` · `--xh-tour-px` · `--xh-tour-py` · `--xh-tour-radius` · `--xh-tour-shadow` · `--xh-tour-spotlight-radius` · `--xh-tour-spotlight-ring` · `--xh-tour-spotlight-shroud` · `--xh-tour-spotlight-z` · `--xh-tour-title-fg` · `--xh-tour-title-font-size` · `--xh-tour-title-font-weight`

## 动效

关键帧 `xh-fade-in` · `xh-fade-out` · `xh-tour-content-in` · `xh-tour-content-out` · `xh-tour-spotlight-in` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[对话框](./dialog)配合做开场；结束后引导用户去[结果页](./result)或具体功能。

## 最佳实践

- 步数压到三到五步，多了没人走完。
- 跳过入口从第一步就要有，且要显眼。
- 只讲一次，记住用户已经看过。

## 反模式

- 强制走完不许跳过。
- 引导目标在当前视口里不存在（还没渲染出来），聚光灯挖了个空。
