---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

媒体与图形族补齐五处能力缺口，全部是加法：既有部件、槽、props 与事件一个都没有改名或退役。

**`image` 新增 `placeholder` 部件**（`XhImagePlaceholder` / `part="placeholder"`）。此前 `fallback` 一个部件同时承担「还在加载」与「加载失败」，作者只能靠 `showFallback` 载荷自己分流，而它的默认长相是一行居中文字——加载中最需要的占位面没有着落。`placeholder` 只在 `idle` / `loading` 两相露面，铺满图位，默认给一层比根底稍重的面（槽 `--xh-image-placeholder-bg` / `--xh-image-placeholder-fg`），作者把骨架屏或模糊小图放进去即可。默认插槽的载荷同批加 `showPlaceholder`。节点是可选的，不写照旧。

**`image-viewer` 新增大图的取图相位。** 打开一张几 MB 的原图时，`content` 已经淡入、`image` 还是空的，台前是一整块什么都没有的暗底。现在 `image` 与 `viewport` 两个部件在取图期间带 `data-loading`，`viewport` 同时报 `aria-busy`，皮肤给出 `cursor: progress` 与画面正中的一块占位面（槽 `--xh-image-viewer-loading-size` / `-radius` / `-bg`）；`ImageViewerApi` 加只读的 `imageStatus`（`loading` / `loaded` / `error`），Vue 侧经根组件默认插槽透出。换图与重开都回到 `loading`。

**`image-viewer` 新增 `+` / `=` / `-` / `0` 四个键位**：放大一档、缩小一档、变换整体复位，与工具条上那三颗钮同一条通道（`ZOOM.BY` / `TRANSFORM.RESET`）。带 `Ctrl` / `Meta` 的同样按键不接，留给浏览器的页面缩放。**注意**：看片浮层打开期间，这三个按键不再冒泡到宿主——原先在宿主上监听 `+` / `-` / `0` 的页面，浮层开着时收不到它们。

**`image-cropper` 新增 `zoom-slider` / `rotate-slider` 两个部件**（`XhImageCropperZoomSlider` / `XhImageCropperRotateSlider`，两侧都是原生 `<input type="range">`）。示例里早就有「缩放与旋转」这一档，解剖里却一个控制件都没有，作者只能各自拿滑块拼一套。同批把 `rotation` 从只读 prop 补成与 `zoom` 同形的受控通道：新增 `defaultRotation`、`onRotationChange`（Vue 的 `rotation-change` / `update:rotation`，WC 的 `rotation-change` 事件）与 `api.setRotation`；两条滑杆的区间与步长各留 `minZoom` / `maxZoom` / `zoomStep` 与 `minRotation` / `maxRotation` / `rotationStep`（缺省 1–3 步长 0.01、−180–180 步长 1），只约束滑杆，命令式赋值不受它们夹取。给了 `rotation` 的既有用法行为不变。

**`file-upload` 新增 `item-progress` 部件**（`XhFileUploadItemProgress` / `part="item-progress"`）。机器一直在算 `progress`，解剖里却没有承载它的地方，示例只好自己拼一条进度条。新部件在传输中露面，宽度按连接层写下的比例走（槽 `--xh-file-upload-item-progress-w` / `-h` / `-radius` / `-track` / `-fill`）。同批给传完的那一行补一枚对勾字形（槽 `--xh-file-upload-item-fg-done`），与失败那一行的警示字形对称——此前「传完了」与「还没开始」在行上看不出分别。
