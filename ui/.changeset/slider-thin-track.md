---
'@xihan-ui/styles': major
---

Slider 改为细轨平面拇指：

- 轨道 2px（lg 3px）、底槽取中性淡底 200 档，已选区间品牌色
- 拇指 12px（sm 10px、lg 16px）白底圆配 2px 品牌描边，静止不投影；可悬停设备上悬停即放大一档，拖动中放大并抬起
- 刻度点 8px 白底圆配 2px 描边，没过的取轨道色、走过的取品牌色
- 禁用：轨道退到中性淡底 100 档，区间、拇指描边与已过刻度退到 200 档，拇指留白面
- 粗指针下控件沿交叉轴外扩到 44px 命中区
- 覆盖槽调整：`--xh-slider-thumb-bg-invalid` 改为 `--xh-slider-thumb-border-invalid`，新增 `--xh-slider-thumb-border-disabled`；刻度的 `--xh-slider-tick-bg-active` / `-bg-disabled` / `-bg-active-disabled` 改为 `--xh-slider-tick-border` / `-border-active` / `-border-disabled` / `-border-active-disabled`，`--xh-slider-tick-bg` 改管刻度点的白底
