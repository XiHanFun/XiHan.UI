---
'@xihan-ui/core': minor
---

`@xihan-ui/core/json` 新增按路径读写与几个通用小工具，供读写模板、表单值这类纯 JSON 数据的地方共用。

- 路径：`JsonPath` 由对象键（只认自有属性）与数组下标组成；负数、小数与 `__proto__` / `prototype` / `constructor` 段一律视为不合法。
- `getJsonAt(root, path)`：读取路径处的值，路径不存在时为 `undefined`。
- `setJsonAt(root, path, value, { createMissing? })`：以不修改原值的方式写入，返回新根与原值，未改动的部分沿用原引用；`value` 为 `undefined` 时删除对象键；没有变化时返回同一个根。缺少中间层时默认报错，显式传 `createMissing` 才补成空对象。失败时抛 `JsonPathError`，`code` 为 `invalid-path`、`path-not-found` 或 `invalid-value`。
- `isJsonPathPrefix(path, prefix)`、`formatJsonPath(path)`（写成 `lines[1].price` 这样的文字）。
- `changedJsonPaths(before, after)`：列出两个值之间变化的最小路径集合。
- `isJsonValue(value)`：类型守卫；`deepFreeze(value)`：深冻结并返回同一个值；`appendJsonPointer(pointer, token)`：按规范转义并追加 JSON Pointer 片段。
