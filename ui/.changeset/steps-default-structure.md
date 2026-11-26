---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Steps 只给 `collection` 时按标准结构铺出整条步骤条（Vue 不写默认插槽、React 不给 children、Web Components 不写部件或只写 `root`）：每步一个条目，触发器里是序号圆点、标题与说明，之后是连接线；走过的步圆点留空交给皮肤画对号，`variant="dot"` 一律留空，`readOnly` 时触发器铺成 `div`。headless 新增 `stepsStructure` 与 api 的 `variant`。

**修复** 只给 `collection`、不写 `count` 时，状态机的步序上界也取 `collection` 的长度；此前点哪一步、前进后退都被夹回 0。
