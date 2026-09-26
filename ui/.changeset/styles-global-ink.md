---
'@xihan-ui/styles': minor
---

适配全局墨色（描边与淡底改为半透明墨色）：

- 要盖住下层内容的面改取不透明档：Table 吸顶表头、冻结列头与各态行底（冻结单元格靠继承取行底）、Tabs 翻页钮的悬停与按下、FloatButton subtle / outline 的面、Carousel 翻页钮悬停与指示点、Avatar 与头像组溢出计数、Image 占位层、ImageCropper 把手与网格线、Heatmap 空格底（色阶两端之一，半透明会让整条色阶偏色）、Clipboard 自动填充遮罩。
- 共边只画一次：Clipboard 复制钮、ButtonGroup 与 ToggleGroup 关掉分隔线时，后一段不再往回挪 1px 压住前一段的边，改为不画起始边，总尺寸不变。
- Slider 与 ColorSlider 拇指的描边取 `--xh-border-default-opaque`，仍是一道把拇指与已选区间分开的浅框。
- Toggle / ToggleGroup 选中且禁用时掺的中性面取不透明档；禁用的实心 Action Control 与 Tag 给面内墨色域的底色取不透明档（相对颜色语法选墨只看分量、不看透明度，半透明的禁用面会选反墨色）。
