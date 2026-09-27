---
"@xihan-ui/viz": minor
---

`@xihan-ui/viz/hierarchy` 加上整齐的树与树状图。

- `tree(root, { size | nodeSize, separation })`：Reingold–Tilford 整齐的树，按 Buchheim、Jünger 与 Leipert 的线性时间做法实现；父节点落在第一个与最后一个子节点的正中，同层相邻节点至少隔开一份间隔（缺省同父 1 份、不同父 2 份），y 按深度排开。
- `cluster(root, { size | nodeSize, separation })`：树状图，叶子一律落在最底一层、等距排开，父节点在子节点的正中、比最高的子节点高一层。
- 两者只看结构，不需要先 `sum()`；`size` 缩放到整体尺寸，`nodeSize` 按固定间距排、根落在原点。
- 子路径实测从 4.39 kB 涨到 5.58 kB（gzip），限额从 4.5 kB 调到 6 kB。
