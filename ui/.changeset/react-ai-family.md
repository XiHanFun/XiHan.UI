---
"@xihan-ui/react": minor
---

**React 侧铺上 AI 这一族八个组件：`code-view`、`markdown-stream`、`message-feed`、`prompt-input`、`tool-call`、`reasoning`、`approval`、`diff-view`。**

八个的共同点是「一段还在长的内容」，分歧在谁持有状态：`code-view` 与 `markdown-stream` 一台机器都没有，只把代码与块列表投影成属性；`tool-call` 与 `reasoning` 共用同一台机器（它不认解剖，只认在不在跑与四个叶态），各自配自己的解剖；`prompt-input`、`approval`、`diff-view` 各有一台；`message-feed` 那一台还要接粘底句柄与四个取元素口。

`react-coverage.json` 记到 95/126。

**`message-feed` 的两处 `focus` 改装成原生监听器。** `connect` 派的是 DOM 的 `focus`（不冒泡），React 的同名合成事件挂的是冒泡的 `focusin`：容器那一路会在条目得焦时也被叫起来，把焦点从条目抢回锚点；条目那一路则收不到直接派到节点上的事件。两处都只摘 `onFocus`——同一个根节点上还有 `onFocusOut`，它经归一化落到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，动它反而把语义改坏。

共享一致性套件咬不到这一路（它走真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿），`collection-native-events.spec.tsx` 补了两条，按 DOM 的送达路径直接派。反向验过：把两处 `useNativeEvents` 的名单清空，这两条判红，一致性套件里的两条键盘用例也跟着判红（合成事件把焦点抢了回去）。

**`message-feed` 的条目补上离场焦点上报。** 条目被移出 DOM 时浏览器不派 `focusout`，焦点无声地掉到 body 上，而机器仍记着那个已经不存在的锚点——根的 Tab 位判据是 `focusedId == null`，于是整份消息流一个停靠点都没有，键盘再也进不来。照库里既有的口径写在 layout effect 里（passive 清理排在 DOM 摘除之后，那时 `activeElement` 已经回到 body，守卫恒不成立），另配一条「节点还在、`itemId` 换了」的重报。`collection-focus-report.spec.tsx` 补了两条，两个方向都反向验过：把 layout effect 换回 `useEffect`，「条目被摘掉」那条判红。

需要说明的是**这条上报 Vue 侧的 `message-feed` 没有**，同一个缺陷在那一侧仍在；本批只动 React，没有跨过去改。

**`code-view` 接上可选的默认着色实现，包清单跟着加了一条可选 peer。** `@xihan-ui/code-highlight` 在 Vue 与 Web Components 那两侧都是可选 peer：装了它，模块到达后共用的那一份实现落地，在场的代码视图重渲一次并着色；没装则一直是 null，代码按纯文本渲染。React 这边此前没有这条声明，结果是同一份 `code-view` 在两个适配器上渲出来的东西不一样——逐帧对拍在「标出语言与闭合」那一条上当场判红（Vue 有 `token` 部件，React 只有一个文本节点）。补齐声明后转绿。落地写法与另外两侧对齐，只是把「模块到了要叫醒谁」换成 `useSyncExternalStore`：Vue 用 `shallowRef` 的响应性，React 这边得自己订阅。

`packages/adapters/react/package.json` 因此多了一条可选 `peerDependencies` 与对应的 `devDependency`，`pnpm-lock.yaml` 跟着动。

**测试宿主：部件节点上的连字符属性换成驼峰。** 共享 fixture 写的是 DOM 属性口径（`item-id`、`scope-value`），而部件在 React 侧解析成组件、入参是驼峰 props，原样传过去组件读到的是 `undefined`，条目与授权项的身份整个丢掉。`fixture-element.ts` 里那一步本就在做「DOM 口径 → React 口径」的翻译（空串转 `true` 那一条），这次把连字符键的驼峰化并进去，只对部件节点做，`data-*` / `aria-*` 不动。

