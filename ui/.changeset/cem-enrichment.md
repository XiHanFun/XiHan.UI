---
"@xihan-ui/web-components": patch
---

`custom-elements.json` 补上 `cssProperties` 与 `events` 的 `type`。

analyzer 自己吐不出这两样:覆盖槽的事实源在皮肤里,事件 detail 类型在元素源码的 notify 签名上。
新增 `scripts/enrich-cem.mjs` 在 `cem analyze` 之后就地从两边补写——1945 条皮肤覆盖槽、
122 个事件里的 118 个带上了 detail 类型(其余 4 个是 composer#stop 这类没有 detail 的事件)。
`pnpm --filter @xihan-ui/web-components cem` 的产出由 `gate:cem` 的 git diff 校验钉进流水线:
改皮肤或改事件类型而不重跑,门禁当场失败。
