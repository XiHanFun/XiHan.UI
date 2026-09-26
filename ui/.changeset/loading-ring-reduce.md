---
'@xihan-ui/styles': patch
---

Clipboard 在减弱动效下复制在途时没有任何表达（圆环一直停在透明）：改为圆环不转、整圈换成虚线，延迟之后照常淡入，图标照常淡出。DownloadTrigger 同一处保留文字隐去与圆环淡入，只停转圈。
