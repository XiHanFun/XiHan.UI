---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

字段组（FieldArray）的 `value-change` 带上这次是哪一种行变更：`FieldArrayValueChangeDetails` 新增可选字段 `mutation`，类型为 `FormArrayMutation`。增、删、移分别是 `{ type: 'insert', index }`、`{ type: 'remove', index }`、`{ type: 'move', from, to }`，整份写值 `setValue` 是 `{ type: 'replace', length }`；受控值从外面换掉、表单重置这类不是字段组发起的变化不带。表单（Form）的 `values-change` 同步新增 `arrayMutation: { name, mutation }`，只在这次值变化来自某个字段组的行变更时带上。值存在外部 store 的宿主据此迁移行级状态。
