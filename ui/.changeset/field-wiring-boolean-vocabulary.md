---
"@xihan-ui/vue": patch
---

**修复**复选框与开关套进表单字段后说明与错误文本念不出来：给了默认插槽时封装根是外面那个 `<label>`，`XhFieldControl` 把整份接线合在它身上，焦点却在里面那颗 `button` 上，读屏只念焦点所在节点的描述，`aria-describedby` 与 `aria-invalid` 因此永远播报不出来。两个封装改为在按钮上取 `useFieldStateWiring()`；名字同时补上 `useFieldLabelWiring()`，文字那段带 id，按钮的 `aria-labelledby` 写成「字段的标签 + 组件自己那段文字」，两截都念得到。没给文字的用法一个字节不变。

布尔状态属性的名字改由门禁守住：`state-vocabulary.json` 的 `boolean` 表此前从没有任何脚本读过，7 条登记对着 connect 实发的 104 种属性，「同一含义只用一个名字」无从落地。判据补成两头都查——发了没登记即报，登记了没人发算名单过期——并把实发的 97 个补登进表，逐条写明语义。
