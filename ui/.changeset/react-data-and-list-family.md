---
"@xihan-ui/react": minor
---

**React 侧铺上数据与列表这一族六个组件：`table`、`list`、`tree`、`transfer`、`virtualizer`、`infinite-scroll`。**

六个的共同点是「一堆行 + 一条导航线」，分歧在行从哪儿来：`list` 是纯容器，行由作者自己排；`tree` 与 `transfer` 是集合，行的身份、禁用与层级都回 `collection` 里查；`table` 多一层列与区段（表头 / 表体 / 脚注）；`virtualizer` 与 `infinite-scroll` 不持有行，只回答「此刻该渲哪几条」与「该取下一页了吗」。

**不冒泡的事件逐个改装成原生监听器，七处。** `connect` 派的 `focus` 是 DOM 的那一个（不是 `focusin`），而 React 的合成事件全部委派在根容器上、只在冒泡阶段派发。七处分两类：容器兜底那一路（`tree` 的 `tree`、`transfer` 的 `list`、`table` 的 `body`），焦点从外面进来时把它转投给锚点行；行自己那一路（`tree` 的 `item` 与 `branch`、`transfer` 的 `item`、`table` 的 `row`），得焦即改记锚点。三个容器都同时派 `onFocusOut`，它经归一化落到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，动它反而把语义改坏，所以只摘 `onFocus`。

**共享一致性套件咬不到这一路**：它走真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿。`collection-native-events.spec.tsx` 补了六条，按 DOM 的送达路径直接派发。六条一并反向验过——三份组件源码里 `useNativeEvents` 的名单全清空，六条整齐判红，改回即全绿。

**行离场时的焦点上报从 passive 改成 layout effect，这一条差点静默失效。** 行被摘出 DOM 时浏览器不派 `focusout`，焦点无声掉回 body，而机器仍记着那个已经不存在的锚点：容器因此不再兜底进 Tab 序列，整组一个停靠点都没有，键盘再也进不来。适配器要在卸载时如实上报——但 React 对被删子树的 passive 清理排在 DOM 摘除**之后**，那时 `getActiveElement()` 已经是 body，守卫一律不成立，事件一次都发不出去。改成 layout effect（照 `tags-input` 那一处的做法，服务端退回永不执行的 `useEffect`），清理跑在节点摘除之前，焦点还在它身上。

这条同样没有现成判据：套件的 fixture 是一棵固定的树，不会在中途摘掉持有焦点的行。新增 `collection-focus-report.spec.tsx` 四条，覆盖三个组件的「行离场」与 `tree` 的「节点还在、身份换了」。两个方向都反向验过：三处上报 hook 全摘掉，四条判红；hook 留着、只把 layout effect 换回 `useEffect`，四条照样判红。

**`table` 的行按区段拆成了两个内部组件。** Vue 侧在 `setup` 里按区段二选一，表头行与脚注行不报行身份、不认领 Tab 位、也没有焦点上报，数据行三样都有——两条路的 hook 数不一样，而 React 的 hook 不能按条件调。照 `tag` 的写法：`XhTableRow` 用一个 `useState` 把挂载那一刻的区段冻住，再分派给两个内部组件。

**`table` 的根渲的是三样并排的东西**，与 Vue 侧同形：工具条槽的产出排在最前（它是 `root` 的兄弟——`root` 是 `role=grid`，子节点只能是 row 与 rowgroup）、`root` 本身、以及根自己渲的播报区（活动区域塞进 `role=grid` 是 `aria-required-children`）。工具条槽的载荷只给对整张表下手的那几样，逐行的东西（可见行、行号、逐行查询）不进来。

`transfer` 的两个面板共用一份实现，只在 `side` 上不同；`XhTransferSourcePanel` / `XhTransferTargetPanel` 各是一层薄壳，部件名与 Vue 侧一一对上。搜索框带 `value` 与 `onInput`、没有 `onChange`，按既有口径补了一个空的 `onChange`（React 要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

六个组件在 Vue 侧一个部件都不收 `asChild`，React 这边照样不收；六个的机器里也都没有 `FORM.RESET`，因此都不调 `useFormReset`，也没有影子输入。

四条判据链全绿：共享一致性套件这六个组件共 91 条（`table` 25 / `tree` 23 / `transfer` 17 / `virtualizer` 10 / `infinite-scroll` 9 / `list` 7，含各自的键盘表覆盖行），**键盘豁免一条** `table.kbd.column-visibility`，理由照 Vue 侧同一行逐字抄（列设置区在 `root` 之外，fixture 表达不出它的兄弟位）；服务端直出**零豁免**，六个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这六个套件，`parity-react` 的待铺名单同步删掉六行；`react-coverage.json` 记到 81/126。逐帧对拍连跑两轮结果一致，没有抖字段。

**已知没有判据咬得住的几处，逐条记在案。**

- **jsdom 没有布局，量测口一律是空的。** `virtualizer` 的一致性套件自己把视口尺寸与滚动量桩成了可读可写，所以「该渲哪几条、位移多少、总长多少」这一路是真跑过的；但**条目的 `measure` 回喂没有任何用例碰过**——套件的 fixture 不开这个开关，真实高度回喂给内核那条线只有类型兜着。`getContentEl` 同理：内核不认识 content 节点，把这行 `refs.set` 整个摘掉，一致性套件与逐帧对拍全绿（已实测）。
- **`infinite-scroll` 的滚动容器 `getTargetEl` 也判不红。** 套件那台假观察器只记「观察了谁」与 `rootMargin`，不记 `root`，而用例又不传 `target`；把这行 `refs.set` 摘掉，全套照样绿（已实测）。也就是说「列表滚在某个 overflow 容器里、提前量要按那块可视区算」这条接线，当前只有代码在保证。
- **共享套件的 fixture 里不出现的部件，只有 `check-part-wiring` 的「源码里引到了那个 getter」在核，行为一条都没跑过，共 12 个**：`tree` 的 `item-checkbox` / `branch-checkbox` / `empty` / `loading`，`transfer` 的 `group` / `group-label` / `empty` / `loading`，`table` 的 `toolbar` / `column-list` / `column-visibility-trigger` / `load-more-trigger`。其中 `table` 的列设置那一组（列表区加显隐把手，以及「把手不写 `value` 时跟着所在列标题走」的那条继承）整条只有类型与门禁兜着。
- **`table` 的工具条槽同理**：`check-slot-types` 只核「标了 `SlotChildren` 就得经 `renderSlot` 取值」，套件的 fixture 里没有工具条，载荷里那十四样一条都没被读过。
- **播报区的文本不进判据**：归一化快照只收属性、文档序、焦点与事件，不收文本。`tree` 与 `table` 的 `live-region` 在不在场由逐帧对拍咬着，里面写了什么没有。
- React 侧还没有浏览器态用例与计算样式快照这条输入，六个组件的皮肤、吸顶表头、虚拟滚动的真实滚动行为与拖动换位的指针路径一律不在判据内——这些只能在真机上看。
