---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**Web Components 侧补齐四个命令式反馈服务；轻提示与通知的两套队列合成一套。**

**四个服务**（新子入口 `@xihan-ui/web-components/services`）：`createToastService` / `createNotificationService` / `createDialogService` / `createLoadingBarService`，句柄与 Vue 侧同名同形，命令在任意模块作用域可调（路由守卫、请求拦截器、store）。在此之前这一整层只有 Vue 有，同一套设计系统的两个适配器在服务层能力不对等。

形态跟着 WC 的身份走，与 Vue 侧有两点不同：一是没有 `config` 入参也没有 `setConfig`——全局配置沿 DOM 祖先链解析，服务的宿主容器就挂在文档里，`setXhConfig` 与外层 `<xh-config>` 直接说了算；二是模板生成的是真实的自定义元素与角色节点（`<xh-toast>` / `<xh-notification>` / `<xh-dialog>` / `<xh-loading-bar>` 加 `data-xh-part` 子节点），作者拿到的仍是一棵可查、可选中的 DOM。用到的元素在服务建起来时按需注册，不必先 import `/define`。

**队列合一**：`toast` 服务里那个裸数组撤掉，改跑 `notification` 那台队列机器。此前同一个概念有两套实现、两套上限策略，且只有通知那套能被 WC 复用。合完之后上限、挤条、合并计数全库一份，两个适配器共享。轻提示的公开面一个没动：`createToastService()` 的入参、`ToastService` 的方法、渲染出来的 DOM 与 `data-*` 全部照旧。

同批补上队列层四样能力，两个适配器、两条服务都有：

- **行内动作**——`ToastRecord` / `NotificationRecord` 加 `actionLabel`（纯文案，队列记录仍只放可搬运的数据），回调按 id 存在服务侧一张表里，默认模板据此渲染 `action-trigger`。解剖、皮肤与 `action` 事件本就齐全，缺的只是命令式入口够不着它。
- **`pauseAll` / `resumeAll`**——机器侧的多源暂停计数早就有，缺的是服务把它抬出来。`ToastPauseSource` 加第五路 `'service'`，`toast` 机器加 `paused` prop（起手为真的那条直接落在暂停态），Vue 的 `XhToastRoot` / `XhNotificationItem` 与 WC 的 `<xh-toast>` / `<xh-notification-item>` 一并露出。
- **`promise()`**——先弹一条 loading，Promise 落定后就地改写成 success / error，结果与拒绝都原样交回调用方。
- **去重与优先级**——队列加 `dedupe` prop（默认 `'id'`，现行为；给 `'content'` 则语气与两层文本全同的合并成一条并累加 `count`，标题后追加计数），记录加 `priority`。挤条规则从「挤掉最旧的」改成「先挤低优先级、同级里挤最旧」，优先级不给则按语气派生（error=2 / warning=1 / 其余=0）——一条报错不再被随后的五条提示顶掉。
