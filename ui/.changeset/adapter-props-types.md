---
'@xihan-ui/vue': major
'@xihan-ui/react': major
---

**新增** Vue 为每个组件导出 props 类型 `Xh<组件名>Props`（1256 个），名字与 React 一一对应：组件在模板与 `h()` 里接受的 props，含 `emits` 对应的 `on*` 监听与 `class`、`style`、`key`、`ref`。选中值随类型收窄的根组件带类型参数，缺省与 React 相同：`XhSelectRootProps<V>`、`XhComboboxRootProps<V>`、`XhListboxRootProps<V>`、`XhCheckboxGroupRootProps<V>`、`XhRadioGroupRootProps<V>`、`XhToggleGroupRootProps<V, M>`、`XhTableRootProps<TRow>`、`XhFormRootProps<TValues>`、`XhFormFieldGroupProps<TValues, P>`、`XhFormErrorSummaryItemProps<TValues, P>`。这些类型由组件定义推导而来，SFC 的 `defineProps<…>()` 解析不了，用于标注 `h()` 的参数、算好的 props 对象或配置项。

**新增** React 补导出 165 个写了却没从入口导出的 props 类型（Cascader、Combobox、Command、Listbox、Select、TreeSelect 的各部件等），每个组件都有同名的 `Xh*Props`。

**破坏性** React 撤掉几个部件共用的类型名，改用各部件同名的类型：

| 旧名 | 新名 |
| --- | --- |
| `XhCitationSourcePartProps` | `XhCitationSourceIndexProps`、`XhCitationSourceTitleProps`、`XhCitationSourceMetaProps` |
| `XhGridListRowPartProps` | `XhGridListRowContentProps`、`XhGridListRowTextProps`、`XhGridListRowDescriptionProps`、`XhGridListRowActionsProps` |
| `XhImageViewerToolTriggerProps` | `XhImageViewerZoomInTriggerProps` 等十个工具按钮各自的类型 |
| `XhTransferPanelProps` | `XhTransferSourcePanelProps`、`XhTransferTargetPanelProps` |

**破坏性（只涉及类型）** Vue 有 28 个部件原来由工厂函数生成，类型是宽的 `DefineComponent`：模板里写错属性名、漏写必填的 `value` 都查不出来。现在按各自的 props 精确推断：`XhMenuItem`、`XhMenuCheckboxItem`、`XhMenuRadioItem` 与 ContextMenu、Menubar 的同名三种条目要求写 `value`（字符串），`XhGridListRow*` 的五个行内部件、`XhImageViewer*Trigger` 的十个工具按钮、`XhExpressionInputItem*` 的四个条目部件也按各自的 props 检查。运行时行为不变。
