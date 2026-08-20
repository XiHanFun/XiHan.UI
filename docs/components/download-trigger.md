# 下载触发器 <Badge type="info" text="download-trigger" />

把一段数据交给浏览器下载，并把取数这段过程如实报出来。

## 何时使用

- 内容已经在前端手里：当前表格导出成 CSV、编辑器里的草稿存成文件、生成好的配置文本。
- 数据要点了才算：交一个取数函数，点下去才发请求或才开始序列化。

## 何时不用

- 文件在服务端且有稳定地址：直接写一个 `<a href download>` 指过去，让服务端决定文件名与类型，别在前端造一份副本。
- 内容只是要带走一小段文字：用[剪贴板](./clipboard)，用户不必再去下载目录里翻。
- 方向反过来是把文件交进来：用[文件上传](./file-upload)。

## 特性

- 数据可以是文本、Blob，或点了才调用的取数函数（可返回 Promise）。
- 取数在途时状态是 `preparing`，此时再点不会重复发起；无论成败都回到 `idle`，界面上不留"下载中"的假象。
- 失败会说出来：取数抛出、拒绝，或环境造不出下载，都走 `onDownloadError` 并带上原始原因。
- 文件名与类型在发起那一刻定死，取数途中宿主改了 prop 也不影响这一次写出的那份。
- Vue 侧默认插槽拿得到 `{ status, preparing, disabled, fileName, download }`，可据 `preparing` 换掉按钮上的文字；Web Components 侧按钮内容由作者自己写，要跟着状态换文字得自己盯 `data-state`。

## 示例

### 基础用法

内容已经在手里就直接给字符串，点一下即交给浏览器；文件名连同扩展名都由 file-name 说了算

<XhDemo src="download-trigger/01-basic" />

### 按需取数

data 给函数就是点了才算：它可以返回 Promise，这段时间状态是 preparing，再点也不会重复取一遍

<XhDemo src="download-trigger/02-lazy" />

### Blob 内容

结构化与二进制内容交 Blob，它自带的类型就是写出去的类型；显式写了 mime-type 则以 mime-type 为准

<XhDemo src="download-trigger/03-blob" />

### 失败要说出来

取数抛出或拒绝都会退回 idle 并派 download-error，按钮不会一直停在"下载中"

<XhDemo src="download-trigger/04-error" />

### 禁用

禁用的触发器不可聚焦也点不动，连取数函数都不会被调用

<XhDemo src="download-trigger/05-disabled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-download-trigger>` |
| Vue 组件 | `XhDownloadTrigger` |
| 组合式函数 | `useDownloadTrigger` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/download-trigger.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="download-trigger"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `data` | `DownloadTriggerData` |  | 要下载的内容：文本、Blob，或点下去才调用的取数函数（可返回 Promise）。 |
| `fileName` | `string` |  | 写出的文件名；缺省或空串退回内建默认名。 |
| `mimeType` | `string` |  | 内容类型；给了它就以它为准，连 Blob 自带的类型也照它重包一次。缺省时文本按纯文本处理。 |
| `disabled` | `boolean` |  | 禁用：按钮不可聚焦、点不动。 |
| `onDownloadComplete` | `(details: DownloadTriggerCompleteDetails) => void` |  | 数据已交给浏览器时通知一次。到这里只说明下载已经发起，浏览器把文件写没写到盘上组件看不见。 |
| `onDownloadError` | `(details: DownloadTriggerErrorDetails) => void` |  | 取数失败或造不出下载时通知；此刻状态已经回到 idle。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `download-complete` | `DownloadTriggerCompleteDetails` | 数据已交给浏览器；detail 为 `{ fileName }` |
| `download-error` | `DownloadTriggerErrorDetails` | 取数失败或造不出下载；detail 为 `{ error, fileName }`，此刻状态已经回到 idle |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDownloadTrigger` | `default` | `DownloadTriggerSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`DOWNLOAD.TRIGGER` · `DOWNLOAD.SUCCESS` · `DOWNLOAD.ERROR`

**判据**：`isDisabled`

## connect API

`useDownloadTrigger` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `DownloadTriggerStatus` |  |
| `preparing` | `boolean` | 数据还在取。按钮不因此变禁用，只是这段时间里再点不会重复发起。 |
| `disabled` | `boolean` |  |
| `fileName` | `string` | 这一次会写出的文件名（prop 缺省时是内建默认名）。 |
| `download` | `() => void` | 走一次下载意图，与点按钮同一条路：禁用时不动，取数在途时不重复发起。 |
| `getRootProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in root, 未禁用 | 发起一次下载；取数在途时这两个键同样不会重复发起 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| 'false' |

- 触发器是原生 `<button type="button">`，Enter 与 Space 的激活由平台负责。
- 取数在途时按钮不变成禁用，只挂 `aria-busy="true"`：禁用会把焦点从按钮上弹走，键盘用户等回来时不知道自己在哪。
- 按钮上的文字要说清楚下的是什么（"导出 CSV"而不是"下载"），读屏一次只念一个按钮，光有图标听不出区别。

## 样式

默认皮肤 `@xihan-ui/styles/download-trigger.css` 按部件选择：`[data-scope="download-trigger"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-state` | state.get() |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-download-trigger-bg` · `--xh-download-trigger-bg-active` · `--xh-download-trigger-bg-disabled` · `--xh-download-trigger-bg-hover` · `--xh-download-trigger-border` · `--xh-download-trigger-border-disabled` · `--xh-download-trigger-border-hover` · `--xh-download-trigger-fg` · `--xh-download-trigger-font-size` · `--xh-download-trigger-font-weight` · `--xh-download-trigger-gap` · `--xh-download-trigger-h` · `--xh-download-trigger-px` · `--xh-download-trigger-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[按钮](./button)是两件事：按钮带形态/语气/尺寸三轴，下载触发器只管行为，自带的是一份中性按钮外观（高度、描边、底色、字号都走令牌）。要品牌语气就把按钮的类名写到触发器上，或改 `--xh-download-trigger-*` 这一族槽位。
- 与[进度条](./progress)搭配：取数要跑很久时，自己在旁边放一条进度，本组件只报"在途 / 结束"两档。

## 最佳实践

- 大文件走服务端直链，别在前端拼 Blob：整份内容会先住进内存，几十兆的导出足以让标签页卡住。
- 取数函数里自己兜住失败并给出可见提示，`onDownloadError` 只通知你，用户看到的还是那颗没反应的按钮。
- 文件名带扩展名。浏览器不会替你猜，`report` 与 `report.csv` 打开的方式完全不同。
- 换外观改 `--xh-download-trigger-*` 槽位，别只覆盖前景色：禁用态的底色也在这一族里，只改一半会把禁用前后压成同一个样子。

## 反模式

- 认为回调触发就等于文件已经存好：组件只能知道下载已经发起，用户取消保存、磁盘写失败都在浏览器那一侧。
- 页面一加载就把整份数据备在内存里等着点：改成取数函数，点了再算。
- 用它下载跨域地址上的文件：浏览器发起的下载受同源与下载策略约束，跨域内容取不回来也就造不出 Blob。
