---
'@xihan-ui/styles': patch
---

修复引入无层样式 `index.unlayered.css` 时，RadioGroup、CheckboxGroup 与 Steps 的条目被拉满整行：

- RadioGroup、CheckboxGroup 横排（`orientation="horizontal"`）时条目一行一个竖着排，现在按内容收宽、排在同一行；CheckboxGroup 竖排时条目与全选格的命中区不再延伸到整行空白处。
- Steps 的触发器恢复「序号 + 标题 / 说明」两列排版并按内容收宽，横排的连接线不再被压到最小长度。

有层的 `index.css` 不受影响。
