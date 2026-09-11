---
'@xihan-ui/core': major
---

`createDismissLayer` 的公开参数保持不变，内部从每实例三条 Document 监听改为每 Document 一套共享 Hub。每份显式 LayerRegistry 按对象身份拥有独立 lane；首个参与者同步事务化安装监听，最后参与者释放时完整卸载。同一 registry 的同一 Layer 重复创建 DismissableLayer 现在明确失败。

pointer 与 focus 在业务回调前冻结一次 composed path 和全部 lane snapshot，再按各 lane 原始栈顶到栈底生成关闭计划。计划 getter 改变 snapshot 时立即放弃整条 lane，不再读取更低层。无参与者、未武装、无节点、命中层内或 surface 边界、表决否决、受控关闭后未退栈，以及关闭期间出现额外层栈变化，都会阻断更低层；执行中动态出现的 surface 会在关闭所属层后停止。候选完整返回 `onDismiss` 且 Layer 确实退栈后，协调器才按新的严格前缀继续下一候选。Escape 每条 lane 只处理事件开始时的原始栈顶。

Hub 对整次 Document 派发加重入锁。派发期间最后参与者释放会延迟到 finally，回调同步新建的参与者复用原 Hub；一条 lane 抛错不会截断其他 registry lane，所有异常在末尾按发生顺序报告。监听、参与者武装、动画帧与清理全部来自 Scope 所属 realm，初始化和释放继续采用 LIFO 全量清理，单错原样、多错聚合并保留首错 cause。
