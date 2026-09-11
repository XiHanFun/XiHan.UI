---
'@xihan-ui/core': major
---

ScrollLock 改为只接受 `RuntimeConfig.scrollRoot()` 的显式结论：返回 `null`、`body`、`documentElement` 或 `scrollingElement` 都表示页面，返回其他已连接 HTMLElement 表示该容器。删除自动扫描页面后代与目标兜底；同一 Document 的并行锁必须解析到同一规范化目标，不同目标会明确失败。

`RuntimeConfig.scrollRoot` 从可选字段改为必填函数。`createRuntimeConfig()` 会默认注入 `() => null`，手写 RuntimeConfig 的调用方必须迁移：页面滚动写 `scrollRoot: () => null`，自定义滚动容器返回所属 Scope Document 中已连接的原生 HTMLElement。

每轮锁现在精确保存双轴滚动位置、所有受影响内联样式的值与优先级，以及既有 gutter 变量。锁声明使用 `important`，释放时仍精确还原作者原值与原优先级；业务在锁期间改过的样式只要不再等于本轮写入值就会保留。滚动条补偿直接读取页面或容器盒几何，`scrollbar-gutter: stable` 已预留空间时不重复补偿。

初始化失败会逆序回滚；最终释放先终结引用计数与 epoch，再完整尝试清理并聚合异常。目标解析、获取和释放由同一个 Document 事务守卫串行化，动态 getter 不能重入改写当前 epoch。页面滚动以 instant 行为恢复，也不再安装无效果的 viewport 与 orientation 监听。
