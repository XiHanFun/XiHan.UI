# FileUpload

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/file-upload).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/file-upload" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/file-upload.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/file-upload" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/file-upload" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/file-upload.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="file-upload"`: `root` · `label` · `dropzone` · `trigger` · **`hidden-input`** · `list` · `item` · `item-name` · `item-link` · `item-size-text` · `item-preview` · `item-progress` · `item-delete-trigger` · `clear-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-file-upload>` |
| Vue components | `XhFileUploadClearTrigger` `XhFileUploadDropzone` `XhFileUploadHiddenInput` `XhFileUploadItem` `XhFileUploadItemDeleteTrigger` `XhFileUploadItemLink` `XhFileUploadItemName` `XhFileUploadItemPreview` `XhFileUploadItemProgress` `XhFileUploadItemSizeText` `XhFileUploadLabel` `XhFileUploadList` `XhFileUploadRoot` `XhFileUploadTrigger` |
| Composable | `useFileUpload` |
| State machine | `fileUploadMachine` |
| Skin | `@xihan-ui/styles/file-upload.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `accept` | `string \| string[]` |  |
| `maxFiles` | `number` |  |
| `maxFileSize` | `number` |  |
| `minFileSize` | `number` |  |
| `disabled` | `boolean` |  |
| `invalid` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `files` | `File[]` |  |
| `defaultFiles` | `File[]` |  |
| `allowDrop` | `boolean` |  |
| `allowPaste` | `boolean` |  |
| `validate` | `(file: File, context: FileUploadValidateContext) => string \| string[] \| null \| undefined` |  |
| `maxConcurrentUploads` | `number` |  |
| `directory` | `boolean` |  |
| `capture` | `'user' \| 'environment'` |  |
| `linkTarget` | `string` |  |
| `remoteFiles` | `FileUploadRemoteFile[]` |  |
| `defaultRemoteFiles` | `FileUploadRemoteFile[]` |  |
| `upload` | `(request: FileUploadRequest) => Promise<FileUploadResult \| undefined \| void> \| FileUploadResult \| undefined \| void` |  |
| `autoUpload` | `boolean` |  |
| `translations` | `Partial<FileUploadTranslations>` |  |
| `onFilesChange` | `(details: FileUploadFilesChangeDetails) => void` |  |
| `onClear` | `() => void` |  |
| `onFileAccept` | `(details: FileUploadFileAcceptDetails) => void` |  |
| `onFileReject` | `(details: FileUploadFileRejectDetails) => void` |  |
| `onRemoteFilesChange` | `(details: FileUploadRemoteFilesChangeDetails) => void` |  |
| `onUploadComplete` | `(details: FileUploadCompleteDetails) => void` |  |
| `onUploadError` | `(details: FileUploadErrorDetails) => void` |  |
| `onUploadCancel` | `(details: FileUploadCancelDetails) => void` |  |

### FileUploadRemoteFile

Elements of `remoteFiles`.

| Field | Type | Required |
| --- | --- | --- |
| `id` | `string` | Yes |
| `name` | `string` | Yes |
| `size` | `number` |  |
| `type` | `string` |  |
| `url` | `string` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `files-change` | `FileUploadFilesChangeDetails` |
| `clear` | `` |
| `remote-files-change` | `FileUploadRemoteFilesChangeDetails` |
| `upload-complete` | `FileUploadCompleteDetails` |
| `upload-error` | `FileUploadErrorDetails` |
| `upload-cancel` | `FileUploadCancelDetails` |
| `file-accept` | `FileUploadFileAcceptDetails` |
| `file-reject` | `FileUploadFileRejectDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFileUploadRoot` | `default` | `FileUploadRootSlotProps` |
| `XhFileUploadRoot` | `label` | — |
| `XhFileUploadRoot` | `dropzone` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFileUploadItem` | `file` | `FileUploadFile` |  |
| `XhFileUploadItem` | `index` | `number \| string` |  |
| `XhFileUploadRoot` | `label` | `ReactNode` |  |
| `XhFileUploadRoot` | `dropzone` | `ReactNode` |  |
| `XhFileUploadRoot` | `clearable` | `boolean` |  |
| `XhFileUploadRoot` | `children` | `SlotChildren<FileUploadRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | uploadOf(file)?.status |
| `item-progress` | upload?.status |

The following names are internal to the state machine.

**States**: `idle` · `dragging`

**Events**: `FILES.SET` · `FILES.ADD` · `FILE.DELETE` · `FILES.CLEAR` · `PICKER.OPEN` · `DRAG.OVER` · `DRAG.LEAVE` · `DROP` · `PASTE` · `UPLOAD.CANCEL` · `UPLOAD.START` · `REMOTE.DELETE` · `FORM.RESET` · `PRESS.START` · `PRESS.END` · `LIST.TRACKED` · `PROGRESS.SETTLED`

**Guards**: `canChange` · `canTransfer` · `canDrop` · `canPaste`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `acceptedFiles` | `File[]` |
| `remoteFiles` | `FileUploadRemoteFile[]` |
| `allFiles` | `FileUploadFile[]` |
| `dragging` | `boolean` |
| `disabled` | `boolean` |
| `invalid` | `boolean` |
| `readOnly` | `boolean` |
| `required` | `boolean` |
| `empty` | `boolean` |
| `maxFiles` | `number` |
| `translations` | `FileUploadTranslations` |
| `fileKey` | `(file: FileUploadFile) => string` |
| `fileHref` | `(file: FileUploadFile) => string \| undefined` |
| `getFileSizeText` | `(file: FileUploadFile) => string` |
| `uploadOf` | `(file: FileUploadFile) => FileUploadSnapshot \| null` |
| `startUpload` | `(file: File) => void` |
| `cancelUpload` | `(file: File) => void` |
| `setFiles` | `(files: File[]) => void` |
| `addFiles` | `(files: File[]) => void` |
| `deleteFile` | `(file: FileUploadFile) => void` |
| `clear` | `() => void` |
| `openFilePicker` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getDropzoneProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getHiddenInputProps` | `() => T['input']` |
| `getListProps` | `() => T['element']` |
| `getItemProps` | `(props: FileUploadItemProps) => T['element']` |
| `getItemNameProps` | `(props: FileUploadItemProps) => T['element']` |
| `getItemLinkProps` | `(props: FileUploadItemProps) => T['element']` |
| `getItemSizeTextProps` | `(props: FileUploadItemProps) => T['element']` |
| `getItemPreviewProps` | `(props: FileUploadItemProps) => T['element']` |
| `getItemProgressProps` | `(props: FileUploadItemProps) => T['element']` |
| `getItemDeleteTriggerProps` | `(props: FileUploadItemProps) => T['button']` |
| `getClearTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `file-upload.kbd.tab` |
| `Enter` / `Space` | `file-upload.kbd.open-dropzone` |
| `Enter` / `Space` | `file-upload.kbd.open-trigger` |
| `Enter` / `Space` | `file-upload.kbd.delete` |
| `Enter` / `Space` | `file-upload.kbd.clear` |
| `Ctrl+V` / `Meta+V` | `file-upload.kbd.paste` |
| `Enter` / `Space` | `file-upload.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `dropzone` | `aria-disabled` | 'false' \| 'true' |
| `dropzone` | `aria-invalid` | 'true' \| 'false' |
| `dropzone` | `aria-label` | undefined \| props.ariaLabel |
| `dropzone` | `aria-labelledby` | id of the `label` part id of the `dropzone` part \| id of the `dropzone` part |
| `dropzone` | `role` | 'button' |
| `trigger` | `aria-disabled` | 'true' \| undefined |
| `hidden-input` | `aria-labelledby` | id of the `label` part id of the `dropzone` part \| id of the `dropzone` part |
| `list` | `role` | 'list' |
| `item` | `role` | 'listitem' |
| `item-link` | `aria-disabled` | 'true' \| undefined |
| `item-preview` | `aria-hidden` | 'true' |
| `item-progress` | `aria-hidden` | 'true' |
| `item-delete-trigger` | `aria-disabled` | 'true' \| undefined |
| `item-delete-trigger` | `aria-label` | label.deleteItem(file) |
| `clear-trigger` | `aria-disabled` | 'true' \| undefined |
| `clear-trigger` | `aria-label` | label.clearTrigger |

