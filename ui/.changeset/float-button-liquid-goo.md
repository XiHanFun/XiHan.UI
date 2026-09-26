---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

FloatButton 在 liquid 档下把触发器与展开组里的动作结成液态组：展开时动作从触发器里分离，收起时融回，融回落定后展开组才带 `hidden`，其间 `inert`；状态机新增上下文 `merging` 与 refs `liquidGroup`。展开组投影 `data-xh-liquid`，缺省 outline 的触发器与原生动作项在组里只留前景与磨砂，底色、细线、亮边与投影由色块层沿整组外形画；`--xh-float-button-shadow` 接到整组的投影上。
