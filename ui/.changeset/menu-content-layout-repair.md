---
'@xihan-ui/styles': major
---

修正 Menu、ContextMenu、Menubar 的作者内容排版：图标、正文和快捷键恢复 flex 同排，正式 item-text 负责长文省略，只有说明部件另起一行，子菜单箭头仍在主行末端。

移除展开项左侧色条及其 2px 预留边，展开背景改为中性灰。删除没有用途的 item-path-indicator、item-leading-size 及对应 group-label-leading 覆盖槽；不保留隐藏开关。M2 表面与无缩放位移动效继续生效。

三种菜单按真实文档示例补齐 LTR/RTL、图标文字快捷键同排、长文、无侧条及中性展开背景回归。
