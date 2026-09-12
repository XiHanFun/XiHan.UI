---
'@xihan-ui/web-components': major
---

`<xh-dialog>`、`<xh-image-viewer>` 与非 `contained` 的模态 `<xh-drawer>` 展开期间会将
`backdrop` 和 `positioner` 一起搬到宿主当前 Document 的默认 Portal 根，以脱离作者祖先的
`transform`、`contain` 与 `overflow`；视觉环境继续由 Core 的实例桥接维护。退场完成、切到
非模态、切到 `contained` 或宿主断开时，两个根会精确恢复原作者位置。

这是 Web Components 的运行期 DOM 位置变化：模态展开时不能再假定上述部件仍是宿主的 DOM 后代，
应保存部件引用或从其 `ownerDocument` 查询。`modal="false"` 的 backdrop 仍隐藏且不领取 Portal；
iframe/adopt 后只使用新的所属 Document，不跨 Document 搬运。
