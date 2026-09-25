---
'@xihan-ui/styles': patch
---

`layout` 的侧栏里放了 `side-nav` 时，侧栏内衬缺省为 0。

`side-nav` 自带一圈内衬，展开与折叠宽度又与 `layout` 的侧栏同取侧栏令牌；此前侧栏再叠一圈 `space-3` 内衬，导航就比侧栏的内容盒宽出 24px，右缘被裁掉。现在侧栏检测到其中有 `side-nav` 根（三端都认，包括 Web Components 隔着 `<xh-side-nav>` 宿主的写法）时把内衬缺省归零，展开与折叠两档导航都正好铺满侧栏；覆盖档（`siderPresentation: 'sheet'`）同样归零，刘海与底部横条的安全区照旧保留。

侧栏里 `side-nav` 以外的内容（如折叠把手）也随之贴边；需要留白时写 `--xh-layout-sider-padding`，槽优先于这条缺省。不认 `:has()` 的引擎（Firefox 121 以前）保持原来的内衬。
