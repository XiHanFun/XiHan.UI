---
'@xihan-ui/styles': minor
---

Select 保持实体触发控件，并把选项 popup 迁入 M2 磨砂表面。content 的背景、前景、描边、阴影、
backdrop 与顶边高光分别由现有 `--xh-select-content-*` 槽和新增的
`--xh-select-content-backdrop` / `--xh-select-content-highlight` 控制；footer、分组标题、空态与加载态
改用同一磨砂表面的次要前景，后继分组通过 `--xh-select-group-separator-color` 画实体分隔线。

选项使用不猜测作者内容的弹性行：图标、头像、正文与尾部节点保持 DOM 顺序，正式 `item-text` 占据
剩余宽度并截断长文，`item-indicator` 以自动逻辑边距固定到末端。选中行不再使用透明底，新增
`--xh-select-item-bg-selected` 控制不透明品牌淡底，焦点环、强调文字与勾选标记可以同时辨认；
`--xh-select-item-bg-pressed` 提供独立按下反馈。禁用项与禁用勾选标记统一退到失效前景并显示不可用游标。

popup 改用 `xh-overlay-slide-in` / `xh-overlay-slide-out`：positioner 先清零四个方向变量，再按物理
placement 激活一侧，首帧落位后只做 opacity 与短位移，不再缩放。旧关键帧定义保留，不改变其他组件。
多选标签继续直接渲染 Tag 的 root/label/close-trigger，外观由已发布的 Tag M1 皮肤负责。

皮肤体积变化来自材质、弹性作者内容布局与状态反馈；基线只登记本组件，10% 容差保持不变。

皮肤体积（去注释、压空白）：前一提交源码 18815 字节，当前 20697 字节；登记基线 22050 → 20697，只更新本组件，10% 容差保持不变。
