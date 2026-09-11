---
"@xihan-ui/vue": major
"@xihan-ui/react": major
---

FieldControl 默认组合模式统一使用严格宿主检查：Fragment 内的唯一控件正常接线，零/多个节点及非空文本混排明确失败。需要作者自行绑定多个节点时必须显式设置 asChild=false，不再将无效结构默认为手工接线。
