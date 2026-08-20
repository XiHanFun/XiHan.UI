# 图片裁切 <Badge type="info" text="image-cropper" />

在一张图上框出要保留的那一块。框可以整体拖动，八个把手各拉一条边或一个角，可锁定宽高比、可设最小尺寸，也能缩放与旋转来看清细节。裁切矩形以源图的自然像素记录，出图那一步由使用者自己决定什么时候做、做成什么。

## 何时使用

- 上传头像、封面、缩略图之前，让用户自己决定保留哪一块。
- 需要固定产出比例（16:9 的封面、1:1 的头像）的图片录入。
- 需要把裁切结果连同表单一起提交：给了 `name`，矩形会以 `x,y,width,height` 随表单发出去。

## 何时不用

- 只是把图片摆在页面上：用[图片](./image)。
- 只要放大看清楚、翻页浏览，不改数据：用[图片查看器](./image-viewer)。
- 只是选文件、还没到框选这一步：用[文件上传](./file-upload)。
- 要调的是一个一维的量（亮度、缩放倍率本身）：用[滑块](./slider)。

## 特性

- 裁切矩形的单位是源图自然像素，与图片显示多大无关；换一块屏幕、换一个容器宽度，值不变。
- 缩放与旋转同时作用在图片和裁切框上，两者始终贴合；它们只改呈现，不改裁切矩形与源图像素的对应关系。
- 指针位移会按当前的缩放与旋转反算回图片坐标系，放大之后拖动依然跟手。
- 一次拖动的位移从按下那一刻的矩形整体算起，不逐帧累加，长距离拖动不会漂。
- 锁定宽高比时，拉角由位移更大的那条轴当驱动，另一条边跟着算；拉边则由那条边驱动。
- 受控与非受控两态齐全：`value` / `defaultValue` 管裁切矩形，`zoom` / `defaultZoom` 管缩放倍率。
- `onValueChangeEnd` 覆盖指针与键盘两条路：一次指针拖动松手时发一次，一次方向键微调也发一次（一按就是一次改完的操作）。矩形没真的变（在框上原地点一下、顶到图片边界推不动）不发。

## 示例

### 基础用法

在图上框出要保留的那一块：整块可拖动，八个把手各拉一条边或一个角；裁切矩形以源图的自然像素记录

<XhDemo src="image-cropper/01-basic" />

### 锁定宽高比

给了 aspectRatio，拉角由位移更大的那条轴驱动、另一条边跟着算，产出比例恒定

<XhDemo src="image-cropper/02-aspect-ratio" />

### 圆形裁切

shape 只改遮罩与描边的样子，裁切矩形还是那个矩形；配 1:1 比例即头像裁切

<XhDemo src="image-cropper/03-round" />

### 缩放与旋转

两者同时作用在图片与裁切框上，看得更清楚；裁切矩形与源图像素的对应关系一点不变

<XhDemo src="image-cropper/04-zoom-rotate" />

### 受控

传了 value 就由宿主说了算：组件只发变更意图，写回去之后框才动

<XhDemo src="image-cropper/05-controlled" />

### 导出裁切结果

出图不归组件管：拿 getCropRect() 的矩形喂给 cropToCanvas，画出来的是一张新画布

<XhDemo src="image-cropper/06-export" />

### 禁用与只读

禁用把裁切框与把手一起摘出 Tab 序列；只读仍可聚焦、仍念得出来，只是改不动

