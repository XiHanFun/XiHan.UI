# 引导 <Badge type="info" text="tour" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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
| 皮肤 | `@xihan-ui/styled/tour.css` |

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
| `offset` | `number` |  | 浮层与目标的间距（px）。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  | 层外交互关闭，默认 false：引导要退出得走 skip 或 close 这两个明确出口。 |
| `showBackdrop` | `boolean` |  | 画遮罩，默认 true。 |
| `spotlightPadding` | `number` |  | 高亮框在目标四周留出的空白（px），默认 8。 |
| `translations` | `Partial<TourTranslations>` |  |  |
| `onStepChange` | `(details: TourStepChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: TourOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onComplete` | `(details: TourCompleteDetails) => void` |  | 末步再按"下一步"：先发它，再按 onOpenChange 关闭。 |
| `onSkip` | `(details: TourSkipDetails) => void` |  | 用户主动放弃（skip-trigger 或 Escape）：先发它，再按 onOpenChange 关闭。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `STEP.SET` · `STEP.PREV` · `STEP.NEXT` · `SKIP` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

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
