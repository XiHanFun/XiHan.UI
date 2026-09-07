---
"@xihan-ui/react": minor
---

**React 侧铺上集合与检索这一族五个组件：`combobox`、`listbox`、`command`、`cascader`、`tree-select`。**

五个都是「一堆条目 + 一条检索或导航线」。`listbox` 是裸列表框，其余四个各带一层浮层：`combobox` 的锚点是整个输入行，`command` 是模态面板加遮罩，`cascader` 是横着铺开的多列，`tree-select` 是一棵可展开的树。层级集合（列与分支）、分组、连敲检索三样在同一批里都要对。

**不冒泡的事件逐个改装成原生监听器，七处。** `connect` 派的 `focus`（DOM 的那一个，不是 `focusin`）、`pointerenter`、`pointerleave` 都不冒泡，而 React 的合成事件全部委派在根容器上、只在冒泡阶段派发。七处是：`listbox` 的列表容器与条目（都是 `focus`）、`combobox` 与 `command` 的条目（`pointerleave`）、`cascader` 的条目（`focus` 与 `pointerenter` 两样）、`tree-select` 的叶子与分支（`focus`）。`listbox` 容器上那一处最容易看走眼——它同时派 `onFocus` 与 `onFocusOut`，后者经归一化落到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，动它反而会把语义改坏，所以只摘前者。

**共享一致性套件咬不到原生改装那一路**：它走的是真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿。补了 `collection-native-events.spec.tsx` 八条，按 DOM 的送达路径直接派发。八条一并反向验过——五个组件的 `useNativeEvents` 名单全清空，八条整齐判红。

**认表单重置的两个组件（`combobox`、`tree-select`）逐个调了 `useFormReset`，锚点接在根部件自己渲的那个 div 上。** 门禁对 React 只做静态串匹配（源码里有没有这句调用），核不到那只 ref 有没有真落到根节点上，所以 `form-reset.spec.tsx` 里补了两条行为用例。两个方向都反向验过：摘掉那句 hook，两条判红；hook 留着、只把根节点上的 `ref=` 拿掉，两条照样判红。

**候选的结算在 React 上换了一种排法。** 过滤是调用方做的，机器无从预知何时变，headless 要求适配器每次提交完 DOM 发一次 `ITEMS.SYNC`。Vue 走 `nextTick` 合并，React 这边合并到微任务里：根部件每次提交后发起一次，每个候选在挂载、卸载与改名时也各发起一次，同一拍里多次调用只送一个事件。空态的显隐与「高亮项被筛掉时摘掉 `aria-activedescendant`」都挂在这份结算上，而共享套件不动候选的进出。补了 `combobox-item-sync.spec.tsx` 四条，其中一条专门让候选只在作者自己那一层重渲（根部件不跟着渲），钉的正是候选自己那条上报。反向验过：整份上报关掉，四条全红；只摘掉候选那一条，第四条判红。

**`command` 的根部件只渲插槽、不产出自己的元素**，与 Vue 侧同形，所以服务端直出的 `partExempt` 里记了 `command.root`，理由与 Vue 侧那一行逐字一致。键盘豁免同样只有一条 `command.kbd.tab`（jsdom 按 Tab 不移动焦点，焦点环绕演不出来），照 Vue 侧同一行的措辞。

**`asChild` 只有 `command` 的触发器收**，与 Vue 侧一致；其余四个组件在 Vue 上一个部件都不收，React 这边照样不收。两份影子输入按既有口径给了空的 `onChange`（值攥在机器里，React 又要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

**三个浮层壳挂了自绘滚动条**，与 Vue 侧同一处：`combobox` 只摆竖的，`cascader` 只摆横的（纵向溢出归每一列自己），`tree-select` 两条轴都摆。横条的正负按排版方向算，而组件不读计算样式，所以把 positioner 上那份显式的 `dir` 交了过去。三家的层分支因此记的都是「锚点 + 浮层壳」两个节点，按住条子拖动不会把浮层消解掉。

**`cascader` 的空态节点长在 content 里**（Vue 侧也是这样，不是单独一个部件），React 上落成 content 的一个 `empty` 属性，不给就按视图取「无匹配」或「无数据」。搜索候选同理，整组由 `XhCascaderSearchList` 自动铺，`renderItem` 换内容。

四条判据链全绿：共享一致性套件这五个组件共 118 条（`cascader` 27 / `combobox` 27 / `command` 16 / `listbox` 18 / `tree-select` 30，含各自的键盘表覆盖行），**键盘豁免一条**；服务端直出**豁免一条**；与 Vue 的逐帧对拍与标签名对拍各收下这五个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 61/126。

**已知没有判据咬得住的几处，逐条记在案。**

- 共享套件的 fixture 里不出现的部件，`check-part-wiring` 只核「适配器源码里引到了那个 getter」，行为一条都没跑过，共 14 个：`listbox` 的 `empty` / `loading` / `load-more-trigger`，`combobox` 的 `loading`，`cascader` 的 `input` / `search-list` / `search-item` / `group` / `group-label` / `loading` / `footer`，`tree-select` 的 `empty` / `loading` / `footer`。其中 `cascader` 的检索视图（搜索框加候选列表）整条只有类型与门禁兜着。
- 根部件那一次「每次提交完 DOM 都发一遍 `ITEMS.SYNC`」单独摘掉时**判不红**：机器进 `open` 时自己会结算一次，其余变动全被候选自己那条上报盖住。它按 headless 的接线要求与 Vue 侧的形状留着，但当前没有任何一条用例只钉它。
- React 侧还没有浏览器态用例与计算样式快照这条输入，五个组件的皮肤、退场动画与浮层定位一律不在判据内——这一族的浮层退场与多列横向滚动只能在真机上看。
