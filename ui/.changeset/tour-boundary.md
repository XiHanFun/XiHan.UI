---
'@xihan-ui/core': minor
'@xihan-ui/position': minor
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/styles': patch
---

引导新增 `boundary`，把引导限在一块区域里，写法同步骤的 `target`（选择器、元素或返回元素的函数；Web Components 的同名属性只收选择器）。遮罩只盖这块区域，高亮框连同暗幕裁在区域里，居中步摆在区域中间，气泡以区域为界避让。区域外照常可读可点，焦点不困在气泡里，对话框也不标 `aria-modal`。引导途中，区域里新开的层（如抽屉）排在引导之下，Esc 仍先收起引导。不给或取不到时照旧是整个视口。

配套的两处底层能力：
- 定位引擎的选项加 `boundary`：可用区域再与这块区域的矩形取交集，翻面、避让与可用空间都以交集为界。
- 层栈的层加 `covers`：之后在这块区域里新开、又不开在本层内容里的层，排在本层之下。
