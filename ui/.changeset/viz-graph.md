---
"@xihan-ui/viz": minor
---

新增子路径 `@xihan-ui/viz/graph`：关系布局。

- `forceSimulation(count, links, options, initial?)`：力导模拟。速度 Verlet 积分，α 约 300 轮从 1 衰减到 `alphaMin`；力有连线弹簧（强度缺省 1 / 两端较小的度数）、电荷（四叉树 Barnes–Hut，θ 缺省 0.9）、向心、碰撞（四叉树）与朝 x / y 定位。初始位置按叶序排开，重合时的微扰用种子随机数，同样的输入永远得到同样的布局。
- `run()` 同步跑到收敛；`tick(n)` 逐轮推进；`fix` / `release` 钉住与松开节点，`reheat` / `setAlphaTarget` 供拖拽时局部重算。
- 四叉树平铺在类型化数组里、逐轮复用缓冲：1 千个节点、2 千条连线同步跑完 300 轮实测约 290 ms。
- `circular(count, { center, radius, group, groupGap })`：环形布局，按分组聚在一起、等角排在圆上，组间多留空当，自 12 点方向顺时针。
- 不从包入口导出，子路径单独计体积：实测 3.18 kB（gzip），限额 3.5 kB。
