# FileUpload 文件上传

选择文件、拖放文件，并把已选与已传的文件列出来。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/file-upload" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/file-upload.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/file-upload" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/file-upload" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/file-upload.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

投放区自己就是一个大按钮，隐藏输入是必备部件，缺了它选不了文件

<XhDemo src="file-upload/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="file-upload"`：`root` · `label` · `dropzone` · `trigger` · **`hidden-input`** · `list` · `item` · `item-name` · `item-size-text` · `item-preview` · `item-progress` · `item-delete-trigger` · `clear-trigger`

## 示例

### 限制与拒收

accept / maxFiles / maxFileSize 越界的当场被拒，file-reject 逐个报出理由

<XhDemo src="file-upload/02-limits" />

### 受控

传了 files 就由宿主说了算，组件自己不再落值，只发 files-change 报告意图

<XhDemo src="file-upload/03-controlled" />

### 禁用

disabled 把投放区、触发器与隐藏输入一并关停，拖拽进来也不再收

<XhDemo src="file-upload/04-disabled" />

### 预置列表

defaultFiles 给出挂载时就在的那几份，之后列表照旧由组件自己保管，删除与清空都照常

<XhDemo src="file-upload/05-default-files" />

### 选整个目录

directory 让隐藏输入改收目录，选中目录下的文件一次性全进来，数量上限要跟着放开

<XhDemo src="file-upload/06-directory" />

### 缩略图墙

item-preview 是个空方框，作者往里塞什么都行；塞进去的图会被裁成方格，一行摆几张由外层网格定

<XhDemo src="file-upload/07-image-wall" />

### 宿主自定的准入

组件只管 accept 与大小数量这几条通用规则，别的规矩由宿主在受控列表里再筛一道：这里同名文件只留最先来的那份

<XhDemo src="file-upload/08-custom-rule" />

### 上传生命周期

给一个 upload 实现组件就是上传器：收下即开传（auto-upload 可关成手动），进度、成败与返回地址都在每条的传输快照里，失败一键重试

<XhDemo src="file-upload/09-manual-upload" />

### 列表项上的下载

条目里放什么由作者定：一条普通的 a[download] 就是下载口；想自己接管就换成按钮，在处理器里怎么取都行

<XhDemo src="file-upload/10-download" />

### 服务器附件回显

remote-files 装编辑表单里已存在的附件：与本地文件同列渲染（allFiles 远程在前）、占 max-files 名额，删除走 remote-files-change 由宿主落库

<XhDemo src="file-upload/11-remote-files" />

## 设计指引

### 何时使用

- 任何需要用户提交文件的地方。
- 需要预览、限制类型与大小、或选整个目录。

### 何时不用

- 只是展示已有附件、不允许新增：用[列表](./list)。

### 特性

- `maxFiles` / `maxFileSize` / `minFileSize` 越界的当场被拒，`onFileReject` 逐个报出理由。
- `autoUpload` 决定选完就传还是等提交。
- `remoteFiles` 用来回显服务器上已有的附件，与本次新选的并列在同一个列表里。
- 上传生命周期（完成、失败）各有回调；宿主还可以插入自定的准入判断。

### 组合

- 外面套[表单字段](./field)；缩略图墙用[图片](./image)与[图片预览](./image-viewer)。

### 最佳实践

- 在界面上写清楚允许的类型与大小上限，别等用户选完才拒。
- 拒收要说明是哪个文件、为什么。

### 反模式

