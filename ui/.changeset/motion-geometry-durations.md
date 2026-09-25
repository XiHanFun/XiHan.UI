---
'@xihan-ui/tokens': minor
---

新增几何动效的时长与幅度令牌，出现、换色与几何变化各有专属时长。

- `--xh-motion-duration-move`（200ms）：元素换位与尺寸变化，如选中指示器滑移、进度增长、堆叠重排。
- `--xh-motion-duration-expand` / `--xh-motion-duration-collapse`（200 / 120ms）：内容展开与收起。
- `--xh-motion-travel`（100%）：面板从所在边整条推入推出的位移幅度。
- 以上令牌在减弱动效下归零（时长 1ms、位移 0px）。

`--xh-motion-duration-nudge` 由 200ms 改为 120ms，承担紧跟操作的小幅几何变化：开关滑块、勾选标记、展开箭头、拖拽让位、查看器缩放平移。组件库此前没有消费这支令牌；自行引用它的样式会快一档。
