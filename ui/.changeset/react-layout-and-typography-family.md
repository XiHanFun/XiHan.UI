---
"@xihan-ui/react": minor
---

**React 侧铺上排版与版式这一批八个组件：`flex`、`grid`、`layout`、`page-header`、`descriptions`、`truncate`、`typography`、`watermark`。**

八个里六个没有状态机（`flex` / `grid` / `page-header` / `descriptions` / `typography` / `watermark`），`connect` 在渲染期直接算出属性；`layout` 与 `truncate` 各跑一台机器。

**没有机器的那几个，全局配置只能自己接。** `useMachine` 那一处只并 `locale` 与 `size`，按组件名分桶的文案到不了没有机器的组件。headless 上声明了 `size` 的三个——`descriptions`、`page-header`、`typography`——逐个走 `withXhConfig`；另外三个两样都没声明，与 Vue 侧一样不接，接了也是空跑。反向验过：把 `descriptions` 那一句换成裸对象，`check-config-wiring` 点名报出这一个。

**这一批没有一处要改装原生监听器。** 八份 `connect` 派出去的处理器只有 `onClick` 与 `onKeydown`（`layout` 的把手与遮罩、`truncate` 的整块文字），两个都冒泡，走 React 的合成事件即可；`check-native-events` 因此在这八个上不产出任何待办。同样地，八台里没有一台认 `FORM.RESET`，`useFormReset` 一处都不接。

**Vue 侧这一批没有一个部件收 `asChild`，收的是 `as`。** 换标签在这里是真需求：页头的标题要能写成 `h1`、描述列表的根是 `dl`、版式的富文本要能换成 `article`。React 这边照 `button.tsx` 的写法给 `as?: ElementType`，默认标签与 Vue 逐个对齐（`descriptions` 的 dl / div / dt / dd，`page-header` 的 button 与 div，`typography` 的 p / span / div），由标签名对拍咬住。与 `XhButton` 同一个限制：props 仍按默认标签声明，`as="a"` 时 `href` 这类另一标签独有的属性过不了类型。

**`truncate` 的量测口经 `onCreate` 交出去。** 机器的挂载效应一启动就挂 `ResizeObserver` 与 `MutationObserver` 并立刻量一次，放进组件自己的效应里就晚了——那一步排在 `useMachine` 的挂载效应之后，观察器挂上时读到的是 `null`，量测整条链静默不跑。`grid` 的列数、跨列与错列收字符串与 JSON 串（特性写法拿到的就是串），解析不出对象时按没写算。`flex` 给了 `split` 时在每两个子项之间自动铺一个分隔符部件：`Children.toArray` 已经丢掉 `null` / 布尔并把数组摊平，这里再滤掉只有空白的文本节点。

**共享套件咬不到的三处，各补了一份行为用例。**
`flex-split.spec.tsx` 八条：套件的 fixture 把 `split` 部件一个不落地手写在树里，自动铺那一支一次都不走；反向验过——把自动铺那一支拿掉，六条判红。
`truncate-children.spec.tsx` 五条：套件只递静态子节点，函数式 `children` 的载荷一次都没取过，量测口的接线也只有一张静态门禁看着；反向验过——去掉 `onCreate`，这一份判红两条、一致性套件同时判红六条。
`as-tag.spec.tsx` 六条：`as` 与 `descriptions` 的 `span` 在套件的 fixture 里从不出现，标签名也不进快照；两个方向各自反向验过（钉死标题的标签、丢掉 `span`，各判红一条）。

四条判据链全绿：共享一致性套件这八个组件共 86 条（含 `layout` 与 `truncate` 的键盘表覆盖行），**键盘豁免零条**；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这八个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 69/126。

**已知没有判据咬得住的几处，逐条记在案。**
`layout` 显式建的那份 `scope`（走 `useReactScope`，基名取 React 的 `useId`）拿掉之后判据全绿：把手的 `aria-controls` 与侧栏的 `id` 都出自同一个 service 的 scope，服务自己建一个也对得上；它真正管的是服务端直出与客户端首帧的 id 要同源，而 React 侧还没有这条判据的输入。
`page-header` 的 `breadcrumb` 与 `media` 两个部件不在共享 fixture 里，只有 `check-part-wiring` 的静态接线核着，行为一条都没跑过。
`grid` 的 `rows` 收字符串这条路没有用例（套件只给数字）。
`watermark` 这一侧没有量测口——图样与平铺步距是 `connect` 按字号与角度算出来的，不读 DOM；判据能核到的就是根上那两个内联自定义属性。
React 侧仍然没有浏览器态用例与计算样式快照这条输入，这八个组件的皮肤、`truncate` 的真实裁行与 `layout` 覆盖档的退场动画一律不在判据内。
