# 命令式服务

部分反馈不适合写成模板：删除前确认、保存后提示，这类反馈没有挂载位置的问题，适合一次调用弹出。库提供四个服务工厂：对话框、轻提示、通知与顶部进度条。

四者都自建宿主容器、自行管理挂载与卸载，用完后需调用 `dispose()`。

工厂返回即可接收命令，与宿主何时渲染无关：在组件的挂载回调（Vue 的 `onMounted`、React 的 `useEffect`、自定义元素的 `connectedCallback`）里懒建服务并紧接着发第一条命令，与在模块作用域调用一样成立，不需要等一帧。

## 对话框服务

```ts
import { createDialogService } from "@xihan-ui/vue";

const dialog = createDialogService({ okText: "确定", cancelText: "取消" });

const ok = await dialog.confirm({
  title: "删除这条记录？",
  content: "删除后不可恢复。",
  tone: "danger",
  okText: "删除",
});
if (ok) {
  // 用户已确认，且 onOk（如提供）已执行完成
}

dialog.dispose();
```

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `confirm(options)` | `Promise<boolean>` | 确认走完 `onOk` 后 resolve `true`；取消或 Escape resolve `false` |
| `info` / `success` / `warning` / `error` | `Promise<void>` | 单按钮告知框，没有取消按钮，徽记由预设档决定 |
| `prompt(options)` | `Promise<T \| null>` | 取值型弹窗：确认后返回一份值，取消 resolve `null` |
| `setConfig(next)` | — | 更换全局配置源 |
| `dispose()` | — | 卸载宿主应用并移除容器 |

`ConfirmOptions` 的字段：`title`（必填）、`content`、`tone`（确认按钮语气，危险操作传 `danger`）、`badge`（标题旁的类型徽记）、`okText` / `cancelText`、`onOk`。

### 异步确认

`onOk` 返回 Promise 时，确认按钮自动进入 pending 并阻止关闭；失败时保持打开，用户可以重试或取消。这是它相对于自行编写 `<XhDialog>` 的主要便利。

```ts
await dialog.confirm({
  title: "发布这个版本？",
  onOk: () => api.publish(id), // 拒绝时对话框不关闭，用户可以再次确认
});
```

### 正文内容

`content` 接受字符串与渲染函数。字符串经 `XhDialogDescription` 渲染（读屏的 `aria-describedby` 指向它），函数则整块渲染在正文位：

```ts
await dialog.confirm({
  title: "导入这份数据？",
  content: () => h(XhAlertRoot, { tone: "warning" }, () => "已存在的记录会被覆盖"),
});
```

不接受裸 VNode：服务宿主常驻，忙态切换时整棵重渲染，同一个 VNode 实例被复用时的行为未定义。

### 取值型弹窗

`prompt` 负责在弹窗中填写内容并把值带回。每次打开创建一份初值，`body` 与 `onOk` 拿到的是同一份可写代理：

```ts
const next = await dialog.prompt({
  title: "改邮箱",
  initialValue: { email: "", password: "" },
  body: value => [
    h(XhTextFieldRoot, { "value": value.email, "onUpdate:value": (v: string) => (value.email = v) }, () => h(XhTextFieldInput)),
    h(XhTextFieldRoot, { "type": "password", "value": value.password, "onUpdate:value": (v: string) => (value.password = v) }, () => h(XhTextFieldInput)),
  ],
  initialFocus: "[data-scope=text-field][data-part=input]",
  onOk: value => value.email.includes("@"), // 返回 false 表示校验未通过，弹窗不关闭
});
// next 是 { email, password } 的普通对象快照；取消 / Escape 得到 null
```

`prompt` 的 `onOk` 返回 `false` 表示不放行。`confirm` 的 `onOk` 不适用这条：它的返回值不参与判定，只有拒绝才阻止关闭。

### 同一时刻只有一个

后续调用排队顺次弹出，避免多层模态叠加。当前项的内容与遮罩全部完成有限退场动画后，队列才放出下一项；无动画或减弱动效时不额外等待固定时间。

## 轻提示服务

```ts
import { createToastService } from "@xihan-ui/vue";

const toast = createToastService({ placement: "top", max: 5 });

toast.success("已保存");
toast.danger("保存失败，请重试", { duration: 8000 });
```

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `create(options)` | `string`（id） | 入队；同 id 已存在则就地改写 |
| `update(id, options)` | — | 改写正在显示的条目 |
| `dismiss(id)` / `dismissAll()` | — | 手动关闭 |
| `info` / `success` / `warning` / `danger` | `string`（id） | 语气快捷方法，第一个参数是正文 |
| `loading(message, options)` | `string`（id） | 以 `loading` 态弹出一条并返回 id，之后用 `update` 收尾 |
| `promise(input, options)` | `Promise<T>` | 先弹出 loading，落定后就地改写为成功 / 失败 |
| `pauseAll()` / `resumeAll()` | — | 整组暂停计时、再恢复 |
| `setConfig(next)` | — | 更换全局配置源（切换语言用） |
| `dispose()` | — | 卸载宿主应用并移除容器 |

