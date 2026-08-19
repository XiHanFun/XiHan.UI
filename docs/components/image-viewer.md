# 图片预览 <Badge type="info" text="image-viewer" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

触发器打开全屏看片：滚轮缩放、拖拽平移、工具条给缩放/旋转/翻转/归零，Esc 或点遮罩关闭

<XhDemo src="image-viewer/01-basic" />

### 相册与翻页

多张图共用一个看片浮层：两侧按钮或方向键翻页、计数报「第几张」，缩放旋转在换图时归零

<XhDemo src="image-viewer/02-album" />

### 受控与文案

open 与 index 双受控；translations 换工具条的可及名与计数文案

<XhDemo src="image-viewer/03-controlled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-image-viewer>` |
| Vue 组件 | `XhImageViewerCloseTrigger` `XhImageViewerContent` `XhImageViewerCounter` `XhImageViewerFlipHorizontalTrigger` `XhImageViewerFlipVerticalTrigger` `XhImageViewerImage` `XhImageViewerNextTrigger` `XhImageViewerPrevTrigger` `XhImageViewerResetTrigger` `XhImageViewerRoot` `XhImageViewerRotateLeftTrigger` `XhImageViewerRotateRightTrigger` `XhImageViewerToolbar` `XhImageViewerTrigger` `XhImageViewerViewport` `XhImageViewerZoomInTrigger` `XhImageViewerZoomOutTrigger` |
| 组合式函数 | `useImageViewer` |
| 状态机 | `imageViewerMachine` |
| 皮肤 | `@xihan-ui/styles/image-viewer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="image-viewer"`：`trigger` · `backdrop` · `positioner` · **`content`** · `viewport` · **`image`** · `toolbar` · `zoom-in-trigger` · `zoom-out-trigger` · `rotate-left-trigger` · `rotate-right-trigger` · `flip-horizontal-trigger` · `flip-vertical-trigger` · `reset-trigger` · `prev-trigger` · `next-trigger` · `counter` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `ImageViewerItem[]` |  | 图片清单。看单张就给长度 1 的数组。缺省为空，此时打开也只有工具条与空视口。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `index` | `number` |  | 当前下标（0 起）。给定即受控：内部不再自改，只发 onIndexChange。 |
| `defaultIndex` | `number` |  | 非受控初值，默认 0。 |
| `loop` | `boolean` |  | 前后翻页到头是否回绕，默认 true。 |
| `zoomStep` | `number` |  | 缩放步长（加法），默认 0.5。 |
| `minScale` | `number` |  | 缩放下限，默认 0.25。 |
| `maxScale` | `number` |  | 缩放上限，默认 8。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  | 点遮罩（内容之外）关闭，默认 true。 |
| `restoreFocus` | `boolean` |  |  |
| `translations` | `Partial<ImageViewerTranslations>` |  |  |
| `onOpenChange` | `(details: ImageViewerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onIndexChange` | `(details: ImageViewerIndexChangeDetails) => void` |  | 下标变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ImageViewerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `index-change` | `ImageViewerIndexChangeDetails` | 下标变化；detail 为 `{ index: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhImageViewerRoot` | `default` | `ImageViewerRootSlotProps` |  |

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `INDEX.SET` · `INDEX.NEXT` · `INDEX.PREV` · `ZOOM.BY` · `ZOOM.SET` · `ROTATE.BY` · `FLIP` · `TRANSFORM.RESET` · `PAN.MOVE` · `PAN.START` · `PAN.END` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useImageViewer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `index` | `number` | 当前下标，恒在 [0, count - 1] 内；清单为空时为 0。 |
| `count` | `number` |  |
| `currentItem` | `ImageViewerItem \| null` | 当前那张图；清单为空时为 null。 |
| `transform` | `ImageViewerTransform` |  |
| `panning` | `boolean` | 正在拖拽平移。 |
| `canPrev` | `boolean` | 往前还翻得动（loop 且多于一张时恒为 true）。 |
| `canNext` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setIndex` | `(next: number) => void` | 直接跳到某一张；越界会被夹回 [0, count - 1]。换图变换归零。 |
| `next` | `() => void` |  |
| `prev` | `() => void` |  |
| `zoomIn` | `() => void` |  |
| `zoomOut` | `() => void` |  |
| `setScale` | `(scale: number) => void` |  |
| `rotateLeft` | `() => void` |  |
| `rotateRight` | `() => void` |  |
| `flipHorizontal` | `() => void` |  |
| `flipVertical` | `() => void` |  |
| `reset` | `() => void` | 变换整体归零（缩放/旋转/翻转/平移）。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getImageProps` | `() => T['img']` |  |
| `getToolbarProps` | `() => T['element']` |  |
| `getZoomInTriggerProps` | `() => T['button']` |  |
| `getZoomOutTriggerProps` | `() => T['button']` |  |
| `getRotateLeftTriggerProps` | `() => T['button']` |  |
| `getRotateRightTriggerProps` | `() => T['button']` |  |
| `getFlipHorizontalTriggerProps` | `() => T['button']` |  |
| `getFlipVerticalTriggerProps` | `() => T['button']` |  |
| `getResetTriggerProps` | `() => T['button']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getCounterProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开看片浮层并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger（closeOnEscape=false 时不关） |
| `Tab` | open | 在 content 内向后循环焦点 |
| `Shift+Tab` | open | 在 content 内向前循环焦点 |
| `ArrowLeft` | open | 上一张 |
| `ArrowRight` | open | 下一张 |
| `Home` | open | 跳到第一张 |
| `End` | open | 跳到最后一张 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-image-viewer-backdrop-bg` · `--xh-image-viewer-chrome-bg` · `--xh-image-viewer-fg`
