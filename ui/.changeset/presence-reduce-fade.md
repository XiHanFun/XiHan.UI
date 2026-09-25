---
'@xihan-ui/core': major
---

减弱动效下退场不再瞬时：Presence 照样等退场动画播完，减弱档的退场关键帧去掉位移、只剩 120ms 淡出，浮层、对话框、抽屉等在减弱动效下先淡出再卸载。Presence 不再读减弱动效偏好，`createPresence` 的 `config` 选项随之删除，调用处去掉这一项即可。
