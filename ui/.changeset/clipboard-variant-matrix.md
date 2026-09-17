---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**Clipboard 复制钮接入 Action Control 形态矩阵与按压通道。** 连接层的 copy-trigger 新增稳定属性
`data-xh-action-variant`（缺省 `subtle`，只有 `solid` 才品牌实心），root 的 `data-variant` 不传时显式落
`subtle`；机器新增按压通道，Space / Enter 与触屏按住期间 copy-trigger 投影 `data-pressed`（禁用或写入在途
不进入），键盘表新增 `clipboard.kbd.press`。皮肤删除六支形态私有槽、四档形态块、自写的 hover / active /
:disabled 面与粗指针 ::after，颜色、0.97 按压缩放（此前锁 `scale: none`）、换底与 44px 命中区由家族配方给出；
公开槽 `--xh-clipboard-copy-trigger-bg / -bg-hover / -bg-active / -bg-disabled / -fg / -border /
-border-hover / -border-disabled / -shadow-hover` 改为桥接到矩阵之前（solid 不再悬停抬影，`-shadow-hover`
缺省 none）；复制成功的前景经桥接槽换，悬停与按下不再退回平时字色；输入框焦点边改为
`--xh-border-control-focus` 不随 tone；加载环由 pill 改 circle。
