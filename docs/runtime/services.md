# 命令式服务

有些东西写成模板反而绕：删除前问一句、保存完提示一下——这些没有"挂在哪"的问题，就该一次调用弹出来。库提供三个服务工厂：对话框、轻提示与顶部进度条。

两者都自己建宿主容器、自己管挂载与卸载，**用完记得 `dispose()`**。

## 对话框服务

```ts
import { createDialogService } from '@xihan-ui/vue'

const dialog = createDialogService({ okText: '确定', cancelText: '取消' })

const ok = await dialog.confirm({
  title: '删除这条记录？',
  content: '删除后不可恢复。',
  tone: 'danger',
  okText: '删除',
})
if (ok) {
  // 用户按了确定，且 onOk（如果给了）已经跑完
}

dialog.dispose()
```

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `confirm(options)` | `Promise<boolean>` | 确认走完 `onOk` 后 resolve `true`；取消或 Escape resolve `false` |
| `info` / `success` / `warning` / `error` | `Promise<void>` | 单按钮告知框，没有取消钮，徽记由预设档自己定 |
| `prompt(options)` | `Promise<T | null>` | 取值型弹窗：确认后带回一份值，取消 resolve `null` |
| `setConfig(next)` | — | 换一份全局配置源 |
| `dispose()` | — | 卸载宿主应用并移除容器 |

`ConfirmOptions` 的字段：`title`（必填）、`content`、`tone`（确认钮语气，危险操作传 `danger`）、`badge`（标题旁的类型徽记）、`okText` / `cancelText`、`onOk`。

### 异步确认

`onOk` 返回 Promise 时，确认钮自动进入 pending 并**拦住关闭**；失败保持打开，用户可以重试或取消。这是它比自己写一个 `<XhDialog>` 省事的主要一点。

```ts
await dialog.confirm({
  title: '发布这个版本？',
  onOk: () => api.publish(id),   // 拒绝时对话框不关，用户能再按一次
})
```

### 正文不止能放一句话

`content` 收串也收渲染函数。给串走 `XhDialogDescription`（读屏的 `aria-describedby` 接在它上面），给函数则整块摊在正文位：

```ts
await dialog.confirm({
  title: '导入这份数据？',
  content: () => h(XhAlertRoot, { tone: 'warning' }, () => '已存在的记录会被覆盖'),
})
```

不收裸 VNode：服务宿主是常驻的，忙态一翻就整棵重渲，同一个 VNode 实例被复用时的行为未定义。

### 要填东西的弹窗

`prompt` 管的是「弹窗里填点什么，填完把值带回来」。每次打开建一份初值，`body` 与 `onOk` 拿的是同一份可写代理：

```ts
const next = await dialog.prompt({
  title: '改邮箱',
  initialValue: { email: '', password: '' },
  body: value => [
    h(XhTextFieldRoot, { value: value.email, 'onUpdate:value': (v: string) => (value.email = v) }, () => h(XhTextFieldInput)),
    h(XhTextFieldRoot, { type: 'password', value: value.password, 'onUpdate:value': (v: string) => (value.password = v) }, () => h(XhTextFieldInput)),
  ],
  initialFocus: '[data-scope=text-field][data-part=input]',
  onOk: value => value.email.includes('@'),   // 返回 false 表示校验没过，弹窗不关
})
// next 是 { email, password } 的普通对象快照；取消 / Escape 得到 null
```

`prompt` 的 `onOk` 返回 `false` 表示不放行。`confirm` 的 `onOk` 不吃这条——它的返回值不参与判定，只有拒绝才拦住关闭。
### 同一时刻只有一个

后来的排队顺次弹出，避开多层模态叠加。关到再开之间留了退场窗口，动效走完才放下一个。

## 轻提示服务

```ts
import { createToastService } from '@xihan-ui/vue'

const toast = createToastService({ placement: 'top', max: 5 })

toast.success('已保存')
toast.error('保存失败，请重试', { duration: 8000 })
```

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `create(options)` | `string`（id） | 入队；**同 id 已存在则就地改写** |
| `update(id, options)` | — | 改写已在显示的那一条 |
| `dismiss(id)` / `dismissAll()` | — | 手动收走 |
| `info` / `success` / `warning` / `error` | `string`（id） | 类型糖，第一参是正文 |
| `loading(message, options)` | `string`（id） | 返回 id，之后用 `update` 收尾 |
| `dispose()` | — | 卸载宿主应用并移除容器 |

### 在途 → 完成

`loading` 加 `update` 是一条完整的链，不要连发两条：

```ts
const id = toast.loading('正在上传…')
try {
  await upload(file)
  toast.update(id, { type: 'success', title: '上传完成' })
}
catch {
  toast.update(id, { type: 'error', title: '上传失败' })
}
```

服务档的默认落位是 `top`，最多同时留 5 条，超出的挤掉最旧的。落位是整个服务的口径——
一次操作的反馈不该逐条各去一处，写在 `createToastService({ placement })` 里一次定好。

**默认不出关闭按钮。** 一条轻提示是「一枚状态字形 + 一句话」的小条，到点自己走；
多一颗叉就多一个「要不要点」的判断。确实需要留出口（比如 `duration: 0` 的常驻提示）就显式开：

