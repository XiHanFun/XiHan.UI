---
'@xihan-ui/designer-shell': minor
---

新增 `@xihan-ui/designer-shell`：画布式设计器共用的界面零件，只出 Web Components，是本库「组件三端齐备」惯例经批准的例外。零件不持有文档、不碰历史栈，只吃数据、吐事件；坐标只认 `@xihan-ui/designer-kit` 的视口。

- `defineDesignerShell()` 注册全部零件，`defineDesignerShellElement(tag, ctor)` 按需注册，登记表 `DESIGNER_SHELL_ELEMENTS`；元素不在 import 时注册。
- 子入口 `./locale` 的 `designerShellZhCN` 是零件的中文文案，各产品并进自己的语言包；`./style.css` 是零件的样式，只消费语义令牌。
- 零件按属性面板、问题列表、小地图、物料面板与拖放、变换覆盖层、标尺与参考线、外框的顺序陆续加入。
