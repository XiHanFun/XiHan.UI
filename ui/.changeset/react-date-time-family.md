---
"@xihan-ui/react": minor
---

**React 侧铺上日期时间这一族五个组件：`calendar`、`date-field`、`date-picker`、`time-field`、`time-picker`。**

这一批是目前为止最重的一批：日历有网格与月份切换的键盘面，两个 picker 是浮层加输入的组合，两个 field 是分段输入。受控值、表单接线、浮层消解三样在同一批里全都要对。

**`date-picker` 一个组件里跑四台机器**，是 React 侧第一个这样的组件。编排机 + 日历 + 起止两组分段输入共用一份 `scope`，三台内嵌机器的 props 都从编排机现读，所以建立顺序是硬的：`useOverlay` 先建（它要给编排机交 `config` / `registerLayer` / `presence`），编排机随后，日历与两组段位再随后。日历的 `getGridEl` 走各自的 `onCreate` 交出去——机器的挂载效应一启动就读 refs，放进组件自己的效应里就晚了。

**分段输入与日期格子的处理器，React 上必须改装成原生监听器。** `connect` 派的 `focus`（DOM 的那一个，不是 `focusin`）、`pointerenter`、`pointerleave` 三样都不冒泡，而 React 的合成事件全部委派在根容器上、只在冒泡阶段派发：`onFocus` 挂的是 `focusin`，另外两个是从 `pointerover` / `pointerout` 合出来的。接线看着还在，段位得焦不记锚点、指针扫过日历不出区间预览——全程零报错。八处逐个走了 `useNativeEvents`：日历的网格与格子、两个 field 的段位、时间选择器的段位与浮层选项、日期选择器的段位与格子。

**这条口径原先有一处静默漏检，顺手把门禁补上。** `check-native-events` 是拿「本组件自己那份 `connect` 派了哪几个不冒泡事件」当分母的，而 `date-picker` 自己那份一个都不派——它的段位与格子直接返回 `connectDateField` / `connectCalendar` 算出来的 props。于是这个组件整个被 `continue` 跳过：接不接原生监听器，门禁一句话都不会说。现在按「从兄弟组件目录引进了那一家的 `connect` 函数」把转交的那几家一并算进分母，`date-picker` 的三类事件因此进了等式（21 个组件 36 类 → 22 个组件 39 类）。反向验过：把格子那一行的 `onPointerEnter` 摘掉，门禁点名报出这一个。

**共享一致性套件咬不到原生改装那一路**，它走的是真实的 `el.focus()`（`focusin` 会冒泡），接线断了照样全绿。补了 `date-time-native-events.spec.tsx` 八条，按 DOM 的送达路径直接派发。八条一并反向验过——五个组件的 `useNativeEvents` 名单全清空，八条整齐判红。

**认表单重置的四个组件逐个调了 `useFormReset`，锚点接在根部件自己渲的那个节点上。** `date-picker` 那边四台机器逐一挂：编排机与两组段位各自认重置，日历那台不认、由 hook 自己让位；漏挂内嵌那两组的话，浮层里的值回去了而输入行里的段位还停在旧值上。门禁对 React 只做静态串匹配（源码里有没有这句调用），核不到那只 ref 有没有真落到根节点上，所以 `form-reset.spec.tsx` 里补了四条行为用例。两个方向都反向验过：摘掉那句 hook，四条判红；只把 `date-field` 根节点上的 `ref=` 拿掉、hook 留着，那一条照样判红。

**双面板的面板号也补了一份判据。** 面板号写在日历上一处，面板内的标题、网格与格子跟着它走，自己写了仍按自己写的算——落点在 React 上是一个默认值为 0 的 context 加一个 `usePanelIndex`。共享套件的 fixture 是单面板的，落点恒为 0，「跟着所在的日历走」这条路一次都不走。`date-picker-panel-index.spec.tsx` 四条，与 Vue 侧同名那份对位；把 `usePanelIndex` 改成无视显式写的那一份，四条全红。

四条判据链全绿：共享一致性套件这五个组件共 150 条（含各自的键盘表覆盖行），**键盘豁免零条**；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这五个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 56/126。

**这一族在 Vue 侧没有一个部件收 `asChild`**，React 这边照样不收。四份影子输入按既有口径给了空的 `onChange`（值攥在机器里，React 又要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。`date-picker` 的浮层壳挂了自绘滚动条，与 Vue 侧同一处；层分支因此记的是输入行加浮层壳两个节点，按住条子拖动不会把浮层消解掉。

**已知没有判据咬得住的几处，逐条记在案。** 共享套件的 fixture 里不出现的部件，`check-part-wiring` 只核「适配器源码里引到了那个 getter」，行为一条都没跑过：日历的 `prev-year-trigger` / `next-year-trigger` / `week-number`，日期选择器的那几个同名部件外加 `heading-year-trigger` / `heading-month-trigger` / `time-column` / `time-item` / `confirm-trigger`。其中 `XhDatePickerTimePanel`（`showTime` 打开时自动铺出时分秒三列）整个只有类型与门禁兜着。另外，React 侧还没有浏览器态用例与计算样式快照这条输入，五个组件的皮肤、退场动画与浮层定位一律不在判据内——这一族的浮层退场只能在真机上看。
