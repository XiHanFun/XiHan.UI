---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** Container（容器）：把页面内容收进居中限宽的版心。`maxWidth` 取 `sm` / `md` / `lg` / `xl` 四档，与同名断点同宽；`full` 不限宽，只保留左右内衬；缺省 `lg`，根上的 `data-max-width` 缺省档也写出。

- 最大宽度含左右内衬；内衬窄屏 16px，视口达到 `sm` 断点起 24px。
- 公开槽 `--xh-container-max-w`、`--xh-container-px` 写入后覆盖全部档位与视口档。
- Vue / React 为 `XhContainer`；Web Components 为 `<xh-container max-width="…">`，作者写 `data-xh-part="root"` 的节点，宿主由皮肤设为 `display: contents`。
- headless 导出 `connectContainer`、`containerAnatomy`、`containerKeyboard`、`containerMeta` 与类型 `ContainerProps`、`ContainerApi`、`ContainerMaxWidth`。
