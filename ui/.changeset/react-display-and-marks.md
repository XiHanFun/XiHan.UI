---
"@xihan-ui/react": minor
---

**React 侧再铺六个展示与标记组件：`avatar`、`avatar-group`、`separator`、`skeleton`、`spinner`、`tag`。**

六个里只有 `avatar` 与 `tag` 有状态机，其余四个的 `connect` 直接吃 props，props 变了就整份重算属性。`avatar-group`、`spinner`、`tag` 三个在 headless 里声明了 `size` 或 `translations`，逐个调了 `withXhConfig`——`useMachine` 那一处只并 `locale` 与 `size`，按组件名分桶的文案到不了它，`separator` 与 `skeleton` 两样都没声明，不接。六个组件一条 `FORM.RESET` 都不认（机器的事件联合里没有），Vue 侧也没有一个部件收 `asChild`，这两条接线本批为空。

**`avatar` 的 `load` / `error` 不必改装成原生监听器。** 这两个事件不冒泡，但 React 不把它们交给根容器上的委派：`<img>` 一类的元素由 React 直接在节点上挂 `load` / `error`，套件往 image 节点上直接派发的 `new Event('load')` 因此照常到达。改坏了验过——把 image 部件的属性整份摘掉，六条用例当场判红。

**图片在机器就位前就已解码那一条另外补了用例。** 缓存命中或注水前就加载好的图，`load` 事件早在挂处理器之前派完，之后一辈子等不到，头像会永远停在回退位；补报由 image 部件提交后的效应负责。共享套件咬不到它——jsdom 不真取图，`complete` 恒假、`naturalWidth` 恒零，套件里的 `load` 全是手工派的。`avatar-cached-image.spec.tsx` 把这三个只读属性按「已解码」的样子接管掉，一个事件都不派也要落到 `loaded`；摘掉那句补报即判红。

**`tag` 的「不给关闭钮就不建机器」在 React 上要拆成两个组件。** 不给关闭钮时 `OPEN` / `CLOSE` 两条路都走不到，展开态恒等于 `open ?? defaultOpen ?? true`，一台机器纯属开销——表格一页几十行、每行几个状态药丸就是几百台。Vue 那边在 `setup` 里按挂载那一刻的 `closable` 二选一，React 的 hook 不能按条件调，于是判据冻在 `XhTagRoot` 的一个 `useState` 里，两条路各自是一个组件（`connectTag` / `connectStaticTag`）。受控与非受控语义两条路逐条一致：受控时只发意图、值每次从 prop 现读，非受控时住在本地那一格。两条路各自反向验过——机器路摘掉 `translations`、快路把 `defaultOpen` 换成常量，都判红。

**`XhSeparator` 的三段拼装与 `XhTagRoot` 替纯文字补 `label` 这两条分支，共享套件一次都走不到**：套件的 fixture 总把部件一个不落地写全。写错了套件照样全绿——分隔线会连成一条没有断口的线，标签的文字会直接摊在 root 上把关闭钮挤出去。补了一份 `shorthand-children.spec.tsx` 钉这两条：空白与假分支留下的 children 不算给了文案，文字里夹着节点就整份原样放行。判据用的 `slotIsPlainText` 与 Vue 侧同名同义，落在 `runtime/slot-content.ts`。

四条判据链：共享一致性套件这六个组件共 41 条（含各自的键盘表覆盖行），**键盘豁免零条**；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这六个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 34/126。

尚未交付：六个组件的浏览器态用例与计算样式快照（React 侧那一整条输入还不存在）；`skeleton` 与 `spinner` 的动效只落属性，动画由皮肤画，收不进 jsdom 的判据；`avatar-group` 只把上限如实落成 `data-max`，裁到几枚、「+N」里的 N 写多少仍全在作者手里，与另外两个适配器一致。
