---
'@xihan-ui/tokens': minor
'@xihan-ui/headless': patch
---

图表新增三套配色方案：在任意祖先上写 `data-xh-chart-palette` 即把分类色槽与色块内文字整套换掉，写在 `<html>` 上全站生效，嵌套区域写 `categorical` 改回缺省的多彩分类。

- `monochrome` 主题单色：品牌色阶由深到浅，色槽 1 是主题色，随 `data-brand` 换色
- `brand` 柔和品牌：品牌色相两侧的冷色一族加一抹粉
- `muted` 莫兰迪柔彩：基础色与中性档混合的低彩度色板

每套方案都有亮暗两份取值（`--xh-chart-palette-<方案>-N` 与 `--xh-chart-palette-<方案>-on-N`），由门禁按各自的规则复验。画布渲染的图表在方案切换时跟着重画。

另：有序与顺序色阶改取品牌色阶（基线取值不变，`data-brand` 换色时一起换）；面积淡洗的不透明度 `--xh-chart-area-alpha` 由 0.1 调到 0.2。