### 在途 → 完成

`loading` 与 `update` 是一条完整的链，不连发两条：

```ts
const id = toast.loading("正在上传…");
try {
  await upload(file);
  toast.update(id, { loading: false, tone: "success", title: "上传完成" });
}
catch {
  toast.update(id, { loading: false, tone: "danger", title: "上传失败" });
}
```

同一条链有封装写法，结果与拒绝都原样返回：

```ts
const url = await toast.promise(upload(file), {
  loading: "正在上传…",
  success: result => `上传完成：${result.name}`,
  error: reason => `上传失败：${(reason as Error).message}`,
});
```

### 行内动作

提供 `actionLabel` 才渲染动作按钮，按下的行为写在 `onAction` 中：

```ts
toast.info("已删除 3 条记录", { duration: 8000, actionLabel: "撤销", onAction: () => restore() });
```

文案进入队列记录，回调保存在服务中：记录只存放可整份替换、序列化、比对的纯数据。

### 重复与优先级

同一句错误连续发出多次时，`dedupe: 'content'` 把它们合并为一条并在标题后追加计数：

```ts
const toast = createToastService({ dedupe: "content" });
toast.danger("同步失败");
toast.danger("同步失败"); // 界面上是「同步失败 ×2」
```

超出 `max` 时先移除低优先级的条目，同级中移除最旧的。未指定优先级时按语气派生（`danger` 最高、
`warning` 次之、其余持平），也可以逐条写 `priority`：一条报错不应被随后的多条提示挤出。

服务档的默认落位是 `top`，最多同时留 5 条，超出时移除最旧的。落位是整个服务的口径：
一次操作的反馈不应逐条分散到不同位置，在 `createToastService({ placement })` 中一次确定。

默认不显示关闭按钮。一条轻提示是一枚状态字形加一句话的小条，到时自行消失；
多一个关闭按钮就多一次是否点击的判断。确需保留出口（如 `duration: 0` 的常驻提示）时显式开启：

```ts
toast.danger("导出失败，请重试", { duration: 0, closable: true });
```

## 通知服务

```ts
import { createNotificationService } from "@xihan-ui/vue";

const notify = createNotificationService({ placement: "bottom-end", max: 5 });

notify.info("有新的审批", { description: "张三提交了一份请假单" });
notify.danger("同步失败", { description: "网络中断，稍后自动重试", duration: 0 });
```

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `create(options)` | `string`（id） | 入队；同 id 已存在则就地改写 |
| `update(id, options)` | — | 改写正在显示的条目 |
| `dismiss(id)` / `dismissAll()` | — | 手动关闭 |
| `info` / `success` / `warning` / `danger` | `string`（id） | 语气快捷方法，第一个参数是标题，正文写在 `options.description` |
| `pauseAll()` / `resumeAll()` | — | 当前卡片整组暂停计时、再恢复 |
| `setConfig(next)` | — | 更换全局配置源（切换语言用） |
| `dispose()` | — | 卸载宿主应用并移除容器 |

行内动作、`dedupe` 与 `priority` 与轻提示同形：两者运行同一台队列状态机，上限、移除与
合并计数只有一份实现。

与轻提示的两处不同：条目有标题与正文两层，且单条可以用 `options.placement` 覆盖落位：
消息各有轻重，逐条决定位置是合理的。`duration: 0` 即常驻不消失，由用户手动关闭。

队列需要位于页面结构中（通知中心一栏自行排版）时改用组件形态的
[通知](../components/notification)，两者不共享队列。

## 顶部进度条服务

路由守卫与请求拦截器都在组件树之外，需要命令式入口：

```ts
import { createLoadingBarService } from "@xihan-ui/vue";

const bar = createLoadingBarService();

router.beforeEach(() => { bar.start(); });
router.afterEach(() => { bar.finish(); });

http.interceptors.request.use((cfg) => { bar.start(); return cfg; });
http.interceptors.response.use(
  (res) => { bar.finish(); return res; },
  (err) => { bar.error(); return Promise.reject(err); },
);
```

