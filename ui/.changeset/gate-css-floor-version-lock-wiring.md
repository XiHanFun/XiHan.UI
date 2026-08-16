---
"@xihan-ui/styles": patch
---

三道新门禁把版本政策里「只靠自觉」的条款焊成机器检查，`pnpm gate` 由二十项变二十三项。

- **`check-css-floor`**：`.browserslistrc` 书面记录浏览器硬底线，拒绝名单拦住 `@container`
  这类无兜底的抬底线特性（`@scope`、`@starting-style`、`view-transition`、滚动驱动动画、
  CSS 嵌套等），`light-dark()` / `dvh` 必须同级联兜底；`field-sizing` 的退化路径在 HTML 侧，
  按文件白名单放行。
- **`check-version-lock`**：17 个库包的 `package.json` 必须同版本。此前改一个包的 version
  而不动其余 16 个没有任何门禁会响，锁步发版只靠自觉。
- **`check-wiring`**：`tooling/scripts` 里每个检查脚本都必须接进某个 pnpm script——写了不接线
  等于没写，死引用同样被拦下。

同时 `check-slot-types` 补上第四条判据：写进 `SlotsType` 却从不渲染的插槽（消费方合法传进来的
`#slot` 会被静默吞掉），裸引用 `slots.item` 整体传给 helper 的 collection 族用法计入「用过」。
