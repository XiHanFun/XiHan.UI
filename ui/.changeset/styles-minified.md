---
'@xihan-ui/styles': patch
---

**优化** 发布的样式改为去掉注释、压掉空白的一份：`@xihan-ui/styles`、`index.css`、`index.unlayered.css` 与各组件子路径都指向 `dist/` 下的压缩产物，`index.css` 从 2.7 MB 降到 1.6 MB，包里的样式从四份共约 10.6 MB 降到约 4.6 MB，开发服务器加载的也是这一份。压缩只去注释、压空白，不改写选择器与声明值，级联结果不变。带注释的源文件（`css/`、`family/`）与两份可读入口不再随包发布，皮肤里的设计说明在仓库的 `ui/packages/design/styles` 下查阅。导入路径不变。
