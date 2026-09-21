---
'@xihan-ui/tokens': minor
---

新增基础色板：十二个色相（red / orange / amber / yellow / lime / green / teal / cyan / blue / indigo / purple / pink）各 11 档（50 – 950），产出 `--xh-color-<色相>-<档>` 共 132 支原语。每档明度、彩度取品牌曲线的基线，彩度再按该档明度与色相收进 sRGB 色域：同一档跨色相同一明度，换色相不改对比度；色相 258 的 indigo 与 `--xh-color-brand-*` 逐值一致。色板由 `build/emit-palette.mjs` 从 `tokens/palette.seeds.json` 的色相角派生，`tests/palette.spec.ts` 逐档核对生成物与运行时 `deriveBrandScale` 同源。

原先只有一档的 `--xh-color-purple-600` 并入色板：名字不变，取值从 `oklch(0.577 0.213 302)` 改为色板曲线的 600 档 `oklch(0.546 0.216 302)`，热力图的 purple 色板随之略深。
