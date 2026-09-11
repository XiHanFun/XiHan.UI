---
'@xihan-ui/react': patch
---

React Portal 现在区分“祖先 host ref 尚在本轮提交中”与“显式视觉来源确实缺失”。祖先 source 首次为空时
会让当前 layout 提交完整附着一次，并在绘制前同步复核；复核后仍为空继续明确失败，不生成替代 marker、
不改挂 body，也不让未桥接的实例壳继续运行。

Select、Combobox、DatePicker、Mention、TimePicker 与 TreeSelect 改用各自真实的 trigger/control/input
定位锚点作为视觉来源；Menubar 按菜单 value 从既有触发器登记表读取来源。Pagination 的省略面板在省略位
尚未出现时使用真实 nav 根作为稳定视觉来源，定位仍由 ellipsis trigger 决定。其余显式 source 浮层逐一
复验，局部主题桥接与原有定位、焦点和消解逻辑不变。