<XhDemo src="image-cropper/07-disabled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-image-cropper>` |
| Vue 组件 | `XhImageCropperCropArea` `XhImageCropperCropHandle` `XhImageCropperGrid` `XhImageCropperHiddenInput` `XhImageCropperImage` `XhImageCropperRoot` `XhImageCropperViewport` |
| 组合式函数 | `useImageCropper` |
| 状态机 | `imageCropperMachine` |
| 皮肤 | `@xihan-ui/styles/image-cropper.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="image-cropper"`：**`root`** · **`viewport`** · **`image`** · **`crop-area`** · `crop-handle` · `grid` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` |  | 图片地址，原样写到 image 部件的 src 上。 |
| `aspectRatio` | `number \| null` |  | 宽高比（宽 ÷ 高）。给了它，改尺寸时另一条边跟着算；null 与不给都表示不锁比例。 非有限数与非正数按不锁处理。 |
| `value` | `ImageCropperRect` |  | 裁切矩形。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `ImageCropperRect` |  |  |
| `minWidth` | `number` |  | 裁切框的最小宽度，自然像素，默认 0。 |
| `minHeight` | `number` |  | 裁切框的最小高度，自然像素，默认 0。 |
| `zoom` | `number` |  | 显示缩放倍率，默认 1。给定即受控：setZoom 只发 onZoomChange。 |
| `defaultZoom` | `number` |  |  |
| `rotation` | `number` |  | 显示旋转角度，单位度，默认 0。 缩放与旋转只改图片与裁切框的呈现，裁切矩形与源图像素的对应关系不变。 |
| `shape` | `ImageCropperShape` |  | 裁切框外形，默认 rect。 |
| `disabled` | `boolean` |  | 禁用：裁切框与把手退出 Tab 序列，指针与键盘都改不动，也不参与表单提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦与被读屏念出，改不动。 |
| `name` | `string` |  | 表单字段名；给了才参与提交，值序列化成 `x,y,width,height`。 |
| `translations` | `Partial<ImageCropperTranslations>` |  |  |
| `onValueChange` | `(details: ImageCropperValueChangeDetails) => void` |  | 每次裁切矩形变化都发；拖动过程中会连续发很多次。 |
| `onValueChangeEnd` | `(details: ImageCropperValueChangeEndDetails) => void` |  | 只在一次拖动结束时发一次，适合拿来做裁切导出。 |
| `onZoomChange` | `(details: ImageCropperZoomChangeDetails) => void` |  | 缩放变化意图；受控时是唯一出口。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ImageCropperValueChangeDetails` | 裁切矩形变化（拖动途中会连发）；detail 为 `{ value: { x, y, width, height } }` |
| `value-change-end` | `ImageCropperValueChangeEndDetails` | 一次指针拖动松手发一次，一次方向键微调也发一次；detail 为 `{ value: { x, y, width, height } }` |
| `zoom-change` | `ImageCropperZoomChangeDetails` | 缩放倍率变化；detail 为 `{ zoom: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhImageCropperRoot` | `default` | `ImageCropperRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`dragging` · `idle` · `resizing`

**事件**：`VALUE.SET` · `ZOOM.SET` · `IMAGE.LOAD` · `CROP.NUDGE` · `HANDLE.NUDGE` · `DRAG.START` · `RESIZE.START` · `DRAG.MOVE` · `DRAG.END` · `FORM.RESET`

**判据**：`canEdit`

## connect API

`useImageCropper` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getImageProps` | `() => T['img']` |  |
| `getCropAreaProps` | `() => T['element']` |  |
| `getCropHandleProps` | `(props: ImageCropperHandleProps) => T['button']` |  |
| `getGridProps` | `() => T['element']` | 裁切框里的构图参考线，纯装饰。 |
| `getHiddenInputProps` | `() => T['input']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | focus on crop-area, 未禁用且非只读 | 裁切框整体平移一个自然像素，尺寸不变；走到图片边界就停住 |
| `Shift+ArrowLeft` / `Shift+ArrowRight` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus on crop-area, 未禁用且非只读 | 同上，一次走十个自然像素 |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | focus on crop-handle, 未禁用且非只读 | 这个把手负责的那条边或那个角挪一个自然像素，对面那条边钉住不动；锁了比例时另一条边跟着算 |
| `Shift+ArrowLeft` / `Shift+ArrowRight` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus on crop-handle, 未禁用且非只读 | 同上，一次走十个自然像素 |
| `Tab` / `Shift+Tab` | 未禁用 | 裁切框与八个把手各占一个 Tab 停靠点，按文档序依次走过 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

- 读屏在浏览模式下把方向键收给虚拟光标，节点报成普通分组就等于键盘调整到不了组件。裁切框因此报成 `role="application"`：焦点落进来读屏自动切焦点模式，方向键归组件。代价是这一小块（框内的参考线与把手）读不了虚拟光标的浏览命令；图片与它的 `alt` 在框外，不受影响。
- 八个把手各自报成 `role="slider"`——它们是叶子节点，报成 slider 才有值语义。裁切框本身不能报 slider：规范里 slider 的子节点一律当装饰，那样八个把手会整批从无障碍树里消失。
- 把手的 `aria-valuenow` 报它推动的那条边长（上下两条边报高度，其余六个报宽度），四个数完整念一遍靠 `aria-valuetext`（`translations.valueText`，收一份裁切矩形、返回一句话）。裁切框自己没有值语义可挂：需要逐次播报平移结果的应用，自己挂一个 `aria-live` 区域监听 `onValueChange` 即可。
- 名字取自 `translations.cropArea` 与八条把手文案，缺省是英文，接入应用时请覆盖成本地语言。
- 键盘可以完成全部操作：裁切框上方向键平移，把手上方向键改尺寸，按住 Shift 走十倍。指针不是唯一路径。
- 整组禁用时裁切框与把手一起退出 Tab 序列——把手是原生按钮，不写 `tabindex` 照样可聚焦，所以禁用时给的是 `-1` 而不是不写；只读时仍可聚焦、仍念得出来，只是改不动。
- 图片的 `alt` 由作者写在 image 部件上——组件不替作者编描述，一张没有说明的图对读屏用户等于不存在。
- 皮肤给每个把手铺了一层不可见的命中区，撑到最小可点尺寸；框拉得很小时相邻把手的命中区会挨上，需要更宽裕的话把 `--xh-image-cropper-handle-size` 调大。只放四个角的把手也是合法用法，剩下的边靠键盘调。

## 样式

默认皮肤 `@xihan-ui/styles/image-cropper.css` 按部件选择：`[data-scope="image-cropper"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-shape` | props.shape |
| `crop-area` | `data-shape` | props.shape |
| `crop-handle` | `data-disabled` | ''（条件成立时才出现） |
| `crop-handle` | `data-position` | position |
| `crop-handle` | `data-readonly` | ''（条件成立时才出现） |
| `crop-handle` | `data-resizing` | ''（条件成立时才出现） |
| `grid` | `data-shape` | props.shape |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-image-cropper-bg` · `--xh-image-cropper-crop-border` · `--xh-image-cropper-grid-line` · `--xh-image-cropper-handle-bg` · `--xh-image-cropper-handle-bg-resizing` · `--xh-image-cropper-handle-border` · `--xh-image-cropper-handle-radius` · `--xh-image-cropper-handle-size` · `--xh-image-cropper-mask` · `--xh-image-cropper-radius` · `--xh-image-cropper-w`

## RTL

- 裁切矩形描述的是图片像素，坐标恒是物理方向：`x` 永远从图片左边缘算起，方向键的左右也永远对应图片的左右。整页 `dir="rtl"` 时框不会翻到另一侧，组件因此不收 `dir`。
- 皮肤里裁切框与把手的落点跟着写物理属性，与连接层算出来的那份坐标同一口径，不依赖祖先链上的文字方向。

## 组合

- 配一个[滑块](./slider)驱动 `zoom`，配两个[按钮](./button)驱动 `rotation`，是最常见的一套工具条。
- 裁好之后把结果丢进[图片](./image)做预览。
- 整套放进[对话框](./dialog)里，确认时再出图。

## 最佳实践

- 视口的尺寸要由图片撑出来（图片铺满视口、高度自适应），裁切框的百分比坐标才对得上。给视口写死一个与图片比例不同的高度，框会和图错位。
- 角色节点的结构有三条硬要求：crop-area 必须是 viewport 的后代（坐标以 viewport 的矩形为准），image 必须是原生 `<img>`（自然尺寸只有它的 load 事件报得出来），crop-handle 必须是原生 `<button>`。
- Web Components 侧每个 crop-handle 都要自己写 `position="nw|n|ne|e|se|s|sw|w"`——把手的身份只能从这个属性上取。写漏或写错的把手不接行为、控制台留一条诊断；Vue 侧同名 prop 是必填的，漏写会有告警。
- 给 `minWidth` / `minHeight` 定一个下限：不给的话用户能把框拉成一条线，出图是一张空图。
- 出图用导出的 `cropToCanvas(image, rect, options)`，在 `onValueChangeEnd` 或用户点确认时调一次即可；每帧都出图会把主线程占满。源图带透明像素又要存成 JPEG 时记得传 `background`，否则透明区会变成黑块。
- `cropToCanvas` 只按矩形裁，不烘焙旋转角度。要把旋转也固化进结果，请先把旋转后的图渲成一张新图再喂进来。
- 跨域图片要先设好 `crossorigin`，否则画布会被污染、`toDataURL` 直接抛错。
- 裁切框的描边与把手底色跟着主题的表面色走，而它们压着的是一张任意的图：图与主题表面色亮度相近时（深色主题配一张暗图、浅色主题配一张亮图）线会看不清。图源的亮度可预期时，用 `--xh-image-cropper-crop-border` 与 `--xh-image-cropper-handle-bg` 把这两处钉成与图对得起来的颜色。

## 反模式

- 把 `zoom` 与 `rotation` 当成裁切参数来读：它们只是看图的辅助，产出永远以裁切矩形为准。
- 每次 `onValueChange` 都去服务端出图：拖动过程中这个回调一秒会发几十次，要发请求请用 `onValueChangeEnd`。
- 只提供指针操作、把八个把手做成两三个像素的小点：既碰不到也说不出，键盘与触屏用户都被挡在外面。
