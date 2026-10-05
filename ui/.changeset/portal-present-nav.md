---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

菜单栏、侧栏与引用悬停卡的浮层也只在呈现期间建 Portal 视觉桥。这几个部件的定位层随组件常驻——菜单栏每一项一个、折叠侧栏每个分支一个弹出面板外加一个名称提示、正文里每处 hover 档引用一个——此前一挂载就各建一台桥，在来源整条祖先链上挂观察、建时读一遍计算样式。现在 `XhMenubarPositioner` 跟着这张菜单的退场闸门（由 `XhMenubarContent` 写回）、`XhSideNavBranchContent` 的弹出面板与 `XhSideNavTooltip` 跟着各自的退场闸门、`XhCitationPositioner` 跟着卡片是否渲染（展开中或退场未播完）决定建不建桥：关着不建，展开时在内容露出前建，退场播完后撤掉。Web Components 不经视觉桥，不受影响。
