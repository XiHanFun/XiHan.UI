---
'@xihan-ui/designer-kit': minor
---

新增 `@xihan-ui/designer-kit`：画布式设计器的公共内核，供打印、流程、表单、报表四款设计器共用。零运行时依赖、import 无副作用、不碰 DOM，文档与编辑操作的具体形状由使用方决定。

- `createHistory({ document, apply })`：撤销重做历史栈，只依赖「应用一个操作，返回新文档与逆操作」这一个函数。`execute` 把一组操作记为一步，同一合并键的连续执行并成一步（`seal()` 封口，`mergeWithin` 加时间窗），`begin` / `commit` / `rollback` 与 `transact` 把一段交互记为一步，`limit` 限制撤销步数；应用失败时文档与栈都不变，`subscribe` 在每次变化后通知。
- 视口：屏幕与世界坐标互转、以锚点缩放并限制缩放范围、适配内容、居中、按需显露、限制平移范围，以及滚轮滚动量到缩放倍数的换算。
- `snapRect`：移动矩形的左 / 中 / 右、上 / 中 / 下三条线吸到阈值内最近的目标线，给出位移与参考线，没吸到目标时可退到网格。
- `alignRects` / `distributeRects`：按选区包围盒贴边或居中，沿一个方向等空隙或等中心距分布。
- `selectInMarquee`：按完整包住或碰到即选挑出框里的元素。