- 只拦前端不拦后端。
- 上传中不给进度也不能取消。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-file-upload>` |
| Vue 组件 | `XhFileUploadClearTrigger` `XhFileUploadDropzone` `XhFileUploadHiddenInput` `XhFileUploadItem` `XhFileUploadItemDeleteTrigger` `XhFileUploadItemName` `XhFileUploadItemPreview` `XhFileUploadItemProgress` `XhFileUploadItemSizeText` `XhFileUploadLabel` `XhFileUploadList` `XhFileUploadRoot` `XhFileUploadTrigger` |
| 组合式函数 | `useFileUpload` |
| 状态机 | `fileUploadMachine` |
| 皮肤 | `@xihan-ui/styles/file-upload.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `accept` | `string \| string[]` |  | 允许的类型，写法与原生 input 的 accept 一致： 'image/*' 这类通配、'.png' 这类扩展名、'application/pdf' 这类精确 MIME 都收， 逗号分隔的整串或数组两种形态都行（属性只表达得了整串，数组要走 property）。 |
| `maxFiles` | `number` |  | 最多留几个文件，默认 1。给 Infinity 即不限。 |
| `maxFileSize` | `number` |  | 单个文件的字节上限，默认不限。 |
| `minFileSize` | `number` |  | 单个文件的字节下限，默认 0（挡住 0 字节的空文件可以设成 1）。 |
| `disabled` | `boolean` |  |  |
| `invalid` | `boolean` |  | 校验失败标注；只作用于样式与 data-invalid，不阻断收文件。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才参与提交。 |
| `files` | `File[]` |  | 已选文件。给定即受控：cell 直读 prop，写只发 onFilesChange 不落内部值。 |
| `defaultFiles` | `File[]` |  |  |
| `allowDrop` | `boolean` |  | 是否接受拖拽投放，默认 true。关掉后投放区不再拦默认行为，也不再出 data-dragging。 |
| `directory` | `boolean` |  | 选目录而不是选文件（隐藏输入带 webkitdirectory）。 |
| `capture` | `'user' \| 'environment'` |  | 移动端直接调用摄像头/麦克风采集。 |
| `remoteFiles` | `FileUploadRemoteFile[]` |  | 服务器已有附件（编辑表单回显）。给定即受控：cell 直读 prop，删改只发 onRemoteFilesChange 不落内部值。条目计入 maxFiles 总量，与本地文件一起渲染。 |
| `defaultRemoteFiles` | `FileUploadRemoteFile[]` |  |  |
| `upload` | `(request: FileUploadRequest) => Promise<FileUploadResult \| undefined \| void> \| FileUploadResult \| undefined \| void` |  | 每个文件的传输实现。给了它组件才是上传器：收下的文件按 autoUpload 自动开传， 进度、成败与返回地址都记进该文件的传输快照。不给则维持纯选择器。 |
| `autoUpload` | `boolean` |  | 收下即自动开传，默认 true；关掉后由 api.startUpload 逐个开。 |
| `translations` | `Partial<FileUploadTranslations>` |  |  |
| `onFilesChange` | `(details: FileUploadFilesChangeDetails) => void` |  | 列表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onFileAccept` | `(details: FileUploadFileAcceptDetails) => void` |  | 本次收下了哪些。受控与否都发——宿主要据此发起上传。 |
| `onFileReject` | `(details: FileUploadFileRejectDetails) => void` |  | 本次拒了哪些、各自为什么。 |
| `onRemoteFilesChange` | `(details: FileUploadRemoteFilesChangeDetails) => void` |  | 远程附件列表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onUploadComplete` | `(details: FileUploadCompleteDetails) => void` |  | 单个文件传完（upload 的 Promise 兑现）。 |
| `onUploadError` | `(details: FileUploadErrorDetails) => void` |  | 单个文件传败（upload 的 Promise 拒绝）；中止不算失败不发。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `files-change` | `FileUploadFilesChangeDetails` | 列表变化；detail 为 `{ files: File[] }` |
| `remote-files-change` | `FileUploadRemoteFilesChangeDetails` | 远程附件列表变化；detail 为 `{ files: FileUploadRemoteFile[] }` |
| `upload-complete` | `FileUploadCompleteDetails` | 单个文件传完；detail 为 `{ file, url? }` |
| `upload-error` | `FileUploadErrorDetails` | 单个文件传败；detail 为 `{ file, error }` |
| `file-accept` | `FileUploadFileAcceptDetails` | 本次收下了哪些；detail 为 `{ files: File[] }` |
| `file-reject` | `FileUploadFileRejectDetails` | 本次拒了哪些、各自为什么；detail 为 `{ files: { file, reasons }[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFileUploadRoot` | `default` | `FileUploadRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | uploadOf(file)?.status |
| `item-progress` | uploadOf(file)?.status |

以下名称仅用于内部状态机。

**状态**：`idle` · `dragging`

**事件**：`FILES.SET` · `FILES.ADD` · `FILE.DELETE` · `FILES.CLEAR` · `PICKER.OPEN` · `DRAG.OVER` · `DRAG.LEAVE` · `DROP` · `UPLOAD.START` · `REMOTE.DELETE` · `FORM.RESET`

**判据**：`canChange` · `canDrop`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `acceptedFiles` | `File[]` |  |
| `remoteFiles` | `FileUploadRemoteFile[]` | 服务器已有附件。 |
| `allFiles` | `FileUploadFile[]` | 渲染顺序的完整列表：远程在前、本地在后。 |
| `dragging` | `boolean` | 有东西正悬在投放区上方。 |
| `disabled` | `boolean` |  |
| `invalid` | `boolean` |  |
| `empty` | `boolean` | 一个文件都没有。清空按钮据此打 data-empty，空列表据此显示占位。 |
| `maxFiles` | `number` | 生效的数量上限（已按缺省与非法值归一）。 |
| `getFileSizeText` | `(file: FileUploadFile) => string` | 字节数格式化成人读的形式，供作者渲染 item-size-text；远程附件没报大小时为空串。 |
| `uploadOf` | `(file: FileUploadFile) => FileUploadSnapshot \| null` | 该条目的传输快照：远程附件恒为 done；本地文件没配 upload 时为 null， 配了而尚未开传为 idle。 |
| `startUpload` | `(file: File) => void` | 手动开传（autoUpload 关着时）或失败后重试；不在列表里与传输中的调了没效果。 |
| `setFiles` | `(files: File[]) => void` |  |
| `addFiles` | `(files: File[]) => void` |  |
| `deleteFile` | `(file: FileUploadFile) => void` | 本地文件按引用剔除（传输中会中止），远程附件按 id 剔除。 |
| `clear` | `() => void` | 清空整份列表（本地与远程一起）。 |
| `openFilePicker` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getDropzoneProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getHiddenInputProps` | `() => T['input']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemNameProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemSizeTextProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemPreviewProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemProgressProps` | `(props: FileUploadItemProps) => T['element']` | 这一条的传输进度条，纯装饰；进度比例写在私有槽上供皮肤算宽度。 |
| `getItemDeleteTriggerProps` | `(props: FileUploadItemProps) => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside / inside the component | 投放区、选择按钮、每条的删除按钮与清空按钮各占一个 Tab 位；禁用时投放区退出 Tab 序列，几个原生按钮带 disabled 本就不可聚焦 |
| `Enter` / `Space` | focus on dropzone | 打开系统文件选择框。投放区是 div，浏览器不会替它把这两个键合成成一次点击，连接层自己接管（并拦下空格滚屏） |
| `Enter` / `Space` | focus on trigger | 打开系统文件选择框（原生 button 的默认激活） |
| `Enter` / `Space` | focus on item-delete-trigger | 把这一条从列表里删掉（原生 button 的默认激活） |
| `Enter` / `Space` | focus on clear-trigger | 清空整份列表（原生 button 的默认激活）；列表为空时按钮照常在位、可聚焦，激活是空操作 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `dropzone` | `aria-disabled` | 'true' \| 'false' |
| `dropzone` | `aria-label` | label.dropzone |
| `dropzone` | `aria-labelledby` | `label` 部件的 id |
| `dropzone` | `role` | 'button' |
| `list` | `role` | 'list' |
| `item` | `role` | 'listitem' |
| `item-preview` | `aria-hidden` | 'true' |
| `item-progress` | `aria-hidden` | 'true' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(file) |
| `clear-trigger` | `aria-label` | label.clearTrigger |

## 样式参考

### 皮肤

`@xihan-ui/styles/file-upload.css` 使用 `[data-scope="file-upload"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `dropzone` | `data-disabled` | ''（条件成立时才出现） |
| `dropzone` | `data-dragging` | ''（条件成立时才出现） |
| `dropzone` | `data-invalid` | ''（条件成立时才出现） |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-empty` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-file-name` | file.name |
| `item` | `data-file-size` | undefined \| String(file.size) \| String(file.size) |
| `item` | `data-remote` | ''（条件成立时才出现） |
| `item` | `data-state` | uploadOf(file)?.status |
| `item-name` | `data-disabled` | ''（条件成立时才出现） |
| `item-size-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-size-text` | `data-file-size` | undefined \| String(file.size) \| String(file.size) |
| `item-preview` | `data-disabled` | ''（条件成立时才出现） |
| `item-preview` | `data-file-type` | (isRemote(file) ? file.type ?? '' : file.type) \|\| 'un… |
| `item-progress` | `data-disabled` | ''（条件成立时才出现） |
| `item-progress` | `data-state` | uploadOf(file)?.status |
| `item-delete-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `clear-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `clear-trigger` | `data-empty` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-file-upload-clear-bg-active` | `clear-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | file-upload 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-clear-bg-hover` | `clear-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | file-upload 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-clear-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | file-upload 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-clear-fg-hover` | `clear-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | file-upload 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-clear-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-caption-size` | file-upload 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-file-upload-clear-gap` | `clear-trigger` | `gap` | `default` | `--xh-control-gap-sm` | file-upload 的 clear-trigger 部件 gap 覆盖槽。 |
| `--xh-file-upload-clear-h` | `clear-trigger` | `block-size` | `default` | `--xh-control-h-sm` | file-upload 的 clear-trigger 部件 block-size 覆盖槽。 |
| `--xh-file-upload-clear-px` | `clear-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | file-upload 的 clear-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-file-upload-clear-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-delete-bg-active` | `item-delete-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | file-upload 的 item-delete-trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-delete-bg-hover` | `item-delete-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | file-upload 的 item-delete-trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-delete-fg` | `item-delete-trigger` | `color` | `default` | `--xh-fg-muted` | file-upload 的 item-delete-trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-delete-fg-hover` | `item-delete-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-danger-hover` | file-upload 的 item-delete-trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-delete-radius` | `item-delete-trigger` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 item-delete-trigger 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-delete-size` | `item-delete-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | file-upload 的 item-delete-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-file-upload-dropzone-bg` | `dropzone` | `background` | `default` | `--xh-bg-canvas` | file-upload 的 dropzone 部件 background 覆盖槽。 |
| `--xh-file-upload-dropzone-bg-disabled` | `dropzone` | `background` | `disabled` | `--xh-bg-subtle` | file-upload 的 dropzone 部件 background 覆盖槽。 |
| `--xh-file-upload-dropzone-bg-dragging` | `dropzone` | `background` | `dragging` | `--xh-bg-subtle` | file-upload 的 dropzone 部件 background 覆盖槽。 |
| `--xh-file-upload-dropzone-bg-hover` | `dropzone` | `background` | `disabled`<br>`dragging`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid], [data-dragging])` | `--xh-bg-subtle` | file-upload 的 dropzone 部件 background 覆盖槽。 |
| `--xh-file-upload-dropzone-border` | `dropzone` | `border` | `default` | `--xh-border-control` | file-upload 的 dropzone 部件 border 覆盖槽。 |
| `--xh-file-upload-dropzone-border-dragging` | `dropzone` | `border-color` | `dragging` | `--xh-bg-brand` | file-upload 的 dropzone 部件 border-color 覆盖槽。 |
| `--xh-file-upload-dropzone-border-focus` | `dropzone` | `border-color` | `disabled`<br>`dragging`<br>`focus-visible`<br>`invalid`<br>`not([data-disabled], [data-invalid], [data-dragging])` | `--xh-_tone` | file-upload 的 dropzone 部件 border-color 覆盖槽。 |
| `--xh-file-upload-dropzone-border-hover` | `dropzone` | `border-color` | `disabled`<br>`dragging`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid], [data-dragging])` | `--xh-border-control-hover` | file-upload 的 dropzone 部件 border-color 覆盖槽。 |
| `--xh-file-upload-dropzone-border-invalid` | `dropzone` | `border-color` | `invalid` | `--xh-border-invalid` | file-upload 的 dropzone 部件 border-color 覆盖槽。 |
| `--xh-file-upload-dropzone-fg` | `dropzone` | `color` | `default` | `--xh-fg-muted` | file-upload 的 dropzone 部件 color 覆盖槽。 |
| `--xh-file-upload-dropzone-font-size` | `dropzone` | `font-size` | `default` | `--xh-text-body-size` | file-upload 的 dropzone 部件 font-size 覆盖槽。 |
| `--xh-file-upload-dropzone-gap` | `dropzone` | `gap` | `default` | `--xh-space-2` | file-upload 的 dropzone 部件 gap 覆盖槽。 |
| `--xh-file-upload-dropzone-min-h` | `dropzone` | `min-block-size` | `default` | `8rem` | file-upload 的 dropzone 部件 min-block-size 覆盖槽。 |
| `--xh-file-upload-dropzone-px` | `dropzone` | `padding-inline` | `default` | `--xh-space-4` | file-upload 的 dropzone 部件 padding-inline 覆盖槽。 |
| `--xh-file-upload-dropzone-py` | `dropzone` | `padding-block` | `default` | `--xh-space-5` | file-upload 的 dropzone 部件 padding-block 覆盖槽。 |
| `--xh-file-upload-dropzone-radius` | `dropzone` | `border-radius` | `default` | `--xh-shape-surface` | file-upload 的 dropzone 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-gap` | `root` | `gap` | `default` | `--xh-space-3` | file-upload 的 root 部件 gap 覆盖槽。 |
| `--xh-file-upload-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | file-upload 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-file-upload-item-bg` | `item` | `background` | `default` | `--xh-bg-surface` | file-upload 的 item 部件 background 覆盖槽。 |
| `--xh-file-upload-item-border` | `item` | `border` | `default` | `--xh-border-subtle` | file-upload 的 item 部件 border 覆盖槽。 |
| `--xh-file-upload-item-border-error` | `item` | `border-color` | `state=error` | `--xh-border-invalid` | file-upload 的 item 部件 border-color 覆盖槽。 |
| `--xh-file-upload-item-fg` | `item` | `color` | `default` | `--xh-fg-default` | file-upload 的 item 部件 color 覆盖槽。 |
| `--xh-file-upload-item-fg-done` | `item` | `background-color` | `state=done` | `--xh-fg-success` | file-upload 的 item 部件 background-color 覆盖槽。 |
| `--xh-file-upload-item-fg-error` | `item` | `color` | `state=error` | `--xh-fg-danger` | file-upload 的 item 部件 color 覆盖槽。 |
| `--xh-file-upload-item-font-size` | `item` | `font-size` | `default` | `--xh-text-body-size` | file-upload 的 item 部件 font-size 覆盖槽。 |
| `--xh-file-upload-item-gap` | `list` | `gap` | `default` | `--xh-space-2` | file-upload 的 list 部件 gap 覆盖槽。 |
| `--xh-file-upload-item-inner-gap` | `item` | `gap` | `default` | `--xh-control-gap-md` | file-upload 的 item 部件 gap 覆盖槽。 |
| `--xh-file-upload-item-name-min-w` | `item-name` | `min-inline-size` | `default` | `--xh-control-min-w` | file-upload 的 item-name 部件 min-inline-size 覆盖槽。 |
| `--xh-file-upload-item-progress-fill` | `item-progress` | `background` | `state=uploading` | `--xh-bg-brand` | file-upload 的 item-progress 部件 background 覆盖槽。 |
| `--xh-file-upload-item-progress-h` | `item-progress` | `block-size` | `default` | `--xh-stroke-thick` | file-upload 的 item-progress 部件 block-size 覆盖槽。 |
| `--xh-file-upload-item-progress-radius` | `item-progress` | `border-radius` | `default` | `--xh-shape-pill` | file-upload 的 item-progress 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-item-progress-track` | `item-progress` | `background` | `default` | `--xh-bg-subtle` | file-upload 的 item-progress 部件 background 覆盖槽。 |
| `--xh-file-upload-item-progress-w` | `item-progress` | `inline-size` | `default` | `--xh-control-h-md` | file-upload 的 item-progress 部件 inline-size 覆盖槽。 |
| `--xh-file-upload-item-px` | `item` | `padding-inline` | `default` | `--xh-space-3` | file-upload 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-file-upload-item-py` | `item` | `padding-block` | `default` | `--xh-space-2` | file-upload 的 item 部件 padding-block 覆盖槽。 |
| `--xh-file-upload-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 item 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | file-upload 的 label 部件 color 覆盖槽。 |
| `--xh-file-upload-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | file-upload 的 label 部件 color 覆盖槽。 |
| `--xh-file-upload-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | file-upload 的 label 部件 font-size 覆盖槽。 |
| `--xh-file-upload-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | file-upload 的 label 部件 font-weight 覆盖槽。 |
| `--xh-file-upload-list-max-h` | `list` | `max-block-size` | `default` | `--xh-viewport-h-md` | file-upload 的 list 部件 max-block-size 覆盖槽。 |
| `--xh-file-upload-preview-bg` | `item-preview` | `background` | `default` | `--xh-bg-subtle` | file-upload 的 item-preview 部件 background 覆盖槽。 |
| `--xh-file-upload-preview-fg` | `item-preview` | `color` | `default` | `--xh-fg-muted` | file-upload 的 item-preview 部件 color 覆盖槽。 |
| `--xh-file-upload-preview-fg-image` | `item-preview` | `color` | `file-type=image/` | `--xh-fg-brand` | file-upload 的 item-preview 部件 color 覆盖槽。 |
| `--xh-file-upload-preview-radius` | `item-preview` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 item-preview 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-preview-size` | `item-preview` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-md` | file-upload 的 item-preview 部件 block-size、inline-size 覆盖槽。 |
| `--xh-file-upload-size-fg` | `item-size-text` | `color` | `default` | `--xh-fg-subtle` | file-upload 的 item-size-text 部件 color 覆盖槽。 |
| `--xh-file-upload-size-font-size` | `item-size-text` | `font-size` | `default` | `--xh-text-caption-size` | file-upload 的 item-size-text 部件 font-size 覆盖槽。 |
| `--xh-file-upload-trigger-bg` | `trigger` | `background` | `default` | `--xh-bg-surface` | file-upload 的 trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-trigger-bg-active` | `trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | file-upload 的 trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-trigger-bg-hover` | `trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | file-upload 的 trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-trigger-border` | `trigger` | `border` | `default` | `--xh-border-control` | file-upload 的 trigger 部件 border 覆盖槽。 |
| `--xh-file-upload-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | file-upload 的 trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-body-size` | file-upload 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-file-upload-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-md` | file-upload 的 trigger 部件 gap 覆盖槽。 |
| `--xh-file-upload-trigger-h` | `trigger` | `block-size` | `default` | `--xh-control-h-md` | file-upload 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-file-upload-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-control-px-md` | file-upload 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-file-upload-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-trigger-shadow-hover` | `trigger` | `box-shadow` | `hover`<br>`not(:disabled)` | `--xh-elevation-raised` | file-upload 的 trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `background-color` · `border-color` · `box-shadow` · `inline-size` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
