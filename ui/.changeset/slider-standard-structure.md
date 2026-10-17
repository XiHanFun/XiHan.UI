---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

滑块改用标准结构：新增 `sliderStructure` 与 `SliderStructureOptions`，次序是标题、控制区；控制区里依次是轨道与已选区间、刻度（给了 `marks` 才铺）、每个值一个拇指（给了 `name` 再带表单影子）。Vue / React 不写默认插槽时照它铺；Web Components 的 `<xh-slider>` 不写部件或只写 `root` 时生成整套节点，标题可用 `slot="label"` 接管。三端新增 `label`：Vue 是标题文字与 `label` 插槽，React 可传任意节点，Web Components 是 `label` 属性，只在不写结构时使用。
