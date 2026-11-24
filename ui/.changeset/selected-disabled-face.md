---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
---

**改进** 选中又禁用的面只有一个式子：选中面往承载面兑一半。新增语义令牌 `--xh-bg-brand-disabled`（品牌实心）与 `--xh-bg-brand-subtle-disabled`（品牌淡底），`--xh-bg-segment-selected-disabled` 改引前者、取值不变；语气面取语气层同式的一支，并出公开令牌 `--xh-tone-disabled`。Toggle、ToggleGroup、Toolbar 的按下又禁用，ImageCropper、JsonViewer 的品牌淡底开关禁用，RadioGroup segmented 的禁用选中段都改用它们——此前各皮肤手写混色，兑的中性底有淡底不透明档与承载面两种，同一种状态两种长相。按下又禁用的 Toggle、ToggleGroup、Toolbar 面比此前略浅一点。
