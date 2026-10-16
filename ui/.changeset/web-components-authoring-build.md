---
'@xihan-ui/web-components': minor
---

`@xihan-ui/web-components/authoring` 的 `createGeneratedElement(doc, tag, attributes?, children?)` 可在建节点时同时写上属性、放入子节点（字符串作为文本）；新增不带生成标记的 `createAuthoredElement`，用代码搭库内元素的 Light DOM 结构（`data-xh-part` 角色节点、空状态与提示框里的自定义内容）时用它，带生成标记的子节点会被宿主当作自己生成的节点收走或略过；新增 `setAttributes(element, attributes)` 与 `setText(element, text)`，按同一张属性表 `ElementAttributes` 更新属性与文本，值没变时不写：`false` 与 `undefined` 删除该属性，`true` 写成空串。库内元素监听子树里角色节点的增删与声明属性的改写来重新接线，第三方元素每轮更新都重写同样的值会白白触发重新接线。
