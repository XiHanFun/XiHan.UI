---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

NavigationMenu 面板里的条目可以再带一层子级。新增三个部件：`branch-trigger`（子级开关，原生按钮，`aria-expanded` / `aria-controls` 指向子级）、`branch-indicator`（开关行尾的展开箭头，展开时转向下方）与 `branch-content`（紧跟开关之后的子级容器，`role="group"`，收着时带 `hidden`、被 Tab 整段跳过）；Vue / React 对应导出 `XhNavigationMenuBranchTrigger`、`XhNavigationMenuBranchIndicator`、`XhNavigationMenuBranchContent`，Web Components 由作者用 `data-xh-part` 声明同名节点。

- 同一张面板只展开一枝，点击或 Enter / Space 开合，焦点留在开关上；焦点在子级里按 Escape 只收起这一枝、焦点回到它的开关，再按一次才收起面板。
- 每次展开面板都按当前页重新落定子级：`aria-current="page"` 的链接所在的那一枝展开，其余收起。
- `NavigationMenuNode` 新增 `children`：只给 `collection` 不写结构时，入口的 `children` 铺成面板（`panel` 插槽 / `renderPanel` 仍优先），面板条目的 `children` 铺成一枝子级；子级里只放带 `href` 的链接。`value` 重复、`href` 与 `children` 并存、面板条目两者都没有、子级再往下嵌套都当场报错。`NavigationMenuNodeMeta` 相应多出 `children`。
- 连接层新增 `getBranchTriggerProps` / `getBranchIndicatorProps` / `getBranchContentProps`、`branchValue` 与 `isBranchOpen`；按压通道的部件多了 `branch-trigger`。
- 皮肤：开关与面板里的链接同一种行、读链接那一组槽（等高、行首对齐），展开不换面；子级缩进新增槽 `--xh-navigation-menu-branch-content-indent`（缺省 `--xh-space-4`），箭头盒 `--xh-navigation-menu-branch-indicator-size`（缺省指示符档），开关内间距 `--xh-navigation-menu-branch-trigger-gap`。子级不动高度、不播展开动画，只有箭头按 `nudge` 转向；rtl 下收着的箭头随书写方向指向行尾；强制色下箭头取开关按钮的系统前景（禁用取 GrayText），不随底色被换成 Canvas 而消失。`navigation-menu.css` 因此从 13.4 kB 涨到 16.6 kB（去注释压空白后）。