```ts
toast.error('导出失败，请重试', { duration: 0, closable: true })
```

## 通知服务

```ts
import { createNotificationService } from '@xihan-ui/vue'

const notify = createNotificationService({ placement: 'bottom-end', max: 5 })

notify.info('有新的审批', { description: '张三提交了一份请假单' })
notify.error('同步失败', { description: '网络中断，稍后自动重试', duration: 0 })
```

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `create(options)` | `string`（id） | 入队；**同 id 已存在则就地改写** |
| `update(id, options)` | — | 改写已在显示的那一条 |
| `dismiss(id)` / `dismissAll()` | — | 手动收走 |
| `info` / `success` / `warning` / `error` | `string`（id） | 类型糖，第一参是标题，正文写在 `options.description` |
| `dispose()` | — | 卸载宿主应用并移除容器 |

与轻提示的两处不同：条目有标题与正文两层，且**单条可以用 `options.placement` 覆盖落位**——
消息各有轻重，逐条决定去哪一格是说得通的。`duration: 0` 即常驻不消失，让用户自己收走。

队列要长在页面结构里（通知中心那一栏自己排版）时改用组件形态的
[通知](../components/notification)，两者不共享队列。

## 顶部进度条服务

路由守卫与请求拦截器都在组件树之外，要的正是命令式入口：

```ts
import { createLoadingBarService } from '@xihan-ui/vue'

const bar = createLoadingBarService()

router.beforeEach(() => { bar.start() })
router.afterEach(() => { bar.finish() })

http.interceptors.request.use((cfg) => { bar.start(); return cfg })
http.interceptors.response.use(
  (res) => { bar.finish(); return res },
  (err) => { bar.error(); return Promise.reject(err) },
)
```

| 方法 | 说明 |
| --- | --- |
| `start()` | 在途计数 +1；从 0 起跳即开始爬升 |
| `finish()` | 在途计数 −1（夹到 0，多调不会变负）；归零才收 |
| `error()` | 强制归零并以 `errorTone`（缺省 `danger`）收 |
| `finishAll()` | 不管还剩几笔在途一律收掉 |
| `set(value)` | 切成确定进度；再 `start()` 回到不确定 |
| `setConfig(next)` | 换一份全局配置源 |
| `dispose()` | 卸载宿主应用并移除容器 |

**在途计数是这层壳的要点**。写成布尔开关的话，三个并发请求里第一个回来就把条子收了，剩下两个还在跑——进度条比请求先结束。
## 切语言要跟得上

三个服务都自建宿主应用，接不到组件树里的 `provideXhConfig`，所以配置要从 `config` 选项给。**传 ref 或 getter**，不要传一次性的对象——传对象的话文案只在建服务那一刻求值一次，之后应用切了语言，服务子树里的按钮与读屏名不跟；队列里排着的对话框还会跨过这次切换。

```ts
const dialog = createDialogService({
  config: () => ({ locale: app.locale.value, translations: myOverrides[app.locale.value] }),
  okText: () => t('common.ok'),
  cancelText: () => t('common.cancel'),
})

// 没有响应式源时也可以命令式推
dialog.setConfig({ locale: 'en-US' })
```

取值优先级：**调用点 > 服务选项 > `config.translations.<组件>` > 组件内建默认**。
## 什么时候不要用服务

- **确认可以撤销的操作**：直接做，然后发一条带"撤销"按钮的轻提示。事前确认对用户是一道额外的关，撤销才是真的兜底。
- **提示内容较长或需要用户处理**：轻提示会自己消失，用[警告提示](../components/alert)让它常驻，或用[通知](../components/notification)分标题与正文两层。
- **对话框里要放表单**：用组件形态的[对话框](../components/dialog)，服务档只出标题、正文与按钮行。

## 一个应用建几个

各建一个，挂在应用启动处，全局共用。每个页面各建一个会挂出多个宿主容器，几摞提示互相盖。

服务不走 provide/inject，所以在组件外（路由守卫、拦截器、store）也能调——这正是命令式的意义。但也因此**它拿不到 [全局配置](./config) 注入的文案**：服务的文案在 `createDialogService` / `createToastService` / `createNotificationService` 的入参里单独给。

## 与别的库的对应关系

| 别的库 | 这里 |
| --- | --- |
| Element Plus `ElMessageBox.confirm` | `dialog.confirm` |
| Element Plus `ElMessage` / `ElNotification` | `toast.*` / [通知](../components/notification) |
| Ant Design `Modal.confirm` / `message` / `notification` | `dialog.confirm` / `toast.*` / [通知](../components/notification) |
| Naive UI `useDialog` / `useMessage` | `createDialogService` / `createToastService` |
| Semi Design `Modal.confirm` / `Toast` | `dialog.confirm` / `toast.*` |

**轻提示与通知的分工是「谁发起的」。** 轻提示是用户刚才那次操作的结果，一句话、自己消失；[通知](../components/notification)是系统或他人主动推来的消息，有标题与正文两层、可以常驻。两者都有服务档（`createToastService` / `createNotificationService`），队列各归各的；通知另有组件形态 `XhNotificationRoot`，队列要长在页面结构里（通知中心那一栏自己排版）时用它。轻提示没有容器组件——反馈落在哪儿是整个服务的口径。
