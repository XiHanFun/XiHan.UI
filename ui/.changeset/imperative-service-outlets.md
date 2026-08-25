---
"@xihan-ui/vue": minor
---

命令式服务补齐三件：顶部进度条服务、取值型弹窗、配置源可运行期换。

**新增 `createLoadingBarService`**。路由守卫与请求拦截器要在组件树之外开合进度条，此前只有组件形态 `XhLoadingBarRoot`，使用者只能自己在应用根挂一个再拿模块级状态去桥接。形态与另两个服务一致：一个工厂、自建 holder 挂 body、句柄带 `dispose`。

句柄上是**在途计数**而不是布尔开关：`start()` 递增、`finish()` 递减并夹到 0，归零才收。这是它比自搭那层壳多出来的东西——布尔开关下三个并发请求里第一个回来就把条子收掉，剩下两个还在跑。另有 `error()` 换语气收尾、`finishAll()` 不管在途一律收、`set(value)` 切确定进度（再 `start()` 回到不确定）。

**命令式对话框的正文加宽，并新增 `prompt`**。`ConfirmOptions.content` 从 `string` 放宽成 `DialogBody = string | (() => VNodeChild)`：给串仍走 `XhDialogDescription`（读屏的 `aria-describedby` 接在它上面），给渲染函数则整块摊在正文位。不收裸 VNode——服务宿主是常驻的，忙态一翻就整棵重渲，同一个 VNode 实例被复用时行为未定义。

`prompt` 解决的是「弹窗里要填东西，填完把值带回来」：每次打开建一份 `reactive` 初值，`body(value)` 与 `onOk(value)` 拿的是同一份可写代理，确认后 `resolve` 一份普通对象快照，取消 / Esc / 卸载 `resolve null`。`prompt` 的 `onOk` 返回 `false` 表示校验没过、弹窗保持打开；`confirm` 的 `onOk` 签名不吃 `false`，语义一字未动（现有 `onOk: () => api.check()` 恰好 resolve false 时不会静默变成「按了确定不关」）。

**配置源与文案改成可运行期换**。三个服务的 `config` 从 `XhConfig` 放宽成 `MaybeRefOrGetter<XhConfig>`，句柄上多一个 `setConfig`；`okText` / `cancelText` / `translations` 一并放宽。此前文案只在创建服务那一刻求值一次，应用切语言后服务子树里的按钮与读屏名不跟——队列里的对话框还会跨过一次切换。取值优先级：调用点 > 服务选项 > `config.translations.<组件>` > 组件内建。


顺带修正 `docs/guide/versioning.md` 里两个失准的样式钩子计数（114 → 119、500 → 505）。
