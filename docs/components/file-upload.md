# 文件上传 <Badge type="info" text="file-upload" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

投放区自己就是一个大按钮，隐藏输入是必备部件，缺了它选不了文件

<XhDemo src="file-upload/01-basic" />

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

### 手动上传与进度

传输整件事在宿主手里：file-accept 报来本批收下了谁，宿主以 File 为键记状态、进度与完成后的名字，再自己挑时机发起

<XhDemo src="file-upload/09-manual-upload" />

### 列表项上的下载

条目里放什么由作者定：一条普通的 a[download] 就是下载口；想自己接管就换成按钮，在处理器里怎么取都行

<XhDemo src="file-upload/10-download" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-file-upload>` |
| Vue 组件 | `XhFileUploadClearTrigger` `XhFileUploadDropzone` `XhFileUploadHiddenInput` `XhFileUploadItem` `XhFileUploadItemDeleteTrigger` `XhFileUploadItemGroup` `XhFileUploadItemName` `XhFileUploadItemPreview` `XhFileUploadItemSizeText` `XhFileUploadLabel` `XhFileUploadRoot` `XhFileUploadTrigger` |
| 组合式函数 | `useFileUpload` |
| 状态机 | `fileUploadMachine` |
| 皮肤 | `@xihan-ui/styled/file-upload.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="file-upload"`：`root` · `label` · `dropzone` · `trigger` · **`hidden-input`** · `item-group` · `item` · `item-name` · `item-size-text` · `item-preview` · `item-delete-trigger` · `clear-trigger`

## Props

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
| `translations` | `Partial<FileUploadTranslations>` |  |  |
| `onFilesChange` | `(details: FileUploadFilesChangeDetails) => void` |  | 列表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onFileAccept` | `(details: FileUploadFileAcceptDetails) => void` |  | 本次收下了哪些。受控与否都发——宿主要据此发起上传。 |
| `onFileReject` | `(details: FileUploadFileRejectDetails) => void` |  | 本次拒了哪些、各自为什么。 |

## 状态机

**状态**：`idle` · `dragging`

**事件**：`FILES.SET` · `FILES.ADD` · `FILE.DELETE` · `FILES.CLEAR` · `PICKER.OPEN` · `DRAG.OVER` · `DRAG.LEAVE` · `DROP`

**判据**：`canChange` · `canDrop`

## connect API

`useFileUpload` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `acceptedFiles` | `File[]` |  |
| `dragging` | `boolean` | 有东西正悬在投放区上方。 |
| `disabled` | `boolean` |  |
| `invalid` | `boolean` |  |
| `empty` | `boolean` | 一个文件都没有。清空按钮据此禁用，空列表据此显示占位。 |
| `maxFiles` | `number` | 生效的数量上限（已按缺省与非法值归一）。 |
| `getFileSizeText` | `(file: File) => string` | 字节数格式化成人读的形式，供作者渲染 item-size-text。 |
| `setFiles` | `(files: File[]) => void` |  |
| `addFiles` | `(files: File[]) => void` |  |
| `deleteFile` | `(file: File) => void` |  |
| `clearFiles` | `() => void` |  |
| `openFilePicker` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getDropzoneProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getHiddenInputProps` | `() => T['input']` |  |
| `getItemGroupProps` | `() => T['element']` |  |
| `getItemProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemNameProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemSizeTextProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemPreviewProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemDeleteTriggerProps` | `(props: FileUploadItemProps) => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside / inside the component | 投放区、选择按钮、每条的删除按钮与清空按钮各占一个 Tab 位；禁用时投放区退出 Tab 序列，几个原生按钮带 disabled 本就不可聚焦 |
| `Enter` / `Space` | focus on dropzone | 打开系统文件选择框。投放区是 div，浏览器不会替它把这两个键合成成一次点击，连接层自己接管（并拦下空格滚屏） |
| `Enter` / `Space` | focus on trigger | 打开系统文件选择框（原生 button 的默认激活） |
| `Enter` / `Space` | focus on item-delete-trigger | 把这一条从列表里删掉（原生 button 的默认激活） |
| `Enter` / `Space` | focus on clear-trigger，且列表非空 | 清空整份列表；列表为空时该按钮带原生 disabled，键盘根本到不了它 |
