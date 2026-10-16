---
'@xihan-ui/designer-kit': minor
---

`@xihan-ui/designer-kit` 新增可绑定字段树：类型 `DataField`（`{ name, label?, kind: 'value' | 'object' | 'list', children? }`，`list` 的子字段描述数组的一个元素）与 `DATA_FIELD_KINDS`；`listDataFields(fields, { base?, kinds? })` 深度优先列出起点之下可直接读到的字段（进入对象、不进入数组），以数组为起点时列元素字段；`findDataField(fields, path)` 按键路径找字段。同级重名、名字为空或种类未知时抛 `RangeError`。
