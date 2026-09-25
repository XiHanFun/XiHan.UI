# DownloadTrigger 下载触发器

用于将文本或 Blob 保存为本地文件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/download-trigger" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/download-trigger.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/download-trigger" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/download-trigger" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/download-trigger.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

下载文本文件

<XhDemo src="download-trigger/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="download-trigger"`：**`root`**

## 示例

### 异步内容

点击后获取下载内容

<XhDemo src="download-trigger/02-lazy" />

### Blob

下载 JSON 文件

<XhDemo src="download-trigger/03-blob" />

### 变体

设置触发器外观

<XhDemo src="download-trigger/04-variant" />

### 尺寸

使用小、中、大三档尺寸

<XhDemo src="download-trigger/05-size" />

### 禁用

禁止触发下载

<XhDemo src="download-trigger/06-disabled" />

## 设计指引

### 何时使用

- 导出 CSV、JSON、日志或配置文件。
- 点击后才获取或生成下载内容。

### 何时不用

- 文件已有稳定地址时，使用原生 `<a download>`。
- 复制少量文字时，使用[剪贴板](./clipboard)。
- 接收用户文件时，使用[文件上传](./file-upload)。

### 特性

- 接受字符串、Blob 与异步数据函数。
- `preparing` 期间保留焦点并阻止重复触发。
- 通过完成与失败事件返回本次文件名和错误。
- 缺省是中性淡底 `subtle`，只有 `solid` 才是品牌实心；按下有统一的缩放与换底反馈。

### 组合

- 与[进度条](./progress)组合展示可量化的长任务。
- 通过变体与颜色调整操作层级。

### 最佳实践

- 文件名应包含正确扩展名。
- 保留下载图标与可见文字；只有下载是页面主操作时才使用 `solid`。
- 大文件优先使用服务端下载地址。
- 失败事件应连接可见反馈。

### 反模式

