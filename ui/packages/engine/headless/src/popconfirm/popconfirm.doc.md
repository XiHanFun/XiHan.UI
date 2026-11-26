# 弹出确认

贴着触发器的一句确认：比对话框轻，但仍能拦住一次误操作。

## 何时使用

- 影响有限、可撤销的删除或清空，且触发器就在近处。

## 何时不用

- 后果严重且不可逆时，使用[对话框](./dialog)，让用户读到完整说明。
- 操作可以撤销时，直接执行并配一条带“撤销”的轻提示（[通知](./notification)的轻提示预设），体验优于事前确认。

## 特性

- 不写结构时按标准结构铺（Vue 不写默认插槽、React 不给 children、Web Components 不写部件或只写 `root`），三端出自同一个结构函数：触发器、标题、说明、取消与确认两颗钮、箭头。触发器取 `trigger-text`（React 是 `trigger`）或 `trigger` 插槽，标题与说明取 `title`、`description` 或同名插槽，给了才铺；取消钮排在确认钮之前，展开时焦点先落在退路上；两颗钮的文字取 `cancelText` / `confirmText`，缺省取语言包里 `translations.popconfirm` 的 `cancel` / `ok`。Web Components 的标题文字写作 `title-text`，宿主上的全局 `title` 会出浏览器原生提示。
- 确认按钮支持同步返回和任意 thenable：调用业务前即占用事务，兑现后收起；同步抛错、`then` 读取失败或拒绝都会保持打开，并通过 `actionError` 与 `confirm-error` 原样暴露 `cause`。
- pending 期间重复确认、触发器切换、`setOpen(false)`、Escape 与层外交互都不会关闭。取消仍可立即终止组件的等待并收起；它不假装取消业务 Promise，迟到的兑现或拒绝按事务票据丢弃。
- 受控宿主把 `open` 写为 `false` 属于事实状态，会终止当前确认事务；此后重新写为 `true` 是新会话，旧 thenable 的结算不会关闭它或写入错误。
- 浮层是非模态 `dialog`：不捕获焦点、不锁定滚动、不隐藏页面其他内容。
- 展开后焦点进入浮层：`initialFocus` 给一个选择器，焦点落在 content 里匹配它的元素上（破坏性操作想先落在确认钮上时用它），没给或不匹配时落在第一个可聚焦元素上；`restoreFocus` 为 false 时收起不归还焦点，缺省归还给触发器。
- `lazyMount` / `unmountOnExit` 管 content 里的内容挂不挂、卸不卸，缺省常驻；退场动画播完、资源释放之后发出 `onExitComplete` / `exit-complete`。规则与[气泡卡片](./popover)相同。
- `crossOffset` 沿交叉轴再挪一段：正值往结束方向，落在上下两侧时往行内结束方向（RTL 下向左），落在左右两侧时往下，箭头仍对着触发器中心。`flip` 为 false 时不再自动翻面，守着 `placement` 那一侧，交叉轴贴边挪位照旧；`boundary` 给一块碰撞边界（元素或带 `getBoundingClientRect()` 的对象），浮层只在它与视口的交集里摆，翻面、贴边与可用空间都以交集为界。三项原样交给定位引擎，不写就留给引擎缺省。
- 位置、尺寸、语气三轴。
- 内容与箭头使用与 Popover 同源的 frosted 表面：实体底、1px 描边与一层浮层投影，内衬与尺寸档同 Popover；强制色模式由系统色接管边界。
- 标题、说明与末行操作按固定节奏排布，长文案可在可用宽度内断行；标题 14px / medium，说明 14px 次级色、与标题相距 4px，末行两颗钮与上面的文字相距 16px、彼此相距 8px。触发器与两个按钮走 Action Control 家族配方：确认是本浮层的主要动作，显式 solid 实心（语气随 content 的 `data-tone`）；取消是中性次要出口，outline 描边；触发器为 text 档中性描边。三者的按压反馈、粗指针命中区与焦点环由配方给出，Space / Enter 与触屏按住期间投影 `data-pressed`。
- pending 时确认钮宽不变：一个 micro 之后加载环在钮正中淡入、确认文案同刻淡出留位，快速落定什么都不闪；以 `aria-busy` / `aria-disabled` 报告状态，挂起时按钮不再响应 hover / active 换面，减弱动效下以静止点线圆环表达在途。

## 组合

- 触发器使用[按钮](./button)；放入[表格](./table)的行操作、[菜单](./menu)的条目旁。

## 最佳实践

- 标题直接询问该操作（“删除这条记录？”），描述说明后果。
- 确认按钮写动作名，破坏性操作使用危险语气。

## 反模式

- 每个操作都确认：用户会条件反射地点击确认，确认失去意义。
- 确认框内未说明要删除的是哪一条。
