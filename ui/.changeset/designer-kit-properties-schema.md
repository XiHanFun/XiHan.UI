---
'@xihan-ui/designer-kit': minor
---

新增子入口 `@xihan-ui/designer-kit/properties` 与 `@xihan-ui/designer-kit/schema`：四款设计器共用的属性描述模型与结构校验问题形状。

- `./properties`：`PropertyDescriptor`（`path` 是相对被编辑对象的 `JsonPath`；`control` 为内建的 text、number、boolean、select、tags、color、json 七种编辑方式，可用泛型参数扩展产品的种类；另有 `group`、`label`、`required`、`default`、`visibleWhen`、`meta`）、显示条件 `PropertyCondition`（equals / oneOf / filled 与 all / any / not）、`isFilled`、`evaluateCondition`、`isPropertyVisible`、`groupProperties`、`checkPropertyValue`、`checkProperties`、`applyDefaults`、编辑器查找 `resolvePropertyEditor`。
- 自定义编辑器接口 `PropertyEditor` / `PropertyEditorContext` / `PropertyEditorInstance` 从主入口移到 `./properties`。
- `./schema`：结构问题 `SchemaIssue`（`code`、从文档根算起只用键与下标的 `path`，可选的 `target`、`severity`、`params`，不带文案）、通用问题码 `CommonIssueCode`、`issueSeverity`、`hasErrors`、`withSeverity`、`createIssueSink`，以及读取器 `readObject`、`readArray`、`readString`、`readNumber`、`readBoolean`、`readOneOf`、`readJson`、`checkUniqueKeys`。