- 不要将“下载已发起”等同于“文件已写入磁盘”。
- 不要在页面加载时预先生成大文件。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-download-trigger>` |
| Vue 组件 | `XhDownloadTrigger` |
| 组合式函数 | `useDownloadTrigger` |
| 状态机 | `downloadTriggerMachine` |
| 皮肤 | `@xihan-ui/styles/download-trigger.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `data` | `DownloadTriggerData` |  | 要下载的内容：文本、Blob，或点击时才调用的取数函数（可返回 Promise）。 |
| `fileName` | `string` |  | 写出的文件名；未提供或空串时回退为内建默认名。 |
| `mimeType` | `string` |  | 内容类型；提供后以它为准，Blob 自带的类型也按它重新包装。未提供时文本按纯文本处理。 |
| `disabled` | `boolean` |  | 禁用：按钮不可聚焦、不可点击。 |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost，默认 subtle（缺省中性淡底，solid 才品牌实心）。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<DownloadTriggerTranslations>` |  |  |
| `onDownloadComplete` | `(details: DownloadTriggerCompleteDetails) => void` |  | 数据已交给浏览器时通知一次。此时只说明下载已发起，浏览器是否把文件写入磁盘组件无法感知。 |
| `onDownloadError` | `(details: DownloadTriggerErrorDetails) => void` |  | 取数失败或无法创建下载时通知；此时状态已回到 idle。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `download-complete` | `DownloadTriggerCompleteDetails` | 数据已交给浏览器；detail 为 `{ fileName }` |
| `download-error` | `DownloadTriggerErrorDetails` | 取数失败或无法创建下载；detail 为 `{ error, fileName }`，此时状态已回到 idle |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDownloadTrigger` | `default` | `DownloadTriggerSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhDownloadTrigger` | `children` | `SlotChildren<DownloadTriggerSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'preparing' |

以下名称仅用于内部状态机。

**状态**：`idle` · `preparing`

**事件**：`DOWNLOAD.TRIGGER` · `DOWNLOAD.SUCCESS` · `DOWNLOAD.ERROR` · `PRESS.START` · `PRESS.END`

**判据**：`isDisabled` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `DownloadTriggerStatus` |  |
| `preparing` | `boolean` | 数据获取中。按钮不因此禁用，只是期间再次点击不会重复发起。 |
| `disabled` | `boolean` |  |
| `fileName` | `string` | 本次将写出的文件名（prop 未提供时是内建默认名）。 |
| `download` | `() => void` | 发起一次下载意图，与点击按钮走同一路径：禁用时不生效，取数在途时不重复发起。 |
| `getRootProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in root, 未禁用 | 发起一次下载；取数在途时这两个键同样不会重复发起 |
| `Enter` / `Space` | held in root, not disabled, not preparing | 按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-disabled` | 'true' \| undefined |
| `root` | `aria-label` | props.translations.trigger |

- 触发器使用原生 `<button type="button">`。
- 准备数据时使用 `aria-busy` 与 `aria-disabled`，但不移除焦点。
- 仅显示图标时必须提供可访问名称。

## 样式参考

### 皮肤

`@xihan-ui/styles/download-trigger.css` 使用 `[data-scope="download-trigger"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-pressed` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'preparing' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'text' |
| `root` | `data-xh-action-size` | props.size |
| `root` | `data-xh-action-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-download-trigger-bg` | `root` | `background-color` | `default`<br>`focus-visible`<br>`loading` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` | download-trigger 的 root 部件 background-color 覆盖槽。 |
| `--xh-download-trigger-bg-active` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | download-trigger 的 root 部件 background-color 覆盖槽。 |
| `--xh-download-trigger-bg-disabled` | `root` | `background-color` | `disabled` | `--xh-_action-variant-bg-disabled` | download-trigger 的 root 部件 background-color 覆盖槽。 |
| `--xh-download-trigger-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | download-trigger 的 root 部件 background-color 覆盖槽。 |
| `--xh-download-trigger-border` | `root` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` | download-trigger 的 root 部件 border、border-color 覆盖槽。 |
| `--xh-download-trigger-border-disabled` | `root` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` | download-trigger 的 root 部件 border-color 覆盖槽。 |
| `--xh-download-trigger-border-hover` | `root` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` | download-trigger 的 root 部件 border-color 覆盖槽。 |
| `--xh-download-trigger-fg` | `root` | `border-block-start-color`<br>`border-color`<br>`color` | `@media (prefers-reduced-motion: reduce)`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`motion=reduce`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-motion='reduce'])` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | download-trigger 的 root 部件 border-block-start-color、border-color、color 覆盖槽。 |
| `--xh-download-trigger-font-size` | `root` | `font-size` | `default` | `--xh-_action-profile-font-size` | download-trigger 的 root 部件 font-size 覆盖槽。 |
| `--xh-download-trigger-font-weight` | `root` | `font-weight` | `default` | `--xh-text-label-weight` | download-trigger 的 root 部件 font-weight 覆盖槽。 |
| `--xh-download-trigger-gap` | `root` | `gap` | `default` | `--xh-_action-profile-gap` | download-trigger 的 root 部件 gap 覆盖槽。 |
| `--xh-download-trigger-h` | `root` | `block-size` | `default` | `--xh-_action-profile-visual-size` | download-trigger 的 root 部件 block-size 覆盖槽。 |
| `--xh-download-trigger-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | download-trigger 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-download-trigger-loading-duration` | `root` | `animation` | `default` | `--xh-spin-duration` | download-trigger 的 root 部件 animation 覆盖槽。 |
| `--xh-download-trigger-loading-fg` | `root` | `border-block-start-color`<br>`border-color` | `@media (prefers-reduced-motion: reduce)`<br>`default`<br>`motion=reduce`<br>`where([data-motion='reduce'])` | `--xh-download-trigger-fg` | download-trigger 的 root 部件 border-block-start-color、border-color 覆盖槽。 |
| `--xh-download-trigger-px` | `root` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | download-trigger 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-download-trigger-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | download-trigger 的 root 部件 border-radius 覆盖槽。 |
| `--xh-download-trigger-shadow-hover` | `root` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` | download-trigger 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-download-trigger-content-hide` · `xh-download-trigger-loading-reveal` 随皮肤自带，不引用别处文件里的名字；共享关键帧 `xh-spin` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
