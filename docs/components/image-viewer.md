# ImageViewer <Badge type="info" text="图片预览" />

点开看大图：全屏浮层里可以缩放、旋转、翻转与翻页。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/image-viewer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/image-viewer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/image-viewer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/image-viewer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/image-viewer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

触发器打开全屏看片：滚轮缩放、拖拽平移、工具条给缩放/旋转/翻转/归零，Esc 或点遮罩关闭

<XhDemo src="image-viewer/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="image-viewer"`：`trigger` · `backdrop` · `positioner` · **`content`** · `viewport` · **`image`** · `toolbar` · `zoom-in-trigger` · `zoom-out-trigger` · `rotate-left-trigger` · `rotate-right-trigger` · `flip-horizontal-trigger` · `flip-vertical-trigger` · `reset-trigger` · `prev-trigger` · `next-trigger` · `counter` · `close-trigger`

## 示例

### 相册与翻页

多张图共用一个看片浮层：两侧按钮或方向键翻页、计数报「第几张」，缩放旋转在换图时归零

<XhDemo src="image-viewer/02-album" />

### 受控与文案

open 与 index 双受控；translations 换工具条的可及名与计数文案

<XhDemo src="image-viewer/03-controlled" />

### 双指缩放

触屏上两指撑开放大、捏合缩小，单指平移；缩放夹在 minScale 与 maxScale 之间

<XhDemo src="image-viewer/04-gesture" />

## 设计指引

### 何时使用

- 图片细节重要（截图、单据、商品图）。
- 一组图需要连续浏览。

### 何时不用

- 图本身已经足够大：不必再套一层。
- 需要的是编辑（裁切、标注）：这是只读的查看器。

### 特性

- `collection` 给整组图，`index` 决定当前哪一张，`loop` 决定是否回绕。
- 缩放步长与上下限可调。
- 触屏上两指撑开放大、捏合缩小，单指平移；缩放以两指中点为锚。
- 关闭后焦点归还触发器。
- 逻辑关闭立即退出交互与可访问树；内容和遮罩完成退场后才释放模态资源，重开会撤销旧退场。
- 底部控件带是一组有名字的控件，每颗钮各占一个 Tab 位；左右方向键与 Home/End 留给翻页，条里条外都一样。

### 组合

- 触发器用[图片](./image)；一组[图片](./image)共用一个预览层。

### 最佳实践

- 显示"第几张 / 共几张"，用户才知道还有多少。
- 工具栏按钮全部给可及名字：它们只有图标。

### 反模式

