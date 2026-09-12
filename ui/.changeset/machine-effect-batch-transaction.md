---
'@xihan-ui/core': minor
---

状态机现在会事务化初始化同一状态节点的 effect 批次。后一项 effect 初始化失败时，已取得的 cleanup 会按资源取得逆序完整回滚，不再遗留未登记到服务清理表的资源。成功挂载后的正常清理也统一改为资源取得逆序。

路径清理会先摘除登记，返回 `void` 的 effect 也会占用状态路径，同一路径的重复挂载则直接报告 `DUPLICATE_EFFECT_PATH` 不变式错误。停机会立即进入 `Stopped`、清空事件与 tracker 队列，再清完全部 effect 并执行 machine exit。因此清理抛错不会重复执行，cleanup 或 exit 内的 `send` 也不会重新推进机器，终态服务也不会因宿主重复 mount 而复活。

初始化、清理与 exit 的多项异常会在继续清理后完整聚合报告，最外层 `MachineError` 通过 `cause` 保留原始异常链。抛出路径与诊断通道共享同一份聚合结果。

effect 执行前会先占用状态路径，防止机器内部的同路径批次相互覆盖。服务本身只接受一次宿主 mount；`Started` 期间无论当前有无 effect，同步重入 mount 都会以 `DUPLICATE_SERVICE_MOUNT` 服务级不变式崩溃并清理。setup 内同步停机时，该调用迟到返回的 cleanup 会当场释放，后续 entry 与根 effect 不再执行。`null`、`undefined` 与非 `Error` 抛出值都会保留原始 `cause`，不可格式化的值使用稳定诊断文案。

首次 mount 期间的 `send` 会先按 FIFO 排队，等 state effect、machine entry、根 effect 与 state entry 完整提交、tracker 同步完成后再消费；初始化失败则连队列一起清空。内部初始化来源和根 effect 改用不可与用户状态路径冲突的标识，`__init__` 因此可作为正常初态并同时挂载根 effect。

公开的 `MachineErrorCode` 新增 `DUPLICATE_SERVICE_MOUNT` 与 `DUPLICATE_EFFECT_PATH`，`MachineError` 构造器新增可选 `ErrorOptions`，用于暴露标准 `cause` 链。
