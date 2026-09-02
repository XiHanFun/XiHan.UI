# 图片预览 <Badge type="info" text="image-viewer" />

点开看大图：全屏浮层里可以缩放、旋转、翻转与翻页。

## 何时使用

- 图片细节重要（截图、单据、商品图）。
- 一组图需要连续浏览。

## 何时不用

- 图本身已经足够大：不必再套一层。
- 需要的是编辑（裁切、标注）：这是只读的查看器。

## 特性

- `items` 给整组图，`index` 决定当前哪一张，`loop` 决定是否回绕。
- 缩放步长与上下限可调。
- 触屏上两指撑开放大、捏合缩小，单指平移；缩放以两指中点为锚。
- 关闭后焦点归还触发器。

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

### 双指缩放

触屏上两指撑开放大、捏合缩小，单指平移；缩放夹在 minScale 与 maxScale 之间

<XhDemo src="image-viewer/04-gesture" />

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

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `viewport` | 'open' \| 'closed' |
| `image` | 'open' \| 'closed' |
| `toolbar` | 'open' \| 'closed' |
| `counter` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `INDEX.SET` · `INDEX.NEXT` · `INDEX.PREV` · `ZOOM.BY` · `ZOOM.SET` · `ROTATE.BY` · `FLIP` · `TRANSFORM.RESET` · `PAN.MOVE` · `POINTERS.DOWN` · `POINTERS.CHANGE` · `POINTERS.END` · `PAN.END` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `backdrop` | `aria-hidden` | 'true' |
| `content` | `aria-label` | currentItem?.alt |
| `content` | `aria-modal` | 'true' |
| `content` | `role` | 'dialog' |
| `toolbar` | `aria-label` | label.toolbar |
| `toolbar` | `role` | 'toolbar' |
| `counter` | `aria-live` | 'polite' |

## 样式

默认皮肤 `@xihan-ui/styles/image-viewer.css` 按部件选择：`[data-scope="image-viewer"][data-part="trigger"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-state` | 'open' \| 'closed' |
| `viewport` | `data-panning` | ''（条件成立时才出现） |
| `viewport` | `data-state` | 'open' \| 'closed' |
| `image` | `data-panning` | ''（条件成立时才出现） |
| `image` | `data-state` | 'open' \| 'closed' |
| `toolbar` | `data-state` | 'open' \| 'closed' |
| `counter` | `data-count` | String(count) |
| `counter` | `data-index` | String(index + 1) |
| `counter` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-image-viewer-backdrop-bg` · `--xh-image-viewer-backdrop-layer` · `--xh-image-viewer-chrome-bg` · `--xh-image-viewer-close-bg-active` · `--xh-image-viewer-close-bg-hover` · `--xh-image-viewer-close-radius` · `--xh-image-viewer-close-size` · `--xh-image-viewer-counter-padding` · `--xh-image-viewer-fg` · `--xh-image-viewer-icon-size` · `--xh-image-viewer-layer` · `--xh-image-viewer-overlay-radius` · `--xh-image-viewer-toolbar-gap` · `--xh-image-viewer-toolbar-padding` · `--xh-image-viewer-toolbar-radius`

## 动效

关键帧 `xh-fade-in` · `xh-fade-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 触发器用[图片](./image)；一组[图片](./image)共用一个预览层。

## 最佳实践

- 显示"第几张 / 共几张"，用户才知道还有多少。
- 工具栏按钮全部给可及名字：它们只有图标。

## 反模式

- 打开后 Escape 关不掉。
- 缩放后没有复位入口。