- 打开后 Escape 关不掉。
- 缩放后没有复位入口。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-image-viewer>` |
| Vue 组件 | `XhImageViewerCloseTrigger` `XhImageViewerContent` `XhImageViewerCounter` `XhImageViewerFlipHorizontalTrigger` `XhImageViewerFlipVerticalTrigger` `XhImageViewerImage` `XhImageViewerNextTrigger` `XhImageViewerPrevTrigger` `XhImageViewerResetTrigger` `XhImageViewerRoot` `XhImageViewerRotateLeftTrigger` `XhImageViewerRotateRightTrigger` `XhImageViewerToolbar` `XhImageViewerTrigger` `XhImageViewerViewport` `XhImageViewerZoomInTrigger` `XhImageViewerZoomOutTrigger` |
| 组合式函数 | `useImageViewer` |
| 状态机 | `imageViewerMachine` |
| 皮肤 | `@xihan-ui/styles/image-viewer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ImageViewerItem[]` |  | 图片清单。看单张就给长度 1 的数组。缺省为空，此时打开也只有工具条与空视口。 |
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
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 |
| `translations` | `Partial<ImageViewerTranslations>` |  |  |
| `onOpenChange` | `(details: ImageViewerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onIndexChange` | `(details: ImageViewerIndexChangeDetails) => void` |  | 下标变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ImageViewerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `index-change` | `ImageViewerIndexChangeDetails` | 下标变化；detail 为 `{ index: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhImageViewerRoot` | `default` | `ImageViewerRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

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

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `INDEX.SET` · `INDEX.NEXT` · `INDEX.PREV` · `ZOOM.BY` · `ZOOM.SET` · `ROTATE.BY` · `FLIP` · `TRANSFORM.RESET` · `IMAGE.LOAD` · `IMAGE.ERROR` · `PAN.MOVE` · `POINTERS.DOWN` · `POINTERS.CHANGE` · `POINTERS.END` · `PAN.END` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `index` | `number` | 当前下标，恒在 [0, count - 1] 内；清单为空时为 0。 |
| `count` | `number` |  |
| `currentItem` | `ImageViewerItem \| null` | 当前那张图；清单为空时为 null。 |
| `transform` | `ImageViewerTransform` |  |
| `panning` | `boolean` | 正在拖拽平移。 |
| `imageStatus` | `ImageViewerImageStatus` | 当前那张大图的取图相位；换图与重开都回到 loading。 |
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
| `getToolbarProps` | `() => T['element']` | 底部那条控件带，装缩放、旋转、翻转与归零这几颗钮。 它报的是 `role=group`：一组有名字的控件，每颗钮各占一个 Tab 位。 不报 `role=toolbar`——那个角色承诺条内靠方向键走位，而左右方向键与 Home/End 在这台上是翻页；要那套走位就往这条带里放一个 Toolbar 组件。 |
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

## 无障碍

### 键盘

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
| `+` / `=` | open | 放大一档（zoomStep），到 maxScale 停住 |
| `-` | open | 缩小一档，到 minScale 停住 |
| `0` | open | 缩放、旋转、翻转与平移一并复位 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `backdrop` | `aria-hidden` | 'true' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | currentItem?.alt |
| `content` | `aria-modal` | 'true' |
| `content` | `role` | 'dialog' |
| `viewport` | `aria-busy` | imageStatus === 'loading' \|\| undefined |
| `toolbar` | `aria-label` | label.toolbar |
| `toolbar` | `role` | 'group' |
| `counter` | `aria-live` | 'polite' |

## 样式参考

### 皮肤

`@xihan-ui/styles/image-viewer.css` 使用 `[data-scope="image-viewer"][data-part="trigger"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-state` | 'open' \| 'closed' |
| `viewport` | `data-dragging` | ''（条件成立时才出现） |
| `viewport` | `data-loading` | ''（条件成立时才出现） |
| `viewport` | `data-state` | 'open' \| 'closed' |
| `image` | `data-dragging` | ''（条件成立时才出现） |
| `image` | `data-loading` | ''（条件成立时才出现） |
| `image` | `data-state` | 'open' \| 'closed' |
| `toolbar` | `data-state` | 'open' \| 'closed' |
| `counter` | `data-count` | String(count) |
| `counter` | `data-index` | String(index + 1) |
| `counter` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-image-viewer-action-bg-active` | `flip-horizontal-trigger`<br>`flip-vertical-trigger`<br>`next-trigger`<br>`prev-trigger`<br>`reset-trigger`<br>`rotate-left-trigger`<br>`rotate-right-trigger`<br>`zoom-in-trigger`<br>`zoom-out-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-color-neutral-950` | image-viewer 的 flip-horizontal-trigger、flip-vertical-trigger、next-trigger、prev-trigger、reset-trigger、rotate-left-trigger、rotate-right-trigger、zoom-in-trigger、zoom-out-trigger 部件 background 覆盖槽。 |
| `--xh-image-viewer-action-bg-hover` | `flip-horizontal-trigger`<br>`flip-vertical-trigger`<br>`next-trigger`<br>`prev-trigger`<br>`reset-trigger`<br>`rotate-left-trigger`<br>`rotate-right-trigger`<br>`zoom-in-trigger`<br>`zoom-out-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-color-neutral-950` | image-viewer 的 flip-horizontal-trigger、flip-vertical-trigger、next-trigger、prev-trigger、reset-trigger、rotate-left-trigger、rotate-right-trigger、zoom-in-trigger、zoom-out-trigger 部件 background 覆盖槽。 |
| `--xh-image-viewer-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-color-neutral-950` | image-viewer 的 backdrop 部件 background 覆盖槽。 |
| `--xh-image-viewer-backdrop-blur` | `backdrop` | `backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | image-viewer 的 backdrop 部件 backdrop-filter 覆盖槽。 |
| `--xh-image-viewer-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | image-viewer 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-image-viewer-chrome-bg` | `close-trigger`<br>`counter`<br>`next-trigger`<br>`prev-trigger`<br>`toolbar` | `background` | `default` | `--xh-color-neutral-950` | image-viewer 的 close-trigger、counter、next-trigger、prev-trigger、toolbar 部件 background 覆盖槽。 |
| `--xh-image-viewer-close-bg-active` | `close-trigger` | `background` | `active` | `--xh-color-neutral-950` | image-viewer 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-image-viewer-close-bg-hover` | `close-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-color-neutral-950` | image-viewer 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-image-viewer-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | image-viewer 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-image-viewer-close-size` | `close-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-lg` | image-viewer 的 close-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-image-viewer-counter-padding` | `counter` | `padding` | `default` | `--xh-space-1` | image-viewer 的 counter 部件 padding 覆盖槽。 |
| `--xh-image-viewer-fg` | `content` | `color` | `default` | `--xh-color-neutral-0` | image-viewer 的 content 部件 color 覆盖槽。 |
| `--xh-image-viewer-icon-size` | `content` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | image-viewer 的 content 部件 --xh-icon-size 覆盖槽。 |
| `--xh-image-viewer-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | image-viewer 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-image-viewer-loading-bg` | `viewport` | `background` | `loading` | `--xh-bg-surface-raised` | image-viewer 的 viewport 部件 background 覆盖槽。 |
| `--xh-image-viewer-loading-radius` | `viewport` | `border-radius` | `loading` | `--xh-shape-surface` | image-viewer 的 viewport 部件 border-radius 覆盖槽。 |
| `--xh-image-viewer-loading-size` | `viewport` | `block-size`<br>`inline-size` | `loading` | `--xh-control-h-lg` | image-viewer 的 viewport 部件 block-size、inline-size 覆盖槽。 |
| `--xh-image-viewer-overlay-radius` | `counter`<br>`next-trigger`<br>`prev-trigger`<br>`toolbar` | `border-radius` | `default` | `--xh-shape-pill` | image-viewer 的 counter、next-trigger、prev-trigger、toolbar 部件 border-radius 覆盖槽。 |
| `--xh-image-viewer-toolbar-gap` | `toolbar` | `gap` | `default` | `--xh-space-1` | image-viewer 的 toolbar 部件 gap 覆盖槽。 |
| `--xh-image-viewer-toolbar-padding` | `toolbar` | `padding` | `default` | `--xh-space-1_5` | image-viewer 的 toolbar 部件 padding 覆盖槽。 |
| `--xh-image-viewer-toolbar-radius` | `toolbar` | `border-radius` | `default` | `--xh-shape-control` | image-viewer 的 toolbar 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-fade-in` · `xh-fade-out` 随皮肤自带，不引用别处文件里的名字；`background` · `scale` · `transform` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
