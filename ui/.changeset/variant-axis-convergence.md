---
'@xihan-ui/core': major
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**形态轴收敛为一套词。**

**字段类默认落 `outline`。** text-field 的 `variant` 未提供时由 connect 落成 `data-variant="outline"`
（root 与 control 两处一致；此前不发属性，由皮肤基础规则按缺省档绘制）。Field Chrome 家族的基础规则已是
描边式（canvas 底 + `--xh-border-control` 描边 + 无影），显式落值后皮肤不再依赖缺省档，外观不变；
自定义皮肤若以"无 `data-variant`"判定默认态需改为读取 `outline`。

**number-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，
皮肤基础规则按缺省档绘制）。默认外观从「透明描边 + raised 落影」改为「`--xh-bg-canvas` 底 +
`--xh-border-control` 描边」；皮肤未改，outline 档仍保留 raised 落影，与 Field Chrome 家族的无影对齐留给
后续配方矩阵。自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。
