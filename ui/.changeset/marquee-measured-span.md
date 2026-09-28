---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
---

Marquee 的速度按每秒像素数逐字成立：挂载后实测一份内容在滚动轴上的长度（随尺寸变化重量），连接层写成根上的内联私有槽 `--xh-_marquee-measured-span`，皮肤按它换算一圈的时长。此前长度取槽里的缺省值 600，位移却按轨道自身宽度算，同一个 `speed` 在 375px 窄窗约 38px/s、1200px 宽窗约 120px/s。使用者写了 `--xh-marquee-span` 仍以它为准。
