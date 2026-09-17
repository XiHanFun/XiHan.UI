---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**DownloadTrigger 接入 Action Control 形态矩阵与按压通道。** 连接层的 root 新增稳定属性
`data-xh-action-variant`（缺省 `subtle`，只有 `solid` 才品牌实心），`data-variant` 不传时显式落 `subtle`；
机器新增按压通道，Space / Enter 与触屏按住期间 root 投影 `data-pressed`（禁用或取数在途不进入），键盘表
新增 `download-trigger.kbd.press`。皮肤删除六支形态私有槽、四档形态块、三档尺寸块、自写的 hover /
active / :disabled 面与整段自写盒型（display / 高度 / 内距 / 边 / 底 / 字号 / 手型 / 过渡），颜色、几何、
0.97 按压缩放（此前锁 `scale: none`）、换底与 44px 命中区由家族配方给出（没写内容的按钮 ::after 被兜底
字形占着，粗指针命中区改由空着的 ::before 扩）；公开槽 `--xh-download-trigger-bg / -bg-hover / -bg-active /
-bg-disabled / -fg / -border / -border-hover / -border-disabled / -shadow-hover / -h / -px / -gap /
-font-size / -icon-size` 改为桥接到配方之前（solid 不再悬停抬影，`-shadow-hover` 缺省 none）；取数在途
的圆环颜色改取加载态前景；加载环由 pill 改 circle。
