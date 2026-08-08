---
"@xihan-ui/core": major
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/wc": major
"@xihan-ui/styled": major
"@xihan-ui/icons": major
---

新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
描边、`stroke-width` 2。

用法：

- `@xihan-ui/core` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
- `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
- `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/wc` 注册 `<xh-icon>`
- `@xihan-ui/styled` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
整个失效。

WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
`<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
读屏会念两遍。
