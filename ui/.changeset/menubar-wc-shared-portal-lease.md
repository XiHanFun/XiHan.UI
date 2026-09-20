---
"@xihan-ui/web-components": patch
---

**Menubar 整排 positioner 共用一份 Portal 租约，文档序与 Vue / React 一致。**

Vue / React 把每张 positioner 都经 Portal 搬到落点、视觉环境取自菜单栏根，文档序始终是作者写的那一排。Light DOM 版此前每张菜单各持一份租约、只搬展开的那一张，它会排到还留在原位的兄弟之后，部件序与 `aria-controls` 的配对随之乱掉，三端逐帧对拍整组分叉。现在任一张可见（含退场中）就把整排搬到落点、全部收起才精确归位，逻辑来源改为根；Headless 的单一行为 Layer 仍跨换面复用。