| 方法 | 说明 |
| --- | --- |
| `start()` | 在途计数 +1；从 0 起跳即开始爬升 |
| `finish()` | 在途计数 −1（下限为 0，多次调用不会变负）；归零才收起 |
| `error()` | 强制归零并以 `errorTone`（默认 `danger`）收起 |
| `finishAll()` | 无论剩余多少在途请求一律收起 |
| `set(value)` | 切换为确定进度；再次 `start()` 回到不确定 |
| `setConfig(next)` | 更换全局配置源 |
| `dispose()` | 卸载宿主应用并移除容器 |

在途计数是这层封装的要点。写成布尔开关时，三个并发请求中第一个返回就会收起进度条，其余两个仍在进行：进度条比请求先结束。

## 切换语言（Vue 侧）

Vue 的四个服务都自建宿主应用，无法接入组件树中的 `provideXhConfig`，因此配置从 `config` 选项提供。传入 ref 或 getter，不传一次性的对象：传对象时文案只在创建服务时求值一次，之后应用切换语言，服务子树中的按钮与读屏名不随之更新；队列中排队的对话框也会跨过这次切换。

```ts
const dialog = createDialogService({
  config: () => ({ locale: app.locale.value, translations: myOverrides[app.locale.value] }),
  okText: () => t("common.ok"),
  cancelText: () => t("common.cancel"),
});

// 没有响应式源时也可以命令式推送
dialog.setConfig({ locale: "en-US" });
```

取值优先级：调用点 > 服务选项 > `config.translations.<组件>` > 组件内建默认。

## Web Components 侧

同样四个工厂，从 `@xihan-ui/web-components/services` 取，句柄的方法与 Vue 侧同名同形：

```ts
import { createToastService } from "@xihan-ui/web-components/services";

const toast = createToastService({ placement: "top", max: 5 });
toast.success("已保存");
```

服务自行生成真实的自定义元素与角色节点（`<xh-toast>`、`<xh-notification>`、`<xh-dialog>`、
`<xh-loading-bar>`），得到的仍是一棵可查询、可选中的 DOM；用到的元素在服务创建时按需注册，
不必先 `import '@xihan-ui/web-components/define'`。

与 Vue 侧的两处不同都来自这一侧的身份：

- 没有 `config` 入参，也没有 `setConfig`。全局配置沿 DOM 祖先链解析，服务的宿主容器挂在
  文档中，语言、尺寸、浮层落点由 `setXhConfig` 与外层 `<xh-config>` 决定。
- 对话框的正文渲染函数接收节点：`content: (body) => { … }` 拿到正文角色节点后自行写入，
  没有 `prompt`：取值型弹窗需要放表单时直接写 `<xh-dialog>`。

## 不适合使用服务的场景

- 确认可撤销的操作：直接执行，然后发一条带撤销按钮的轻提示。事前确认对用户是额外的一道关卡，撤销才是有效的兜底。
- 提示内容较长或需要用户处理：轻提示会自行消失，用[警告提示](../components/alert)常驻，或用[通知](../components/notification)分标题与正文两层。
- 对话框中需要放表单：用组件形态的[对话框](../components/dialog)，服务档只提供标题、正文与按钮行。

## 一个应用创建几个

各创建一个，挂在应用启动处，全局共用。每个页面各创建一个会产生多个宿主容器，多组提示互相遮盖。

服务不经 provide/inject，因此在组件外（路由守卫、拦截器、store）也能调用，这正是命令式的意义。但也因此它无法获取 [全局配置](./config) 注入的文案：服务的文案在 `createDialogService` / `createToastService` / `createNotificationService` 的入参中单独提供。

## 与其他库的对应关系

| 其他库 | 本库 |
| --- | --- |
| Element Plus `ElMessageBox.confirm` | `dialog.confirm` |
| Element Plus `ElMessage` / `ElNotification` | `toast.*` / [通知](../components/notification) |
| Ant Design `Modal.confirm` / `message` / `notification` | `dialog.confirm` / `toast.*` / [通知](../components/notification) |
| Naive UI `useDialog` / `useMessage` | `createDialogService` / `createToastService` |
| Semi Design `Modal.confirm` / `Toast` | `dialog.confirm` / `toast.*` |

轻提示与通知按发起方分工。轻提示是用户刚才操作的结果，一句话、自行消失；[通知](../components/notification)是系统或他人主动推送的消息，有标题与正文两层、可以常驻。两者都有服务档（`createToastService` / `createNotificationService`），队列各自独立；通知另有组件形态 `XhNotificationRoot`，队列需要位于页面结构中（通知中心一栏自行排版）时使用。轻提示没有容器组件：反馈落位是整个服务的口径。
