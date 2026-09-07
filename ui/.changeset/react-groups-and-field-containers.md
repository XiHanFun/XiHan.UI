---
"@xihan-ui/react": minor
---

**React 侧再铺五个组件：`checkbox-group`、`radio-group`、`toggle-group`、`fieldset`、`field-array`。已铺 23/126。**

前三个是组族，各自与已铺的单件配对：`checkbox-group` 每一项自成一个 Tab 停靠点、另带一颗第三态的全选格（`select-all-trigger` 在事件里现查活 DOM 认领可用条目），`radio-group` 与 `toggle-group` 走 roving tabindex，整组只占一个 Tab 位。组级的禁用、只读、必填与校验状态都由 connect 逐条铺到条目上——`role=group` 接不住 `aria-invalid`，所以校验标记落在每个条目上而不是根上。三个组的表单出口形状不同：复选框组与单选组每个条目内各一份原生输入，开关组整组只有一份。

后两个是字段容器。`fieldset` 无状态机，root 必须是原生 `<fieldset>`、legend 必须是原生 `<legend>`：整组禁用连坐组内控件与「legend 即组名」都是浏览器给的，换成 `div` 只剩一层灰样式。`field-array` 是唯一交出整套动作的那个——函数式 children 交出逐行投影 `items`、行数与上下限状态，以及 `add` / `remove` / `move` 五个动作；删完、挪完由机器按把手的 id 把焦点接到接位的行上，那份 id 从 React 的 `useId` 派生的 scope 来。

**容器的 `onFocus` 必须装成原生监听器。** `radio-group` 与 `toggle-group` 的 connect 在 root 上派了一个 `onFocus`，它写的是 DOM 的 `focus`——不冒泡，只在容器自己得焦时接管，把焦点转投给锚点条目。React 的同名合成事件挂的却是冒泡的 `focusin`：条目得焦也会把它叫起来，而那一帧的 `anchor` 还停在上一次的取值，于是焦点被从条目抢回旧锚点。改坏了验过：这一条不接，「禁用条目仍是方向键的起点」当场判红。`useNativeEvents` 的 `only` 只摘 `onFocus` 这一个——`onFocusOut` 经归一化落到 React 的 `onBlur`，那本就是冒泡的 `focusout`，改装反而会让它收不到后代失焦。

**带 `checked` 的影子输入要交出一个变更出口。** 复选框组与单选组的隐藏输入是 `type=checkbox` / `type=radio` 且带 `checked`，React 在开发构建里会逐帧告警「受控字段没有 onChange」。这里给的是一个空出口：值由机器持有，节点又是 `inert`，它不会被调用；`readOnly` 不能用——那会多出一个 `readonly` 属性，与另外两家的 DOM 不再一致。

四条判据链：共享一致性套件这五个组件共 70 条、服务端直出 **零豁免**、与 Vue 的逐帧对拍与标签名对拍各收下这五个套件（`parity-react` 的待铺名单同步删名）。另在 `form-reset.spec.tsx` 里补了四条行为用例——四个认表单重置的组件各一条：门禁只静态核那句 `useFormReset(` 在不在，核不到锚点 ref 有没有真落到根节点上，而这一路失效时页面上不报任何错。

尚未交付：五个组件的浏览器态用例与计算样式快照（React 侧那一整条输入还不存在），以及 `field-array` 的 `item-label` 部件只有组件、共享套件的 fixture 里还没有它的位置。
