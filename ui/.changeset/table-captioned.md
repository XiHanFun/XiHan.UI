---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

表格（Table）不放 caption 时，根（`role=grid` / `treegrid`）不再恒写指向 caption 的 `aria-labelledby`：此前这条引用落空，作者写在根上的 `aria-label` 被它压住，axe 报 aria-valid-attr-value。现在 caption 在场时根引用它，不在场时沿用作者写在根上的 `aria-label` / `aria-labelledby`；Web Components 里写在 `<xh-table>` 宿主上的命名会转到根上，宿主上的命名改了、caption 后补进来时跟着变。headless 新增 `captioned`，与 `labelled` 同一套在场登记：Vue 的 caption 部件在 setup 里同步登记，React 在 effect 里登记，Web Components 按作者写没写 caption 角色节点判断。
