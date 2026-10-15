---
'@xihan-ui/core': minor
---

`@xihan-ui/core` 新增子入口 `@xihan-ui/core/template`，提供 `{{path}}` 文本模板。占位里只写数据路径，不写表达式。

- 路径写法与 `@xihan-ui/core/json` 的 `formatJsonPath` 相同，由 `parseJsonPath` 解析：标识符之间用 `.` 连接，下标写成 `[0]`，不是标识符的键写成 `["unit price"]`。以 `$` 开头的宿主变量（例如页码 `{{$page}}` / `{{$pages}}`）按普通键处理。
- `parseTextTemplate(source)` 切出原样文本与路径占位，问题一次全部给出，有三种：
  - `XH_EXPR_TEMPLATE_UNCLOSED`：占位没有闭合。
  - `XH_EXPR_TEMPLATE_EMPTY`：占位为空。
  - `XH_EXPR_TEMPLATE_INVALID_PATH`：路径不合法，在占位里写表达式也报这一条。
  有问题的占位按原样文本保留。
- `fillTextTemplate(template, data, { display? })` 按数据替换占位，也可以直接传入已解析的模板。读值方式与 `getJsonAt` 相同。读到对象或数组时，占位得到空串，路径记进 `nonScalar`。
