---
'@xihan-ui/designer-kit': minor
---

`@xihan-ui/designer-kit/properties` 新增 `nestProperties(prefix, descriptors)`：把相对子对象的属性描述换成相对上级对象，`path` 与显示条件（含 `all` / `any` / `not` 里的每一层）的 `path` 都接在 `prefix` 之后，产品扩展的字段原样保留，不改输入。
