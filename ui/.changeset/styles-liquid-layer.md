---
'@xihan-ui/styles': minor
---

新增共享液态层 `@xihan-ui/styles/liquid.css`（已含在主入口）：`data-material="liquid"` 下为投影了 `data-xh-liquid` 的部件提供液态面的底、交互阶梯、1px 亮边与投影，亮边按光源方向落在朝光一侧，RTL 下缺省光源在右上。FloatButton 与 BackTop 的缺省 outline 触发器在该轴下换成液态面，覆盖槽照常生效；standard 档下外观不变。

float-button.css 与 back-top.css 各加一块液态档规则（把 Action Control 的底、字、边、影与高光槽指向液态层，并声明背景滤镜），体积基线随之上调。
