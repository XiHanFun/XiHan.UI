# ImageCropper 图片裁切 <Badge type="info" text="alpha" />

用于选择图片中需要保留的区域。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/image-cropper" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/image-cropper.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/image-cropper" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/image-cropper" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/image-cropper.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

拖动裁切区域或调整把手

<XhDemo src="image-cropper/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="image-cropper"`：**`root`** · **`viewport`** · **`image`** · **`crop-area`** · `crop-handle` · `grid` · `zoom-slider` · `rotate-slider` · `hidden-input`

## 示例

### 固定比例

以 16:9 裁切封面

<XhDemo src="image-cropper/02-aspect-ratio" />

### 圆形裁切

以 1:1 裁切头像

<XhDemo src="image-cropper/03-round" />

### 缩放与旋转

使用内置滑块调整视图

<XhDemo src="image-cropper/04-zoom-rotate" />

### 禁用

禁用后不可调整

<XhDemo src="image-cropper/07-disabled" />

## 设计指引

### 何时使用

- 裁切头像、封面或缩略图。
- 需要固定比例的图片输出。

### 何时不用

- 仅展示图片：使用[图片](./image)。
- 仅浏览或缩放图片：使用[图片查看器](./image-viewer)。
- 仅选择文件：使用[文件上传](./file-upload)。

### 特性

- 使用源图自然像素记录裁切矩形。
- 支持拖动、八方向调整和键盘微调。
- 边缘把手显示为框内短条，角部把手随裁切框形状变化。
- 支持固定宽高比、圆形遮罩、缩放和旋转。
- 支持受控裁切区域和原生表单提交。
- `onValueChangeEnd` 在一次调整结束时触发。

### 最佳实践

- 为裁切区域设置合理的最小尺寸。
- 头像使用 1:1 比例和圆形遮罩。
- 在调整结束或确认时生成裁切结果。
- 跨域图片应在加载前配置 `crossorigin`。

### 反模式

