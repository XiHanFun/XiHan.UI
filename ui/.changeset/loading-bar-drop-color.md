---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**加载条撤掉 `color` prop：进度段的颜色只走语气 `tone` 或皮肤槽 `--xh-loading-bar-range`。**

`color` 是一个绕过令牌系统的内联颜色出口：给了之后暗色主题、增强对比与高对比模式都管不到它，与库里「不写颜色散值」的约定相悖，也与 `tone` 两头表达同一件事。现在进度段的内联样式只剩宽度那条轴；要换颜色，六种语气不够就在任意子树上重声明 `--xh-loading-bar-range`。三端同步：Vue / React 的 `color` prop、自定义元素的 `color` attribute、三个加载条服务的 `color` 选项一并撤掉。
