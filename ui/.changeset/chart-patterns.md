---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

图表在颜色不可用或不可靠时改用纹理区分系列：强制色与打印下总是开启，作者在任意祖先上写 `data-xh-chart-patterns` 也会开启。

- 直角坐标图的柱与面积改用本系列的斜线纹理填充并描出轮廓，折线换成各自的线型（实线、长虚线、点线、点划线……）；饼图的扇区改用本色槽的纹理，「其他」不带纹理。图例与提示框的色标画成同一副纹理与线型，压在色块上的标签改用标签色并描一圈承载面色。
- 8 种纹理（45° 与 135° 各三档疏密，外加斜向与正向两种交叉）与色槽一一对应，语义系列按声明次序取。纹理定义在绘图区开头的 `<defs>` 里，id 由绘图区的 id 派生，服务端渲染与客户端一致；三端都画出它。
- 新增 API `patterns`、`getDefsProps`、`getPatternProps`、`getPatternLineProps`，新增部件 `defs`、`pattern`、`pattern-line`；系列分组、扇区、图例项与提示框的行带 `data-xh-chart-pattern`。纹理的方向、线距与线型由 Chart 家族配方给出，门禁核对配方与 headless 的纹理形状逐项相同。