- 在每次位置变化时生成图片或请求服务端。
- 使用过小且无法键盘聚焦的调整把手。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-image-cropper>` |
| Vue 组件 | `XhImageCropperCropArea` `XhImageCropperCropHandle` `XhImageCropperGrid` `XhImageCropperHiddenInput` `XhImageCropperImage` `XhImageCropperRoot` `XhImageCropperRotateSlider` `XhImageCropperViewport` `XhImageCropperZoomSlider` |
| 组合式函数 | `useImageCropper` |
| 状态机 | `imageCropperMachine` |
| 皮肤 | `@xihan-ui/styles/image-cropper.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` |  | 图片地址，原样写到 image 部件的 src 上。 |
| `alt` | `string` |  | 被裁切那张图的替代文本，原样写到 image 部件的 alt 上。 不给时 image 部件落 `alt=""`：读屏就此跳过这张图，不去念地址。 |
| `aspectRatio` | `number \| null` |  | 宽高比（宽 ÷ 高）。给了它，改尺寸时另一条边跟着算；null 与不给都表示不锁比例。 非有限数与非正数按不锁处理。 |
| `value` | `ImageCropperRect` |  | 裁切矩形。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `ImageCropperRect` |  |  |
| `minWidth` | `number` |  | 裁切框的最小宽度，自然像素，默认 0。 |
| `minHeight` | `number` |  | 裁切框的最小高度，自然像素，默认 0。 |
| `zoom` | `number` |  | 显示缩放倍率，默认 1。给定即受控：setZoom 只发 onZoomChange。 |
| `defaultZoom` | `number` |  |  |
| `minZoom` | `number` |  | 缩放滑杆的下限，默认 1。只约束滑杆，不夹取 setZoom。 |
| `maxZoom` | `number` |  | 缩放滑杆的上限，默认 3。只约束滑杆，不夹取 setZoom。 |
| `zoomStep` | `number` |  | 缩放滑杆的步长，默认 0.01。 |
| `rotation` | `number` |  | 显示旋转角度，单位度，默认 0。给定即受控：setRotation 只发 onRotationChange。 缩放与旋转只改图片与裁切框的呈现，裁切矩形与源图像素的对应关系不变。 |
| `defaultRotation` | `number` |  |  |
| `minRotation` | `number` |  | 旋转滑杆的下限，默认 -180。 |
| `maxRotation` | `number` |  | 旋转滑杆的上限，默认 180。 |
| `rotationStep` | `number` |  | 旋转滑杆的步长，默认 1。 |
| `shape` | `ImageCropperShape` |  | 裁切框外形，默认 rect。 |
| `disabled` | `boolean` |  | 禁用：裁切框与把手退出 Tab 序列，指针与键盘都改不动，也不参与表单提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦与被读屏念出，改不动。 |
| `name` | `string` |  | 表单字段名；给了才参与提交，值序列化成 `x,y,width,height`。 |
| `translations` | `Partial<ImageCropperTranslations>` |  |  |
| `onValueChange` | `(details: ImageCropperValueChangeDetails) => void` |  | 每次裁切矩形变化都发；拖动过程中会连续发很多次。 |
| `onValueChangeEnd` | `(details: ImageCropperValueChangeEndDetails) => void` |  | 只在一次拖动结束时发一次，适合拿来做裁切导出。 |
| `onZoomChange` | `(details: ImageCropperZoomChangeDetails) => void` |  | 缩放变化意图；受控时是唯一出口。 |
| `onRotationChange` | `(details: ImageCropperRotationChangeDetails) => void` |  | 旋转变化意图；受控时是唯一出口。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ImageCropperValueChangeDetails` | 裁切矩形变化（拖动途中会连发）；detail 为 `{ value: { x, y, width, height } }` |
| `value-change-end` | `ImageCropperValueChangeEndDetails` | 一次指针拖动松手发一次，一次方向键微调也发一次；detail 为 `{ value: { x, y, width, height } }` |
| `zoom-change` | `ImageCropperZoomChangeDetails` | 缩放倍率变化；detail 为 `{ zoom: number }` |
| `rotation-change` | `ImageCropperRotationChangeDetails` | 旋转角度变化；detail 为 `{ rotation: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhImageCropperRoot` | `default` | `ImageCropperRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`dragging` · `idle` · `resizing`

**事件**：`VALUE.SET` · `ZOOM.SET` · `ROTATE.SET` · `IMAGE.LOAD` · `CROP.NUDGE` · `HANDLE.NUDGE` · `DRAG.START` · `RESIZE.START` · `DRAG.MOVE` · `DRAG.END` · `FORM.RESET`

**判据**：`canEdit`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `ImageCropperRect` | 当前裁切矩形，自然像素。 |
| `zoom` | `number` |  |
| `rotation` | `number` |  |
| `natural` | `ImageCropperSize` | 图片自然尺寸；未加载完成时是 0×0，此时裁切框还量不出位置。 |
| `dragging` | `boolean` | 正在整体拖动裁切框。 |
| `resizing` | `boolean` | 正在拉某个把手。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `getCropRect` | `() => ImageCropperRect` | 取一份当前裁切矩形的副本，交给 cropToCanvas 出图。 |
| `setValue` | `(next: ImageCropperRect) => void` |  |
| `setZoom` | `(next: number) => void` |  |
| `setRotation` | `(next: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getImageProps` | `() => T['img']` |  |
| `getCropAreaProps` | `() => T['element']` |  |
| `getCropHandleProps` | `(props: ImageCropperHandleProps) => T['button']` |  |
| `getGridProps` | `() => T['element']` | 裁切框里的构图参考线，纯装饰。 |
| `getZoomSliderProps` | `() => T['input']` | 缩放滑杆，原生 range 输入。 |
| `getRotateSliderProps` | `() => T['input']` | 旋转滑杆，原生 range 输入。 |
| `getHiddenInputProps` | `() => T['input']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | focus on crop-area, 未禁用且非只读 | 裁切框整体平移一个自然像素，尺寸不变；走到图片边界就停住 |
| `Shift+ArrowLeft` / `Shift+ArrowRight` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus on crop-area, 未禁用且非只读 | 同上，一次走十个自然像素 |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | focus on crop-handle, 未禁用且非只读 | 这个把手负责的那条边或那个角挪一个自然像素，对面那条边钉住不动；锁了比例时另一条边跟着算 |
| `Shift+ArrowLeft` / `Shift+ArrowRight` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus on crop-handle, 未禁用且非只读 | 同上，一次走十个自然像素 |
| `Tab` / `Shift+Tab` | 未禁用 | 裁切框与八个把手各占一个 Tab 停靠点，按文档序依次走过 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `crop-area` | `aria-disabled` | 'true' \| 'false' |
| `crop-area` | `aria-label` | label.cropArea |
| `crop-area` | `role` | 'application' |
| `crop-handle` | `aria-disabled` | 'true' \| 'false' |
| `crop-handle` | `aria-label` | label.handle(position) |
| `crop-handle` | `aria-valuemax` | String(HANDLE_AXIS[position] === 'width' ? natural.wi… |
| `crop-handle` | `aria-valuemin` | String(HANDLE_AXIS[position] === 'width' ? minWidth :… |
| `crop-handle` | `aria-valuenow` | String(HANDLE_AXIS[position] === 'width' ? value.widt… |
| `crop-handle` | `aria-valuetext` | label.valueText({ ...value }) |
| `crop-handle` | `role` | 'slider' |
| `grid` | `aria-hidden` | 'true' |
| `zoom-slider` | `aria-label` | label.zoomSlider |
| `rotate-slider` | `aria-label` | label.rotateSlider |

## 样式参考

### 皮肤

`@xihan-ui/styles/image-cropper.css` 使用 `[data-scope="image-cropper"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-shape` | props.shape |
| `crop-area` | `data-shape` | props.shape |
| `crop-handle` | `data-disabled` | ''（条件成立时才出现） |
| `crop-handle` | `data-position` | position |
| `crop-handle` | `data-readonly` | ''（条件成立时才出现） |
| `crop-handle` | `data-resizing` | ''（条件成立时才出现） |
| `grid` | `data-shape` | props.shape |
| `zoom-slider` | `data-disabled` | ''（条件成立时才出现） |
| `rotate-slider` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-image-cropper-bg` | `viewport` | `background` | `default` | `--xh-bg-muted` | image-cropper 的 viewport 部件 background 覆盖槽。 |
| `--xh-image-cropper-crop-border` | `crop-area` | `border-color` | `default` | `--xh-bg-surface` | image-cropper 的 crop-area 部件 border-color 覆盖槽。 |
| `--xh-image-cropper-grid-line` | `grid` | `background-image` | `default` | `--xh-border-subtle` | image-cropper 的 grid 部件 background-image 覆盖槽。 |
| `--xh-image-cropper-handle-bg` | `crop-handle` | `background`<br>`border`<br>`outline` | `default`<br>`is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw` | `--xh-bg-surface` | image-cropper 的 crop-handle 部件 background、border、outline 覆盖槽。 |
| `--xh-image-cropper-handle-bg-hover` | `crop-handle` | `background`<br>`border`<br>`outline` | `disabled`<br>`hover`<br>`is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`not([data-disabled], [data-readonly])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw`<br>`readonly` | `--xh-bg-brand-subtle-hover` | image-cropper 的 crop-handle 部件 background、border、outline 覆盖槽。 |
| `--xh-image-cropper-handle-bg-resizing` | `crop-handle` | `background`<br>`border`<br>`outline` | `is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw`<br>`resizing` | `--xh-bg-brand` | image-cropper 的 crop-handle 部件 background、border、outline 覆盖槽。 |
| `--xh-image-cropper-handle-border` | `crop-handle` | `border`<br>`outline` | `default`<br>`is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw` | `--xh-_image-cropper-handle-color` | image-cropper 的 crop-handle 部件 border、outline 覆盖槽。 |
| `--xh-image-cropper-handle-length` | `crop-handle` | `block-size`<br>`inline-size` | `is([data-position='e'], [data-position='w'])`<br>`is([data-position='n'], [data-position='s'])`<br>`position=e`<br>`position=n`<br>`position=s`<br>`position=w` | `--xh-space-8` | image-cropper 的 crop-handle 部件 block-size、inline-size 覆盖槽。 |
| `--xh-image-cropper-handle-radius` | `crop-handle` | `border-radius` | `default` | `--xh-shape-pill` | image-cropper 的 crop-handle 部件 border-radius 覆盖槽。 |
| `--xh-image-cropper-handle-size` | `crop-handle`<br>`root` | `block-size`<br>`inline-size`<br>`inset` | `default`<br>`is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw` | `--xh-control-indicator-size` | image-cropper 的 crop-handle、root 部件 block-size、inline-size、inset 覆盖槽。 |
| `--xh-image-cropper-handle-thickness` | `crop-handle` | `block-size`<br>`border-block-end-width`<br>`border-block-start-width`<br>`border-inline-end-width`<br>`border-inline-start-width`<br>`inline-size` | `is([data-position='e'], [data-position='w'])`<br>`is([data-position='n'], [data-position='s'])`<br>`position=e`<br>`position=n`<br>`position=ne`<br>`position=nw`<br>`position=s`<br>`position=se`<br>`position=sw`<br>`position=w` | `--xh-stroke-thick` | image-cropper 的 crop-handle 部件 block-size、border-block-end-width、border-block-start-width、border-inline-end-width、border-inline-start-width、inline-size 覆盖槽。 |
| `--xh-image-cropper-mask` | `crop-area` | `box-shadow` | `default` | `--xh-bg-overlay` | image-cropper 的 crop-area 部件 box-shadow 覆盖槽。 |
| `--xh-image-cropper-slider-accent` | `rotate-slider`<br>`zoom-slider` | `accent-color` | `default` | `--xh-bg-brand` | image-cropper 的 rotate-slider、zoom-slider 部件 accent-color 覆盖槽。 |
| `--xh-image-cropper-slider-w` | `rotate-slider`<br>`zoom-slider` | `inline-size` | `default` | `100%` | image-cropper 的 rotate-slider、zoom-slider 部件 inline-size 覆盖槽。 |
| `--xh-image-cropper-viewport-radius` | `viewport` | `border-radius` | `default` | `--xh-shape-surface` | image-cropper 的 viewport 部件 border-radius 覆盖槽。 |
| `--xh-image-cropper-w` | `root` | `inline-size` | `default` | `100%` | image-cropper 的 root 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
