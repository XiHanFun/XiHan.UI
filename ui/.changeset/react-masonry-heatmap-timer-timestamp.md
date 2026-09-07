---
"@xihan-ui/react": minor
---

**React 侧铺上最后四个组件：`masonry`、`heatmap`、`timer`、`timestamp`。`react-coverage.json` 记到 126/126，待铺清零。**

四个各占一种模型：`masonry` 是没有机器的排版容器，分几列与每一项落哪一列都要先量到尺寸，量测与分配归适配器，`connect` 只把结果落成属性；`heatmap` 跑机器，一份 `connect` 同时供日历、月历、矩阵三种形态，网格由作者按网格模型铺，键盘在 `grid` 上收口；`timer` 跑机器，起跑后在宿主里挂着两个定时器（按 `interval` 跳数字的那一个与精确落在终点上的那一个）；`timestamp` 一台机器都没有，文本与 `datetime` 全部由 `connect` 从入参算出来。

**`heatmap` 的三路不冒泡事件改装成原生监听器。** `grid` 上是「网格自己得焦就把焦点转投给锚点那一格」的 `focus`，`cell` 上是 `focus` 与 `pointerenter` / `pointerleave`。`grid` 的 `onFocusOut` 不动——它经归一化落到 React 的 `onBlur`，挂的正是冒泡的 `focusout`，改装反而会改坏「网格内部换格子不算离场」那一条；`onPointerCancel` 同理，`pointercancel` 本就冒泡。另外三个组件的 `connect` 一个不冒泡的事件都不派。

- 指针那一路由共享套件自己咬住：`heatmap` 的详情条用例本就直接往格子上派 `pointerenter` / `pointerleave`。反向验过：把 `bind.attrs` / `bind.ref` 换回裸的 `getCellProps()`，「详情条：指针进到某一格就打开，离开即收起」当场判红。
- 聚焦那两路共享套件咬不住——它走的是真实 `el.focus()`，`focusin` 会冒泡，React 的合成事件照样收得到。新加 `tests/heatmap-native-events.spec.tsx`，按 DOM 的送达路径直接派 `focus`：观察口一条取 `document.activeElement`（网格得焦后焦点该落到锚点那一格），一条取 roving tabindex 的换人。反向验过：两处 `useNativeEvents` 一起换回裸 props，两条同时判红。

**`timer` 卸载时要把定时器摘干净。** 共享套件只在挂载态里断言，卸载之后那一段没有判据：定时器留着的话组件早已不在页面上、回调还在按拍调用。新加 `tests/timer-unmount.spec.tsx`，两条分别核跳数字的那一拍与落在终点上的那一次，观察口取卸载前后的回调计数。反向验过：把 `useMachine` 挂载效应的清理换成空函数，两条判红。

**`masonry` 的观察名单与卸载。** 新加 `tests/masonry-observer.spec.tsx`，换一个只记「谁被观察了、断开过几次」的观察器进去——不伪造任何尺寸，核的是「容器与每一项都在名单里」「项增删后名单跟着换人」「卸载时摘干净」这三条接线。反向验过：去掉卸载清理里的 `disconnect()`，第三条判红。

**四个组件都不认表单重置**（机器里没有 `FORM.RESET` 声明，`masonry` 与 `timestamp` 更是连机器都没有），**没有一个部件带影子输入**，**Vue 侧也没有任何一个部件收 `asChild`**，React 这边照样不收。

**`timer` 的条目文本恒归组件写。** 作者写进 `XhTimerItem` 的内容不渲染：属性照收（走 `mergeReactProps`），内容由 JSX 的显式子节点盖掉，与 Vue 侧「组件不声明插槽」是同一个结果。这一条由套件的「条目里的文本恒归组件写」咬着。

**`masonry` 的 `columns` 在 React 只收数字与断点对象。** Vue 侧兼收字符串是为了模板里写 `columns="3"`，React 的 props 是值不是属性，没有这一层。其余入参与 Vue 逐个同名同义。

**四条判据链全绿：** 共享一致性套件这四个组件共 46 条（`heatmap` 21 / `timer` 9 / `timestamp` 8 / `masonry` 4，另各有一条键盘表覆盖），**键盘零豁免**；服务端直出**零豁免**，四个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这四个套件，`parity-react` 的待铺名单随之清空——那份 `PENDING` 与它带的三条比对整段删掉了，覆盖等式收紧成「目录里的套件一个不落地在对拍」，不留一个恒真的空判据。

**已知没有判据咬得住的几处，逐条记在案。**

- **`masonry` 的量测整条没有判据。** jsdom 没有布局，`getBoundingClientRect()` 恒为 0：按容器宽度换档（`resolveMasonryColumns` 的断点那一支）与按真实高度分配（最短列优先、逐列填）两条都走不到——套件里「三项三列各占一列」这个结果在高度全为 0 时与「逐列轮流」同解，验的是兜底那一支而不是量测那一支。把 `measure()` 整个换成空函数，一致性套件、逐帧对拍与标签名对拍全绿。新加的观察器用例只核名单与断开，观察器回调触发之后的重排同样没有判据（尺寸变化在 jsdom 里发不出来）。
- **`heatmap` 不写 `children` 时组件自己铺的那棵默认树，只有新加的那份用例走到。** 一致性套件的每个用例都自带 fixture，三种形态的默认树与两个渲染口（`renderCell` / `renderTooltip`）一次都没被套件碰过；新加的用例走的是日历形态那一支，月历与矩阵两支的默认树没有判据。
- **`heatmap` 的两个对外事件进不了快照。** 两个宿主的公开事件表只收登记过的那些，`cell-focus` 与 `cell-active` 都不在表内，派没派、派了几次一律看不见。
- **`heatmap` 的详情条落点没有判据。** 套件对详情条只断言 `data-state` 与 `data-placement` 两样，后者由「活跃那一格在本组行里的第几行」算出来、与量测无关；真正量出来的坐标与尺寸落成内联的 `--xh-_heatmap-tip-*` 与 `data-inline-anchor`，前者归一化快照不收 style，后者一次都没进期望表，jsdom 也量不到矩形。
- **`timer` 有八个入参在共享套件里一次都没走到**：`value`、`active`、`autoStart`、`interval`、`targetMs`、`precision`、`format`、`live`。它们随整份 props 交进机器，接线本身没有单独的判据；其中 `autoStart` 与 `interval` 由新加的卸载用例顺带走到，其余六个仍然只有代码在保证。
- **`timestamp` 只在给了 `now` 时是确定的。** 套件的相对说法用例全部显式传参照时刻，不给 `now` 时取真实墙钟那一支没有判据。它也不自己刷新（Vue 侧同样不刷）：相对说法不会随时间自己变，这是当前定案而不是遗漏。
- React 侧还没有浏览器态用例与计算样式快照这条输入，四个组件的皮肤——瀑布流的列宽与间距、热力图的色阶与详情条、计时器与时间戳的字号——一律不在判据内。
