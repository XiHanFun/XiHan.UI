---
'@xihan-ui/vue': major
---

修正 Vue DatePicker 挂载在 iframe 或其他 Document 时的运行时归属。

组合组件现在以实际渲染出的根节点延迟绑定 Scope，并在机器启动前创建同一 Document 的 RuntimeConfig、LayerRegistry、Portal 与滚动条。SSR 与客户端首帧均在来源位置保留面板，运行时就绪后再搬到所属 Document 的默认或显式 Portal 目标，保留内容与实例 ID；真实 hydration 回归验证两端结构一致、内容唯一和主题桥接。

未配置 `portalContainer` 的 iframe 挂载和显式同 Document 目标均可用；目标 getter 延迟到真实根和同轮兄弟 ref 均已提交、Portal 真正选址时才读取。显式跨 Document 目标会明确失败，不回退到全局 `document`，核心消解层的同 Document 约束保持不变。直接调用 `useDatePicker` 的既有 ambient Scope 行为不变。

DatePicker 不再把“字段存在但 getter 返回 `null`”解释成默认 Portal。需要默认落点时请省略 `portalContainer`；显式提供时必须在真实根就绪后返回同一 Document 的 `Element`。这是对既有 `null → body` 用法的破坏性收紧，因此本 changeset 为 major。
