---
'@xihan-ui/designer-kit': minor
---

新增按 JSON 路径的编辑操作、文档内唯一 id 与属性编辑器接口，运行时开始依赖 `@xihan-ui/core`（只用 `./json` 子入口）。

- `applyPathOperation(document, operation)` / `applyPathOperations`：`set`（`value` 缺省时删除对象键，`createMissing` 补中间层，空路径替换整个文档）、`insert`、`remove`、`move` 四种操作，返回新文档与精确还原的逆操作，可直接作为 `createHistory` 的 `apply`。没有变化时返回同一文档、逆操作为空数组；失败抛 `PathOperationError`，`message` 即 `code`（`invalid-operation`、`invalid-path`、`path-not-found`、`invalid-value`、`not-an-array`、`index-out-of-range`）。
- `applyInSequence(apply, document, operations)`：依次应用一组操作，逆操作按反序拼接；历史栈内部改用它。
- `nextFreeId(prefix, taken)`、`createIdAllocator(prefix, taken?)`、`remapIds(ids, allocate)`：文档内唯一 id 的生成与粘贴时的新旧对照。
- 类型 `PropertyEditor` / `PropertyEditorContext` / `PropertyEditorInstance`：属性面板自定义编辑器的接口。
