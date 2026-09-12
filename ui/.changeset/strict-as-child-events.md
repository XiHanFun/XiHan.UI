---
'@xihan-ui/vue': major
'@xihan-ui/react': major
---

CORE-15：组合宿主不合法时明确抛错；asChild 的零个或多个可挂载子节点不再报警后生成默认按钮。请提供唯一实际宿主，或在需要默认元素时移除 asChild。

元素旁并列的非空文本和数字同样明确拒绝，仅忽略空白、注释和条件占位，不再静默丢弃可见内容。React 按正式 peer 版本 19 从 props.ref 合并引用，删除 element.ref 废弃访问。

作者写在部件或 asChild 子节点上的事件处理器调用 preventDefault 后，不再执行部件内部动作。普通回调、通用 props 合并和 ref 生命周期保留原语义。
