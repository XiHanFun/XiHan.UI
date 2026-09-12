---
'@xihan-ui/web-components': minor
---

所有实际使用物理 Portal 的 Web Components 宿主新增 property-only `portalContainer`，实例解析器优先于最近 `xh-config` 与运行时默认目标。
显式实例解析器返回空值、跨 Document 或未连接目标时会严格失败；锚定、多根与多实例 Portal 继续复用 Core 租约生命周期。
