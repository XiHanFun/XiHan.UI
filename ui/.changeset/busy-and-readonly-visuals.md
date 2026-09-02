---
"@xihan-ui/styles": minor
"@xihan-ui/web-components": minor
---

**在途与只读两档补上视觉，默认渲染会变。**

**在途（`download-trigger` 的 `preparing`、`clipboard` 的 `copying`）此前只换指针形状。** 触屏上没有指针：手指按下去到结果出来之间屏幕上什么都不变，用户只会接着点。两处现在各转一枚圆环，与 `popconfirm` 的确认钮、`switch` 的滑块同形——在途在全库读起来是同一件事。圆环是按钮里的一个 flex 项，按钮的起始边不动，只往后长一截。

`clipboard` 那处顺带去掉了 `opacity: 0.7` 这个裸值：它既没有令牌也没有覆盖槽，改不动，深色档下压出来的灰还会掉到读不清。

减弱动效（系统偏好与作者打的 `data-motion="reduce"` 两条通道）下圆环停下并整圈换成虚线，静止的形状仍读得出「还没好」。

**`switch` 的只读态此前与可操作态完全同貌**，用户会去按一个按不动的开关。现在指针不摆手型、选中档的轨道换成中性底、滑块收掉那层浮起的投影——投影是「这颗按得动」的信号。不借禁用那档灰：只读的值仍要读得清，也仍会随表单提交。滑块停在哪一端不变，值本身仍由位置这条非颜色通道读出。

**新增 4 个使用者覆盖槽**：`--xh-download-trigger-loading-duration`、`--xh-clipboard-loading-duration`、`--xh-switch-bg-checked-readonly`、`--xh-switch-thumb-shadow-readonly`。
