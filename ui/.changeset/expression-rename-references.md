---
'@xihan-ui/expression': minor
---

新增 `renameReferences(source, rename, options?)`：按引用改写表达式源码，字段、参数改名时把公式里对它的引用一并改掉。

- `rename` 收到每一处引用的路径（与 `collectReferences` 相同），返回新路径；返回 `undefined` 或原路径表示不改。
- 只重写名字变了的那几段：字符串字面量与函数名里的同名文字、空白、括号、原来的点号或下标写法都原样保留；新名字需要时加反引号，写进字符串下标时按字符串转义。
- 不改入参；源码解析失败时返回 `{ ok: false, source, issue }`，源码原样不动。成功时返回 `{ ok: true, source, renamed }`。
- 跨实现一致性用例新增 `tests/fixtures/rename-references.json`，其他语言的实现逐条比对。

```ts
renameReferences('IF($year > 2025, $row.amount, 0)', path =>
  path[0] === '$year' ? ['$fiscalYear', ...path.slice(1)] : undefined)
// { ok: true, source: 'IF($fiscalYear > 2025, $row.amount, 0)', renamed: 1 }
```
