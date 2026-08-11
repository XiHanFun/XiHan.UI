# 加载指示器 <Badge type="info" text="spinner" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

root 是 role=status 的活区，转圈图形由皮肤画在伪元素上；label 给出这一处在等什么

<XhDemo src="spinner/01-basic" />

### 尺寸

size 只换直径，缺省档 md 不输出 data-size

<XhDemo src="spinner/02-size" />

### 可见文案

label 部件不写内容时显示解析后的 label，屏幕上看到的与读屏念的因此是同一段字

<XhDemo src="spinner/03-label" />

### 语气

tone 只换圆环起始边那一段颜色，轨道留在中性描边上，转到哪儿才看得出来

<XhDemo src="spinner/04-tone" />

### 盖住等待中的内容

转圈浮在内容上方，容器同时报 aria-busy，看得见的与念得出的是同一件事

<XhDemo src="spinner/05-overlay" />

### 换掉转圈图形

内置圆环画在伪元素上，把直径与描边归零它就不占位；自绘的图形写进默认插槽

<XhDemo src="spinner/06-custom-graphic" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-spinner>` |
| Vue 组件 | `XhSpinner` `XhSpinnerLabel` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/spinner.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="spinner"`：**`root`** · `label`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `label` | `string` |  | 这一处的可及名字，写在 root 上。 label 部件显示的应当是同一段文案：aria-label 会盖过节点里的文字，两者不一致时 读屏念的与屏幕上看到的就对不上了。 |
| `size` | `Size` |  | 直径档位，缺省 md；缺省档不输出 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `translations` | `Partial<SpinnerTranslations>` |  |  |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 解析后的文案：label → translations.label → 内置默认值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