**`tool-call` 与 `reasoning` 的收起走退场闸门。** 与 Vue 侧同形：皮肤刻意没给 `content` 补 `[hidden]{display:none}`（补了退场就一帧都播不出来），真正的收起落成内联 `display`，节点始终留在原地；服务端没有 DOM 时闸门退化成「跟着展开态」。

`prompt-input` 的 `textarea` 与 `approval` 的 `note` 都带 `value` 与 `onInput`、没有 `onChange`，按既有口径各补了一个空的 `onChange`（React 要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

八个组件在 Vue 侧一个部件都不收 `asChild`，React 这边照样不收；八台机器里也都没有 `FORM.RESET`，因此都不调 `useFormReset`。

四条判据链全绿：共享一致性套件这八个组件共 73 条（`prompt-input` 13 / `tool-call` 11 / `approval` 10 / `code-view` 10 / `message-feed` 9 / `diff-view` 7 / `markdown-stream` 7 / `reasoning` 6，含各自的键盘表覆盖行），**键盘零豁免**；服务端直出**零豁免**，八个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这八个套件，`parity-react` 的待铺名单同步删掉八行。

**已知没有判据咬得住的几处，逐条记在案。**

- **jsdom 没有布局，`message-feed` 的粘底整条判不红。** 视口与内容两个节点交给机器、句柄在节点换掉之后重绑（`retarget`）、以及「在不在底」这两个布尔本身，都要真实的滚动几何才动得起来；套件里那几条只核了「回到底部按钮按 `atBottom` 收放」这一层属性投影，按钮按下去有没有真滚到底、上滚之后粘附有没有松手，一条用例都碰不到。`getViewportEl` / `getContentEl` 那两行 `refs.set` 与重绑效应，当前只有代码在保证。
- **退场闸门在 jsdom 里只走「没有动画」那一支。** `tool-call` 与 `reasoning` 的 `content` 收起后仍留在 DOM 上、只是拿到内联 `display: none`，这一层由逐帧对拍咬着；而「退场动画播完之前保持可见」那条真正的闸门要量 `animationName`，jsdom 量不到，只能在真机上看。
- **共享套件的 fixture 里不出现的部件，只有 `check-part-wiring` 的「源码里引到了那个 getter」在核，行为一条都没跑过，共 8 个**：`prompt-input` 的 `control`，`tool-call` 的 `summary` / `duration`，`reasoning` 的 `icon`，`approval` 的 `note` / `result` / `footer`，`diff-view` 的 `summary` / `truncation`。其中 `approval` 的 `note` 那一格连带着「备注只随判定载荷发出、不参与能不能批」这条语义，整条只有类型与门禁兜着。
- **着色片段这一路只有 `code-view` 走到过。** `code-view` 的 `token` 部件不在套件的断言里，但默认着色实现落地之后它真的渲了出来，逐帧对拍逐个属性比着——它是被对拍咬住的，不是被套件咬住的（判据来自实测：没有默认实现那一版，对拍就在这一处判红）。`diff-view` 的 `token` 与 `inline-change` 则一次都没渲过：套件的模型不带着色结果，而它那两条改动行是整行替换、词级差异被比例判据丢掉，两支恒为空数组。也是实测的——把词级片段那一支整个短路掉，逐帧对拍照样全绿。
- **`code-view` 的行内容接管口（逐行 children）没有判据。** `check-slot-types` 只核「标了 `SlotChildren` 就得经 `renderSlot` 取值」，套件的 fixture 不传这个函数，载荷里的行文本、下标与行号一条都没被读过。`markdown-stream` 的逐块接管口同理。
- **播报区的文本不进判据**：归一化快照只收属性、文档序、焦点与事件，不收文本。`markdown-stream` 与 `approval` 的 `live-region` 在不在场由对拍咬着，里面写了什么没有。
- React 侧还没有浏览器态用例与计算样式快照这条输入，八个组件的皮肤、流式光标、`textarea` 自动长高、代码块的横向滚动一律不在判据内——这些只能在真机上看。
