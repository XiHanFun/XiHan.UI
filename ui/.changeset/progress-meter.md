---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** Progress 在量（`semantics="meter"`）下的四样刻画，承担仪表盘与子弹图，三端可用：

- `thresholds` 分段：升序上界 + 语气 + 名字，画成同族淡色的色带；当前值所在的分段决定填充色，`aria-valuetext` 补上分段名（模板 `translations.segmentValueText`）。
- `target` 目标刻度、`scale` 量程刻度与刻度值（`{ ticks, format }`，按 `locale` 写）、`indicator="needle"` 仪表盘指针。
- 线形加分段时画成子弹图：轨道加厚一档，填充收窄压在色带正中。
- 新部件 threshold / target / scale / scale-tick / scale-label / needle；Web Components 侧由元素生成进作者写的外壳。
- 在进度语义下写这些属性报新诊断码 `chart.meter-only`；分段或目标越界报 `chart.invalid-range`。
- 新增组件槽 `--xh-progress-threshold-color`、`--xh-progress-target-color`、`--xh-progress-needle-color`。
- 文档总览的「图表」分类加一张引用卡，指向进度条的仪表盘示例。

**修复** 环形与仪表盘的填充被线形那套按比例的平移挪出画面、只剩轨道的问题。

皮肤体积：`progress.css` 从约 4.6 KB 涨到约 10.6 KB（去注释压空白后），涨在色带、目标刻度、量程刻度、指针三套形态的规则与它们的强制色分支。
