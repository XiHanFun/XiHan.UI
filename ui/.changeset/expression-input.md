---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `expression-input` 组件（表达式输入框）：输入受限表达式，边输入边报出问题，并补全可引用的名字与函数。Vue、React 与 Web Components 三端同时可用。

- 检查由宿主给的 `check` 完成：值变化后去抖（`checkDelay`，缺省 150 毫秒）调用、失焦时立即调用，`@xihan-ui/expression` 的 `createExpressionCheck` 可以直接交给它。问题区间在镜像层画波浪下划线，框下的问题列表逐行写出位置与说明，并进输入框的描述链；有 error 即 `aria-invalid`，warning 只提示。
- 补全来源是宿主的 `completions`（静态列表按前缀过滤，函数形式由宿主按光标处的查询给出，可在 `$row.` 之后只列成员）与 `functions` 函数表（缺省全部内置函数）；函数条目显示参数签名与一句说明。输入名字字符且有匹配才打开，Ctrl+Space 主动打开；接受时只替换光标处的名字，函数的光标落在括号里。`insert(text)` 在选区处插入一段文本，供宿主的「插入字段」按钮使用。
- 单行时输入框是 `role=combobox`；`multiline` 时是 textarea，保持 textbox 角色，补全浮层锚在光标处，`autoSize` 给出行数上下限。输入法组合期间不取词、不检查。
- 结构由 `expressionInputStructure` 一份给出：Web Components 只写元素本身，Vue / React 不写默认插槽时，三端铺出同一棵树；写了 `label` 才铺标题。放进字段时，字段的名字、说明与校验状态接到输入框上。
- 字段外框与输入框走 Field Chrome 家族，补全列表走磨砂面与集合条目家族。
- 十种内建语言包新增 `expression-input` 一桶：中文与英文给出问题码、参数名与内置函数的说明，其余语言的这三项沿用英文。
