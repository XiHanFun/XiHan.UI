# 命令式服务

有些东西写成模板反而绕：删除前问一句、保存完提示一下——这些没有"挂在哪"的问题，就该一次调用弹出来。库提供两个服务工厂：对话框与轻提示。

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

服务档的默认落位是 `top`，每个位置默认最多同时留 5 条，超出的排队。单条可以用 `options.placement` 覆盖。

## 什么时候不要用服务

- **确认可以撤销的操作**：直接做，然后发一条带"撤销"按钮的轻提示。事前确认对用户是一道额外的关，撤销才是真的兜底。
- **提示内容较长或需要用户处理**：轻提示会自己消失，用[警告提示](../components/alert)让它常驻。
- **对话框里要放表单**：用组件形态的[对话框](../components/dialog)，服务档只出标题、正文与按钮行。

## 一个应用建几个

各建一个，挂在应用启动处，全局共用。每个页面各建一个会挂出多个宿主容器，几摞提示互相盖。

服务不走 provide/inject，所以在组件外（路由守卫、拦截器、store）也能调——这正是命令式的意义。但也因此**它拿不到 [全局配置](./config) 注入的文案**：服务的文案在 `createDialogService` / `createToastService` 的入参里单独给。

## 与别的库的对应关系

| 别的库 | 这里 |
| --- | --- |
| Element Plus `ElMessageBox.confirm` | `dialog.confirm` |
| Element Plus `ElMessage` / `ElNotification` | `toast.*` |
| Ant Design `Modal.confirm` / `message` / `notification` | `dialog.confirm` / `toast.*` |
| Naive UI `useDialog` / `useMessage` | `createDialogService` / `createToastService` |
| Semi Design `Modal.confirm` / `Toast` | `dialog.confirm` / `toast.*` |

**没有"通知"这一档单独的 API。** 带标题、描述与操作区的通知就是[轻提示](../components/toast)本身——它有 `title` / `description` / `action-trigger` 四个部件，落位由[轻提示容器](../components/toaster)的 `placement` 决定。换个落位与皮肤就是通知，不需要第二套。
