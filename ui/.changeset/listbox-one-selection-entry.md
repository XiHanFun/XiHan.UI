---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
---

**listbox 的选择模式收成一个入口：`selectionMode`。** 此前它同时收 `multiple?: boolean` 与 `selectionMode?: 'single' | 'multiple' | 'extended'`，还写死了「两者同时给时以 `selectionMode` 为准」的仲裁规矩，并为此导出了一个只做仲裁的函数。同一件事不留两个入口，`multiple` 整条删除。

留下的是 `selectionMode`：它表达得了 `multiple` 的全部含义，反过来 `multiple` 表达不了 `extended`（裸点替换、Ctrl/Cmd 切换单个、Shift 连选区间）。

**破坏性：下列名字已删。**

| 已删 | 换成 |
| --- | --- |
| Vue `<XhListboxRoot multiple>` | `<XhListboxRoot selection-mode="multiple">` |
| 自定义元素 `<xh-listbox multiple>` | `<xh-listbox selection-mode="multiple">` |
| `XhListboxElement` 上的 `multiple` property | `selectionMode` property |
| `ListboxSchema['props']` 的 `multiple` | `selectionMode: 'multiple'` |
| `@xihan-ui/headless` 导出的函数 `listboxSelectionMode` | 无——直接读 `selectionMode`，缺省是 `'single'` |

特性名没有 IDE 提示，写错既不报错也不降级：请在自己的代码库里全文搜索 `multiple`，凡是落在 listbox 上的都换成 `selection-mode="multiple"`。

**方向与 `tree` 那次相反，别照着推断。** `tree` 留的是 `multiple`、删的是 `selectionMode`（它只有两个取值，与布尔等价）。listbox 有三个取值，布尔装不下，因此留的是枚举。同族另外七家（accordion / cascader / combobox / select / toggle-group / tree / tree-select）仍是 `multiple`，一个字没动。

**popselect 的 `multiple` 没有变。** 它内部跑的是 listbox 机器，现改为按自己的 `multiple` 翻成 `selectionMode`；它自身只有两种模式，对外仍写 `multiple`。

## 默认渲染逐像素未变

选择模式不进任何一条选择器，皮肤一条规则都不读它。
