---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

ImageCropper 出图按所见生效，新增水平 / 垂直翻转。

- 修复：出图原先直接 `drawImage` 裁切矩形，旋转不进导出图、`shape="round"` 也不裁成圆形。新增 `toCanvas(options?)`（Vue / React 插槽载荷、Web Components 元素方法）：裁切矩形、旋转、翻转与圆形外形一并生效，像素取自 image 部件；圆形裁成内切于裁切矩形的椭圆，椭圆外透明；旋转 90° 的倍数时画布宽高互换，其余角度为旋转后的外接矩形。纯函数 `cropToCanvas` 新增 `rotation` / `flip` / `shape` 三个选项，`width` / `height` 量的是旋转之前的那块内容。
- 新增翻转：`flip` / `defaultFlip` / `onFlipChange`（`{ horizontal, vertical }`，Vue 走 `v-model:flip`，Web Components 属性写空格分隔的轴名 `flip="horizontal vertical"`，事件 `flip-change`），API `flip` / `setFlip()` / `toggleFlip(axis)`。翻转与缩放、旋转一样同时作用在图片与裁切框上，只改呈现，裁切矩形不变；拖动的位移换算同样拆掉翻转。
- 新增部件 `flip-trigger`（`XhImageCropperFlipTrigger`，Web Components 作者节点写 `axis="horizontal|vertical"`）：原生按钮报 `aria-pressed`，接 Action Control text 档 sm、缺省 outline，翻着时为品牌淡底选中面，带按压通道。文案新增 `translations.flipHorizontal` / `translations.flipVertical`。
- 方向键改为跟随屏幕方向：图片转了、翻了，框在屏幕上往哪边挪就按哪个键，旋转取最近的直角（此前按图片像素方向走，旋转 90° 后按右键框会往下走）。headless 新增 `screenStepToImage`、`sameCropFlip`、`IMAGE_CROPPER_NO_FLIP`，`CropProjection` 新增可选 `flip`。
- Web Components 元素新增只读的 `currentFlip` 与 `setFlip()` / `toggleFlip()` / `toCanvas()` 方法。
