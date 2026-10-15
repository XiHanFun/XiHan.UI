---
'@xihan-ui/expression': minor
---

`@xihan-ui/expression` 新增子入口 `@xihan-ui/expression/template`，提供 `{{path}}` 文本模板。占位里只写数据路径，不写表达式；子入口不依赖表达式本体。

- `parseTextTemplate(source)` 切出原样文本与路径占位，占位两侧的空白忽略。所有问题一次给出，每条是 `{ code, start, end }`，有三种：
  - `XH_EXPR_TEMPLATE_UNCLOSED`：占位没有闭合。
  - `XH_EXPR_TEMPLATE_EMPTY`：占位是空的。
  - `XH_EXPR_TEMPLATE_INVALID_PATH`：路径不合法，在占位里写表达式也报这一条。
  有问题的占位按原样文本保留。
- `fillTextTemplate(template, data, { display? })` 按数据替换占位，可以直接传入解析结果。
  - 读值：逐段读自有属性；当前值是数组时，这一段必须是不带前导 0 的下标。读不到时得到空串。
  - 显示：对象与数组不能直接显示，得到空串，并按出现顺序记进 `nonScalar`。
  - 传入 `display` 可以替换缺省的显示规则。
- `splitTemplatePath(text)` 判断并拆分路径。合法的路径以 `.` 分隔；每段不含空白、花括号与方括号，也不能是 `__proto__`、`prototype`、`constructor`。以 `$` 开头的宿主变量（例如页码 `{{$page}}` / `{{$pages}}`）与中文名都可以用。
