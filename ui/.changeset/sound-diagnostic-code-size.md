---
'@xihan-ui/core': minor
'@xihan-ui/sound': patch
---

Core 新增可独立 tree-shake 的 `DIAGNOSTIC_WARN` 单项诊断码；Sound 复用该入口与内部声部/服务构造器，保持诊断通道和声音配方不变，同时避免为一个码保留整张诊断表。
