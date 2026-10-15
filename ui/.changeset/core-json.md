---
'@xihan-ui/core': minor
---

新增子入口 `@xihan-ui/core/json`：JSON 值的类型与纯函数，零依赖，供读写模板、配置这类纯 JSON 数据的地方共用。

- 类型：`JsonPrimitive`、`JsonArray`、`JsonObject`、`JsonValue`。
- `isPlainObject(value)`：原型为 `Object.prototype` 或 `null` 的普通对象（数组不算）。
- `findJsonViolation(value, pointer?)`：找出第一处不是 JSON 的位置，返回它的 JSON Pointer；非有限数字、`undefined`、函数、`Date` 等非普通对象与循环引用都算非法，同一对象被多处引用不算循环。
- `cloneJson(value)`：深拷贝，结果不与输入共享对象或数组。
- `jsonEquals(a, b)`：按值比较，对象与键顺序无关。
