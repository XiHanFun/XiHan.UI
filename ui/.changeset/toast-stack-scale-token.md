---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
'@xihan-ui/headless': major
---

Toast 叠放的收拢比例令牌化：新增 `--xh-motion-scale-stack`（每往后一层保留的比例，缺省 0.95，减弱动效下为 1），后层按层深逐层收拢改由皮肤计算；减弱动效下层与层只靠位移分开，不再缩放。堆叠控制器只把层深写进私有槽，`--xh-toast-scale-collapsed` 回到作者覆盖槽的本分（此前由脚本写成内联样式，作者改不动）。`createToastStackController` 删去 `scaleFactor` 选项，要改收拢比例覆盖 `--xh-motion-scale-stack`。
