---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

带清空钮的 15 个组件统一新增清空事件：TextField、ColorField、Select、Combobox、Cascader、TreeSelect、TagsInput、DateField、DatePicker、DateRangePicker、TimeField、TimePicker、TimeRangePicker、FileUpload、SignaturePad。用户按清空钮（`clear-trigger`）清掉了值时，先发值变化、再发清空：headless 为 `onClear`，Vue 为 `@clear`，React 为 `onClear`，Web Components 派发 `clear` 事件。程序化的 `clear()` 与 Escape 清空不发，列表或画板本来就空时按清空钮是空操作，也不发。此前只能从值变为空推断清空，分不出是按了清空钮还是删光了字。
