---
'@xihan-ui/headless': minor
'@xihan-ui/styles': major
---

Cascader 的占位态按设计真源的占位态一节补齐：首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方），此前只是一行静态文字；已有候选时后台刷新保留上一帧，列与搜索候选列表按 `micro` 淡到 `--xh-state-disabled-opacity`，淡的是列不是浮起面。占位不再设最小高，内容多高就多高。破坏性：移除 `--xh-cascader-empty-min-h` 与 `--xh-cascader-loading-min-h`（缺省是字面量 5rem）。
