---
'@xihan-ui/core': patch
---

`trackListMotion`：`channel: 'transform'` 时，进场关键帧还没播完的条目照样做换位补偿。此前不论通道一律跳过正在播关键帧的条目，可 transform 上的换位与写在 translate 上的关键帧本来就互不覆盖；跳过会让推入途中的条目在列表变化时原地一跳。translate 通道照旧跳过。
