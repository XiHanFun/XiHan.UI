# 对话框

浮在页面之上的一层，通常需要用户处理完成后才能回到页面。

## 何时使用

- 需要用户做出决定且不能忽略（确认删除、填写必要信息）。
- 一段独立的子任务，完成后回到原处。

## 何时不用

- 只提示一条结果时，使用[通知](./notification)的轻提示预设。
- 内容是页面主流程的一部分时，直接展开在页面内。
- 内容很长或是完整表单时，使用[抽屉](./drawer)或单独页面。

## 特性

- `modal` 决定是否锁住下层：非模态不创建遮罩，页面仍可点击、聚焦和滚动；展开期间切换会同步更新这些约束。
- 焦点进入时落在 `initialFocus`；没给时落在内容里第一个可聚焦的控件上，越过关闭钮与拖动把手（除它们之外没有可聚焦的才落在关闭钮上），`alertdialog` 落在内容容器本身。关闭后归还触发器。
- `closeOnEscape` 与 `closeOnInteractOutside` 可分别关闭，避免填写中的表单因误点外部而丢失。
- 内容区可以内部滚动。Body 是模态滚动面：滚到头不带动页面，内容高度变化时保留稳定的滚动条空道。
- `draggable` 让面板可以挪走：指针按住标题栏（header，没写 header 时是 title）即跟手，落在标题栏里的按钮、链接与表单控件照常点；面板四边始终夹在视口内，每次打开都从居中落点起。键盘经 `drag-trigger` 挪：它是一块透明的把手，放在 header 里时铺满标题栏，焦点落在它上面时方向键挪一步（10px）、Shift 挪一大步（50px）、Enter / Space 回到居中；初始焦点越过它，落到第一个真正的控件上。位移写成 content 上的两个私有槽、按 transform 平移，与进出场的 translate / scale 叠加，拖过的面板从拖到的位置退场。Web Components 侧的属性是 `panel-draggable`：`draggable` 是 HTML 全局属性，写在宿主上会把它变成原生拖放源。
- 面板走 M4 sheet 三件套（描边、不透明底、投影）。触发器与关闭按钮走 Action Control 家族配方：触发器为 text 档中性描边，关闭按钮为 icon 档 ghost 面，悬停与按下沿画布承载阶梯换底，Space / Enter 与触屏按住期间投影 `data-pressed`。标题为 heading-3，说明文字为 13px 说明档。
- 关闭时内容立即失活并退出可访问树，内容与遮罩的有限退场动画全部完成后再释放模态资源，并发出 `onExitComplete` / `exit-complete`。重开撤销旧退出，卸载立即清理。
- 内容第一次打开才挂载，缺省在退场动画播完后卸载、下次打开重新挂载。反复开合而内容又重时（设置面板、长表单）把 `unmountOnExit` 设为 false：打开过之后收起只隐藏——定位层以内联 `display: none` 收起、遮罩不留、Portal 视觉桥断开——面板里的组件状态、输入与滚动位置都留着，再打开不必重挂。Web Components 的作者节点一向常驻；写进 content 里一个 `<template>` 的内容按同一规则挂卸：第一次打开克隆，缺省退场播完撤走，`unmount-on-exit="false"` 时克隆一次之后常驻。
- 另有命令式服务，业务代码一次调用即可弹出。
- 命令式服务与声明式组件共用 `Header / Body / Footer` 三段：标题和徽记在 Header，字符串、函数正文及取值表单在 Body，操作按钮在 Footer。长内容只滚动 Body，头尾保留在面板内。
- 命令式服务的 `onOk` 返回 `false` 只阻止关闭；同步抛错或 Promise 拒绝会保持对话框打开，设置独立 `service.actionError` 并触发 `onActionError({ cause })`。`cause` 保留原始异常，不直接转成用户提示。
- 失败提示与确定 / 取消钮缺省取语言包里 `translations.dialog` 的 `actionError` / `ok` / `cancel`（服务 `config` 里的语言包，自定义元素侧取宿主所在处的全局配置），个别服务用 `actionErrorText` / `okText` / `cancelText` 覆盖：Vue 支持字符串/ref/getter，React 支持字符串/getter，Web Components 使用字符串，与各端按钮文案合同一致；提示位于 Body 的 `role=alert` 实时区。重试先清理旧异常，关闭或切换请求后旧 Promise 不再写回。
- 服务宿主或函数正文渲染失败会拒绝所属请求，`onActionError` 通知自身失败也会拒绝所属请求；业务需要处理返回 Promise 的拒绝。显式 `target` 必须是当前文档中已经连接的元素，无法展示时不会解析为取消或永久等待。

## 组合

- 内容区放[滚动区域](./scroll-area)；按钮行使用[按钮组](./button-group)；轻量确认场景改用[弹出确认](./popconfirm)。

## 最佳实践

- 标题说明本次要做什么，不写“提示”。
- 确认按钮的文字写具体动作（“删除”），不写“确定”。
- 破坏性操作使用危险语气，并让取消成为默认焦点。

## 反模式

- 在对话框内再打开对话框。
- 内部有未保存的输入却允许点击外部关闭。
