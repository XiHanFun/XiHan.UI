---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 图片的 `fit`、`lazy` 与 `preview`。

- `fit`：图片在盒子里的铺法，取值与 CSS `object-fit` 同名（`cover` / `contain` / `fill` / `none` / `scale-down`），落成 image 部件上的 `data-fit`。没写时照旧由 `--xh-image-fit` 决定、缺省 `cover`；写了就压过那个变量。
- `lazy`：进入视口附近才去取图，交给浏览器原生的 `loading="lazy"`。等着取图期间图片元素不再带 `hidden`（收起的图片浏览器永远不会去取），由皮肤叠在图位上保持透明，占位与回退内容照常顶着；载好那一刻才淡入，取不到照样收起、回退内容顶上。以前在 image 部件上直接写 `loading="lazy"` 的图片永远停在加载中，改用 `lazy`。
- `preview`：点击图片打开大图预览（一台图片预览，工具条带缩放、旋转、翻转与归零，外加关闭钮）。开了以后 root 是一颗按钮（`role="button"`、`tabindex="0"`、`aria-haspopup="dialog"`、`data-interactive`），Enter / Space 也能打开，预览层关上后焦点回到图片；键盘聚焦时环画在盖满图位的一层上，占位层盖不住它。写成 `{ src }` 时预览层看另一张图（缩略图给小图、预览给原图）。Web Components 的 `<xh-image preview>` 在 root 之后自己生成那台 `<xh-image-viewer>`，作者不写它的部件，它的 `open-change` 不冒出图片；对象写法经 property 赋值。
- Headless 的 `ImageApi` 新增 `previewable`、`previewOpen`、`previewItem` 与 `setPreviewOpen`；键盘表新增 Tab 与 Enter / Space 两行。
