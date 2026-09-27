---
'@xihan-ui/web-components': patch
---

Web Components 在连接之后才赋的 `default*` 不再被忽略：HTML 里的元素先被升级并连接、脚本排在之后的任务里才给 `defaultValue`、`defaultOpen`、`defaultWindow` 等赋值时，只要状态还没被写入（用户交互、方法调用、表单重置都算写入），元素按新的初值重建状态机，结果与连接前就写好相同；写入之后再改 `default*` 不影响当前值，只改变表单重置的落点，与 Vue / React 里「初值只取一次」一致。内容相同的新数组或对象不算换了初值。模板克隆出来、升级前就赋在实例上的属性值改在连接时写回，状态机建起来那一刻就读得到，不再等到首轮更新。
