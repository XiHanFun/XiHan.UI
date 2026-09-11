---
'@xihan-ui/core': major
---

状态机现在会在开发和生产模式下统一静态校验具名 action、guard 与 effect 引用，并递归检查组合 guard。组合子持有冻结的表达式快照，循环、访问器或畸形元数据会直接以 `INLINE_IMPL` 拒绝。实现必须是 implementations 分组自身的数据属性函数；继承成员、访问器和非函数值一律视为缺失，检查过程不会调用 getter。动态列表解析后也会一次取得并验证全部实现快照，再执行任何 action 或初始化 effect。

运行时缺少实现会先以原有 `MISSING_ACTION`、`MISSING_GUARD` 或 `MISSING_EFFECT` 进入诊断通道；没有其他停机异常时，随后抛出记录中 `detail.reason` 的同一个 `MachineError`，并始终停止服务。guard 不再静默退回 `false`，action 不再跳过缺项后继续执行，effect 也不会因列表后部缺项而先创建前部资源；缺项与回滚异常同时发生时会保留完整的 `AggregateError`。`inspect` 观察器的异常不会遮蔽缺项错误或阻止停机。
