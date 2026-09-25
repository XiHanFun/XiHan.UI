---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增与渲染器无关的场景。

- 标记：`rect`、`arc`、`line`、`area`、`symbol`、`path`、`text`、`group`，判别键为 `kind`。标记只带几何参数与语义着色引用（色槽 1–8、色阶位置、语气、涨跌、符号、纹理序号），不含任何颜色值；SVG 与 Canvas 消费同一份场景。
- `createScene`：分为 back / data / front 三层，校验标记键在整个场景内唯一（含分组里的子标记）与着色引用的取值，然后整体冻结。`version` 只在几何变化时递增，过渡中的中间帧另带 `frame` 进度。
- `diffScenes` 按键求出进入、更新、退出，更新标出有无变化；`sceneMarks` 按层序展开全部标记并累计分组平移；`markPath` 把形状标记转成绝对坐标的路径，`curveOf` 按名字取曲线。
- `arc` 与 `roundedBar` 只校验自己的几何字段，带着其他字段的对象（如标记）也能直接传入。