## Style reference

### Skin

`@xihan-ui/styles/file-upload.css` is written against `[data-scope="file-upload"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-file-upload` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-required` | '' (present only while the condition holds) |
| `dropzone` | `data-disabled` | '' (present only while the condition holds) |
| `dropzone` | `data-dragging` | '' (present only while the condition holds) |
| `dropzone` | `data-invalid` | '' (present only while the condition holds) |
| `dropzone` | `data-readonly` | '' (present only while the condition holds) |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-readonly` | '' (present only while the condition holds) |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `list` | `data-disabled` | '' (present only while the condition holds) |
| `list` | `data-empty` | '' (present only while the condition holds) |
| `list` | `data-instant` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-file-name` | file.name |
| `item` | `data-file-size` | undefined \| String(file.size) \| String(file.size) |
| `item` | `data-remote` | '' (present only while the condition holds) |
| `item` | `data-state` | uploadOf(file)?.status |
| `item-name` | `data-disabled` | '' (present only while the condition holds) |
| `item-link` | `data-disabled` | '' (present only while the condition holds) |
| `item-size-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-size-text` | `data-file-size` | undefined \| String(file.size) \| String(file.size) |
| `item-preview` | `data-disabled` | '' (present only while the condition holds) |
| `item-preview` | `data-file-type` | (isRemote(file) ? file.type ?? '' : file.type) \|\| 'un… |
| `item-progress` | `data-disabled` | '' (present only while the condition holds) |
| `item-progress` | `data-state` | upload?.status |
| `item-delete-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `item-delete-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `item-delete-trigger` | `data-readonly` | '' (present only while the condition holds) |
| `item-delete-trigger` | `data-xh-action-control` | '' |
| `item-delete-trigger` | `data-xh-action-display` | 'always' |
| `item-delete-trigger` | `data-xh-action-profile` | 'icon' |
| `item-delete-trigger` | `data-xh-action-size` | 'xs' |
| `item-delete-trigger` | `data-xh-action-variant` | 'ghost' |
| `clear-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `clear-trigger` | `data-empty` | '' (present only while the condition holds) |
| `clear-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `clear-trigger` | `data-readonly` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'always' |
| `clear-trigger` | `data-xh-action-profile` | 'text' |
| `clear-trigger` | `data-xh-action-size` | 'sm' |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-file-upload-clear-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-file-upload-clear-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-file-upload-clear-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-file-upload-clear-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-file-upload-clear-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` |
| `--xh-file-upload-clear-gap` | `clear-trigger` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-file-upload-clear-h` | `clear-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-file-upload-clear-px` | `clear-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-file-upload-clear-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-file-upload-delete-bg-active` | `item-delete-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-file-upload-delete-bg-hover` | `item-delete-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-file-upload-delete-fg` | `item-delete-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-file-upload-delete-fg-hover` | `item-delete-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-danger-hover` |
| `--xh-file-upload-delete-radius` | `item-delete-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-file-upload-delete-size` | `item-delete-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-file-upload-dropzone-bg` | `dropzone` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-file-upload-dropzone-bg-disabled` | `dropzone` | `background` | `disabled` | `--xh-bg-subtle` |
| `--xh-file-upload-dropzone-bg-dragging` | `dropzone` | `background` | `dragging` | `--xh-bg-subtle-hover` |
| `--xh-file-upload-dropzone-bg-hover` | `dropzone` | `background` | `disabled`<br>`dragging`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-readonly], [data-invalid], [data-dragging])`<br>`readonly` | `--xh-bg-subtle-hover` |
| `--xh-file-upload-dropzone-border` | `dropzone` | `border` | `default` | `--xh-border-control` |
| `--xh-file-upload-dropzone-border-dragging` | `dropzone` | `border-color` | `dragging` | `--xh-bg-brand` |
| `--xh-file-upload-dropzone-border-focus` | `dropzone` | `border-color` | `disabled`<br>`dragging`<br>`focus-visible`<br>`invalid`<br>`not([data-disabled], [data-invalid], [data-dragging])` | `--xh-_tone` |
| `--xh-file-upload-dropzone-border-hover` | `dropzone` | `border-color` | `disabled`<br>`dragging`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-readonly], [data-invalid], [data-dragging])`<br>`readonly` | `--xh-border-strong` |
| `--xh-file-upload-dropzone-border-invalid` | `dropzone` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-file-upload-dropzone-fg` | `dropzone` | `color` | `default` | `--xh-fg-default` |
| `--xh-file-upload-dropzone-font-size` | `dropzone` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-file-upload-dropzone-gap` | `dropzone` | `gap` | `default` | `--xh-space-2` |
| `--xh-file-upload-dropzone-min-h` | `dropzone` | `min-block-size` | `default` | `--xh-dropzone-min-h` |
| `--xh-file-upload-dropzone-px` | `dropzone` | `padding-inline` | `default` | `--xh-space-4` |
| `--xh-file-upload-dropzone-py` | `dropzone` | `padding-block` | `default` | `--xh-space-5` |
| `--xh-file-upload-dropzone-radius` | `dropzone` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-file-upload-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-3` |
| `--xh-file-upload-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` |
| `--xh-file-upload-item-bg` | `item` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-file-upload-item-bg-error` | `item` | `background` | `has(> [data-part='item-progress'][data-state='error'])`<br>`state=closed`<br>`state=error` | `--xh-bg-surface` |
| `--xh-file-upload-item-border` | `item` | `border` | `default` | `transparent` |
| `--xh-file-upload-item-border-error` | `item` | `border-color` | `has(> [data-part='item-progress'][data-state='error'])`<br>`state=closed`<br>`state=error` | `transparent` |
| `--xh-file-upload-item-fg` | `item` | `color` | `default` | `--xh-fg-default` |
| `--xh-file-upload-item-fg-done` | `item` | `background-color` | `has(> [data-part='item-progress'][data-state='done'])`<br>`state=closed`<br>`state=done` | `--xh-fg-success` |
| `--xh-file-upload-item-fg-error` | `item`<br>`item-name` | `background-color`<br>`color` | `has(> [data-part='item-progress'][data-state='error'])`<br>`state=closed`<br>`state=error` | `--xh-fg-danger` |
| `--xh-file-upload-item-font-size` | `item` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-file-upload-item-gap` | `list` | `gap` | `default` | `--xh-space-3` |
| `--xh-file-upload-item-inner-gap` | `item` | `gap` | `default` | `--xh-space-3` |
| `--xh-file-upload-item-link-fg` | `item-link` | `color` | `default` | `--xh-fg-brand` |
| `--xh-file-upload-item-link-fg-hover` | `item-link` | `color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-brand-strong` |
| `--xh-file-upload-item-link-radius` | `item-link` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-file-upload-item-link-underline-offset` | `item-link` | `text-underline-offset` | `default` | `--xh-space-0_5` |
| `--xh-file-upload-item-mark-size` | `item` | `block-size`<br>`inline-size` | `has(> [data-part='item-progress'][data-state='done'])`<br>`has(> [data-part='item-progress'][data-state='error'])`<br>`state=closed`<br>`state=done`<br>`state=error` | `--xh-control-indicator-size` |
| `--xh-file-upload-item-name-min-w` | `item-name` | `min-inline-size` | `default` | `--xh-control-min-w` |
| `--xh-file-upload-item-progress-fill` | `item-progress` | `background` | `default` | `--xh-bg-brand` |
| `--xh-file-upload-item-progress-h` | `item-progress` | `block-size` | `default` | `--xh-stroke-thick` |
| `--xh-file-upload-item-progress-radius` | `item-progress` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-file-upload-item-progress-track` | `item-progress` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-file-upload-item-progress-w` | `item-progress` | `inline-size` | `default` | `--xh-control-h-md` |
| `--xh-file-upload-item-px` | `item` | `padding-inline` | `default` | `--xh-space-3` |
| `--xh-file-upload-item-py` | `item` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-file-upload-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-file-upload-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-file-upload-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-file-upload-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-file-upload-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-file-upload-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-file-upload-list-max-h` | `list` | `max-block-size` | `default` | `--xh-viewport-h-md` |
| `--xh-file-upload-preview-bg` | `item-preview` | `background` | `default` | `transparent` |
| `--xh-file-upload-preview-fg` | `item-preview` | `color` | `default` | `--xh-fg-brand` |
| `--xh-file-upload-preview-fg-image` | `item-preview` | `color` | `file-type=image/` | `--xh-fg-brand` |
| `--xh-file-upload-preview-radius` | `item-preview` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-file-upload-preview-size` | `item-preview` | `block-size`<br>`inline-size` | `default` | `--xh-glyph-size-sm` |
| `--xh-file-upload-size-fg` | `item-size-text` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-file-upload-size-font-size` | `item-size-text` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-file-upload-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-file-upload-trigger-bg-active` | `trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-file-upload-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-file-upload-trigger-border` | `trigger` | `border` | `default` | `--xh-_action-variant-border-rest` |
| `--xh-file-upload-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-file-upload-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` |
| `--xh-file-upload-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-file-upload-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-file-upload-trigger-h` | `trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-file-upload-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-file-upload-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-file-upload-trigger-shadow-hover` | `trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` |
