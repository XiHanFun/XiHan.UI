---
"@xihan-ui/react": minor
---

**React 侧再铺六个导航与工具条组件：`menubar`、`navigation-menu`、`side-nav`、`toolbar`、`tour`、`anchor`。**

六个里有四个带浮层或层级。`menubar` 是一排入口共用一台机器：定位锚点、被定位的浮层壳与焦点域容器都随「当前展开的是哪一张」换人，所以三份角色节点按 `value` 各记一张表，机器经 `getAnchorEl` / `getFloatingEl` / `getContentEl` 现查。Vue 侧靠 `watch` 迁移键，React 这边把登记做成按 `value` 记忆的 ref 回调——`value` 变了 React 先拿旧回调注销旧键、再拿新回调登记新键，卸载时同样注销，比自己盯着 `value` 少一条会说岔的路。退场闸门一张菜单一份：它们各开各的、动画各跑各的，一份管不过来；开合判据直接取 `connect` 这一帧产出的 `hidden`，不另起一套。

`menubar` 的子菜单跑的是另一台 `menu` 机器（submenu 档）：菜单栏那台是单机器单锚点，装不下第二层。`XhMenubarSubTrigger` 把两家的 props 合成一份，合并序是子先父后——反过来写会让节点带上 `data-scope="menu"`，菜单栏按自己的 scope 查条目就一条都找不到。任意层级的选中都汇到根：先发根的 `select`，再 `setValue(null)` 关掉整条菜单栏（菜单栏是「当前展开哪一项」的模型，没有 `setOpen`）。

`tour` 是模态浮层加步进：遮罩、高亮框与定位层三样一起搬到浮层落点（遮罩留在原地就会被面板甩下），收起统一押后到退场动画播完；`side-nav` 的弹出面板只在折叠态出现，定位层与面板的 `hidden` 同样跟着闸门走。`navigation-menu` 的面板就在文档流里，层只参与 Escape 仲裁与栈顶判定，不陷焦点、不锁滚动。`toolbar` 与 `anchor` 不建 scope——两者的 `connect` 都不派生配对 id。

**不冒泡的事件这一批有九处，逐处装成了原生监听器。** `menubar` 的 root / trigger / item、`navigation-menu` 的 root / trigger、`side-nav` 的 branch-trigger / link、`toolbar` 的 root / item：`connect` 点名的 `focus` / `pointerenter` / `pointerleave` 都不冒泡，而 React 的 `onFocus` 挂的是冒泡的 `focusin`、`onPointerEnter` 是从 `pointerover` 合出来的，直接送到节点上的那一种一个都到不了。容器那一档尤其要命——`menubar` 与 `toolbar` 的根 `onFocus` 只该在容器自己得焦时把焦点转投给锚点，挂成 `focusin` 之后条目得焦也会把它叫起来，焦点当场被从条目抢回旧锚点。`onFocusOut` 不动：它经归一化落到 React 的 `onBlur`，那本就是冒泡的 `focusout`，改装反而收不到后代失焦。

共享一致性套件核不到这一路（它走的是真实 `el.focus()`，`focusin` 会冒泡），补了一份 `navigation-native-events.spec.tsx` 按 DOM 的送达路径直接派。**九处逐处反向验证过**：把哪一处的改装拆掉，就有对应的用例判红——菜单栏与工具条的「容器得焦转投条目」「条目得焦换锚点」、导航的「指针离开整个 nav 收起面板」、侧栏的「分支入口/链接得焦换锚点」「折叠态掠过延时弹出」「延时到点前离开撤销那次弹出」。入口的 `pointerenter` 两处由共享套件自己咬住（`menubar` 与 `navigation-menu` 的套件都直接派了裸 `pointerenter`），拆掉同样判红。

四条判据链：共享一致性套件收下这六个套件（**一条键盘豁免都没加**，与 Vue 侧同一行）、服务端直出 **零豁免**、与 Vue 的逐帧对拍与标签名对拍各收下这六个（`parity-react` 的待铺名单同步删名）。这六个都不认 `FORM.RESET`，没有表单重置这条线要接。

尚未交付、以及目前没有判据咬得住的地方：

- **量测口在 jsdom 里恒为空**。`anchor` 的滚动观察（`getScrollEl` / `getListEl` 交出去了，判定线与指示条量测都在机器的效应里跑）、`navigation-menu` 与 `anchor` 的指示条坐标、`tour` 的高亮框与自动滚动、`side-nav` 弹出面板与 `menubar` 浮层的定位结果——这些都要真实布局才算得出来，接线接上了，但**没有判据咬得住**，不拿 mock 假装量到了。要核只能等浏览器态。
- 六个组件的浏览器态用例与计算样式快照都还没有（React 侧那一整条输入还不存在）。
- `menubar` 的子菜单（`XhMenubarSub` / `XhMenubarSubTrigger`）有组件，共享套件的 fixture 里还没有它们的位置，逐帧对拍因此照不到这一段；同一段在 Vue 侧由单独的 `menubar-submenu.spec.ts` 认领，React 这边还没有对位的那一份。
- 有几个部件接线接上了，但共享套件的 fixture 里没有它们的位置，逐帧对拍与标签名对拍照不到，只有部件接线门禁核得到：`menubar` 的 `arrow` 与 `item-description`、`navigation-menu` 的 `trigger-indicator`、`side-nav` 的 `group` / `group-label` / `positioner`、`anchor` 的 `link-text`。其中 `side-nav` 的 `positioner` 由本批新补的那份用例顺带渲出来了（折叠态弹出那两条），但它只核悬停这条路，不核定位层自己的属性。
