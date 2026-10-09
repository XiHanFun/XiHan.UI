---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': patch
---

轨道几何补上分档的语义尺寸令牌，Slider 与 Progress 的缺省尺寸改经它们取值，取值不变：

- 新增 `--xh-track-thumb-size-sm` / `-md` / `-lg`（10 / 12 / 16px）：Slider 拇指直径
- 新增 `--xh-track-thickness-sm` / `-md` / `-lg`（3 / 4 / 8px）：Progress 线形轨道厚度
- 新增 `--xh-track-band-thickness-sm` / `-md` / `-lg`（8 / 12 / 16px）：Progress 带分段色带（子弹图）的轨道厚度
- 不分档的 `--xh-track-thickness`（6px）与 `--xh-track-thumb-size`（18px）取值不变，用途收窄为 PasswordInput 强度条厚度与 ColorSlider 拇指直径
