---
"@xihan-ui/react": minor
---

**React 侧再铺五个导航与结构组件：`tabs`、`segmented`、`steps`、`breadcrumb`、`pagination`。**

五个都是键盘面重的组件：方向键沿轴走、Home / End 跳首末、`tabs` 与 `steps` 还分手动与自动两档激活（automatic 下方向键顺带切换选中，manual 下只搬焦点、Enter / Space 才落值）。共享键盘表 27 行逐行有用例认领，**一条豁免都没加**——jsdom 演不出来的只有真实 Tab 焦点环绕那一类，这五个都不涉及。

`tabs` 的换位与关闭是通知而非命令：库不持有标签序，`onTabMove` / `onTabClose` 只发意图，DOM 里的顺序要宿主写回 `collection` 才变。`steps` 的 `linear` 把没走到的那几步锁成 `aria-disabled`（不是原生 `disabled`，那样就当不成方向键的起点）。`breadcrumb` 没有状态机，`connect` 直接吃 props；当前页那条渲染成带 `aria-current="page"` 的 `<a>`，点击由连接层拦下，避免 href 跳回自己。`pagination` 是这一批唯一带浮层的：省略位可展开，接了运行期配置、消解层与定位引擎，收起走 presence 闸门落成内联 `display`，自绘滚动条挂在 positioner 上。

**容器的 `onFocus` 必须装成原生监听器，这一批又踩到三处。** `tabs.list`、`steps.list`、`segmented.root` 的 connect 都派了一个 `onFocus`，写的是 DOM 的 `focus`——不冒泡，只在容器自己得焦时把焦点转投给锚点条目。React 的同名合成事件挂的是冒泡的 `focusin`，条目得焦也会把它叫起来，那一帧的锚点还停在上一次的取值，焦点被从条目抢回旧锚点。改坏了验过：`tabs` 的「点击 trigger 切换选中」与 `steps` 的三条（点 trigger 切步 / linear / 受控 value）当场判红。`useNativeEvents` 的 `only` 只摘 `onFocus`——`onFocusout` 经归一化落到 React 的 `onBlur`，那本就是冒泡的 `focusout`，改装反而收不到后代失焦。条目自己的 `onFocus`（`tabs.trigger` / `steps.trigger` / `segmented.item`）同样是不冒泡的 `focus`，一并装成原生监听器；这一处在共享套件里咬不到（容器那一条接对之后，两条到达路径产出的 DOM 相同），钉的是「按钮的后代得焦不该算本条目得焦」这条语义。

**`pagination` 的省略位靠 `pointerenter` / `pointerleave` 摊开与收起，这两个也不冒泡。** 共享套件只点得到它（`click` 冒泡），这条路一路绿着什么也没核——补了一份 `pagination-ellipsis-hover.spec.tsx`，直接往节点上派不冒泡的事件；改坏了验过，不装原生监听器时 `aria-expanded` 停在 `false`。

`segmented` 是这一批唯一认表单重置的（机器的 `FORM.RESET` 只有它声明），按 React 的接法逐组件调 `useFormReset(service, rootRef)`，锚点落在根部件自己渲的那个 div 上；`form-reset.spec.tsx` 里补了一条行为用例——门禁只静态核那句调用在不在，核不到锚点有没有真落到节点上。

四条判据链：共享一致性套件这五个组件共 75 条、服务端直出 **零豁免**、与 Vue 的逐帧对拍与标签名对拍各收下这五个套件（`parity-react` 的待铺名单同步删名）。

尚未交付：五个组件的浏览器态用例与计算样式快照（React 侧那一整条输入还不存在）；`tabs` 的指针拖动换位只接了事件与量测口，真实拖动同样要等浏览器态；`pagination` 的 `summary` / `jumper` / `page-size-select` 三个部件有组件、共享套件的 fixture 里还没有它们的位置。
