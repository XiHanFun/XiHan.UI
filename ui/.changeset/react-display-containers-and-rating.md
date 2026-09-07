---
"@xihan-ui/react": minor
---

**React 侧再铺六个展示与容器组件：`card`、`empty-state`、`statistic`、`progress`、`rating`、`timeline`。**

六个里只有 `rating` 有状态机，其余五个的 `connect` 直接吃 props，props 变了就整份重算属性。六个在 headless 里都声明了 `size`，`rating` 另有 `translations`，因此逐个调了 `withXhConfig`——`useMachine` 那一处只并 `locale` 与 `size`，按组件名分桶的文案到不了它。Vue 侧这六个没有一个部件收 `asChild`，这条接线本批为空。

**`rating` 认 `FORM.RESET`，接了 `useFormReset`，锚点是根组件渲出来的那个 div。** 值攥在机器里，原生 `reset` 只还原原生控件，不接这条线点重置什么都不会发生；Vue 那边由 `useMachine` 顺着组件实例的 `$el` 自动挂上，React 这边必须逐个显式给锚点。门禁对 React 只做静态串匹配，核不到 ref 究竟落在哪个节点上，所以在 `form-reset.spec.tsx` 里补了一条行为用例：点到第 3 颗星、`reset`、回到 `defaultValue` 且表单影子跟着还原。摘掉那句 `useFormReset` 即判红。

**`rating` 的表单影子带 `value`，补了一个空的 `onChange`。** React 要求带 `value` 的输入交出一个变更出口，否则开发构建里逐帧告警；不能改用 `readOnly` 收告警——`readonly` 在归一化快照的 `BASE_ATTRS` 里，多加一个属性会让逐帧对拍当场分叉，而 `connect` 自己按 `readOnly` 这个 prop 发的那一份 `readonly` 照旧。

**`rating` 有四个 `connect` 处理器要改装成原生监听器，其中一条是这一批新遇上的。** `control` 的 `onFocus` 与 `onPointerLeave` 是老口径：前者是不冒泡的 DOM focus，React 的同名合成事件挂的是冒泡的 `focusin`；后者 React 由 `pointerout` 推导，直接派到节点上的 `pointerleave` 到不了。新的一条是 **`item` 的 `onClick` 与 `onPointerMove` 要读 `offsetX`**——指针落在这颗星的左半边还是右半边全靠它，而 **React 的合成鼠标事件根本不带 `offsetX`**（它只搬 `clientX` / `pageX` / `screenX` / `movementX` 那一组），半颗星于是被一律算成整颗。这一条是共享套件的 `allowHalf` 用例先判红才发现的。`onFocusOut` 归到的 `onBlur` 本就是冒泡的 `focusout`，不动它。

**`timeline` 的条目语气经上下文下传给它自己那颗圆点。** `getIndicatorProps` 收条目参数，而圆点是写在条目里的兄弟节点，拿不到条目的 props；照 `steps` 的两层上下文写法，条目在自己这一层再 provide 一份身份。

**`progress` 是单件不是部件族**，形态决定结构：线形渲成轨道套进度两层 `div`，环形把同一份几何画进一张 `<svg>` 里的两个 `<circle>`，环心那一块只在作者给了内容时才渲——不然一个空盒子会压在环上把指针挡住。

四条判据链：共享一致性套件这六个组件共 48 条（`card` 5 / `empty-state` 6 / `statistic` 9 / `progress` 8 / `timeline` 8 / `rating` 12，含 `rating` 键盘表的五行覆盖），**键盘豁免零条**；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这六个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 51/126。

**两处共享套件咬不到的分支各补了一份用例。** `progress-ring.spec.tsx` 钉环形那条分支：套件的 fixture 只有一个 root 节点、也不给 children，环形与环心一次都走不到，画布写成 `div`、环心恒渲一个空盒子都不会判红。`rating-native-events.spec.tsx` 钉 `control` 的 `onFocus`：套件的 `focus` 步骤只落在 `control` 自己身上，从不直接聚焦某颗星，而 React 的 `focusin` 会在星星得焦时也把那个处理器叫起来一次、把焦点抢回锚点。两份都反向验过——把实现改回默认写法即判红。

**有一处接线目前没有判据咬得住**：`item` 的 `onFocus` 也走了原生监听器（与 `control` 同一条口径），但把它退回 React 合成事件，共享套件与新补的两份用例全都照样绿——`focusin` 从星星冒到 `control` 之前会先在星星自己身上派一次，行为恰好重合。只有星星里再嵌一个可聚焦节点时两者才分叉，而库里的星星只放字形。留着是为了与另外两家同一条到达路径，不是为了过某条判据。

尚未交付：六个组件的浏览器态用例与计算样式快照（React 侧那一整条输入还不存在）；`rating` 的半档几何在 jsdom 里只能手工喂 `offsetX` 与 `clientWidth`，真实布局下的落点判读仍要等浏览器态；`progress` 的不确定态与环形动画只落属性，动画由皮肤画，收不进 jsdom 的判据。
