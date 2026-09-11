---
'@xihan-ui/styles': major
---

Menu 内容面与箭头使用同源 M2 磨砂、实体前景、边界与浮层投影。进退场沿实际 placement 短移淡变；各层先清零四向变量，避免嵌套继承斜移。

条目保留 flex 主行与作者的真实节点顺序，图标、正文及快捷键同排；正式 item-text 占剩余宽度并截断，item-description 独占第二行。子菜单箭头位于主行末端。展开项采用中性淡底，无侧条、默认品牌蓝底或字重变化。

删除 --xh-menu-item-active-font-weight；需要定制展开项底色时使用 --xh-menu-item-bg-active。路径条与虚拟 leading 列不作为公开能力保留。独立的 checkbox/radio 菜单项仍待行为与可访问语义一起实现；作者可以自行显示快捷键提示。
