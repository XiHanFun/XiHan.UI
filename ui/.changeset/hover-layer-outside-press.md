---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**修复** 下拉、菜单这类浮层开着时，悬停出现的浮层压在它上面会挡住它的层外按下：悬停卡片（HoverCard）、引用的悬停预览（Citation `previewMode="hover"`）、悬停展开的菜单（Menu `openOnHover`）与浮动按钮（FloatButton `expandTrigger="hover"`）在场时，按它们的触发器、按在它们里面，下面那张下拉都不收；按空白处只收了它们，下拉要再点一次。它们登记的是 `popover` 层，消解层按栈序把它们当成开在下拉里的子层，可它们悬停就出现，与下拉并没有嵌套关系。

现在这四种层与提示（Tooltip）走同一条规则：留在栈里时只护着它开在其内容里的层（那一层的根节点装着它的根节点或某个分支），与它无关的更低的层照常消解。下拉开着时按它们的触发器、按在它们里面、按空白处，下拉都照常收起；按空白处时它们和下拉一并收起。嵌套关系照旧受保护：悬停卡片开在弹出层、对话框里时，按在卡片里外面那层不收。Escape 的次序不变，仍先收栈顶。点击展开的菜单与浮动按钮经按下打开，行为不变；子菜单缺省悬停展开，也按这条规则走，它的触发条目在父菜单里，父菜单照旧受保护。Vue、React 与 Web Components 三端同步生效。

连带的一处变化：悬停展开的菜单会把焦点拿进自己的内容里，下面与它无关的下拉在菜单出现后随即因失焦收起，不用等按下。此前菜单被当成下拉的子层，焦点移进菜单不算离开下拉。

**新增** `Layer` 的可选成员 `opensOnHover`：登记层时写 `true`，表示这一层悬停就出现、不经按下打开，挡下层外交互时只护着它开在其内容里的层；缺省按 `kind` 取，内联层为 `true`，其余为 `false`。`shouldDismiss()` 按同一条规则判。`@xihan-ui/headless` 新增 `menuOpensOnHover(props)`，给出一张菜单是不是悬停就展开（写了 `openOnHover` 按它，没写时子菜单开启、普通菜单关闭），自建适配器登记菜单的层时用它填 `opensOnHover`。
