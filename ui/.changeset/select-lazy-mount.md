---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Select 新增 `lazyMount`（缺省 false，行为不变）：列表内容第一次展开时才挂载，之后常驻、来回开合不重建。页面上 Select 很多时，收起态每个实例都背着一整份条目，挂载开销大半在这里——300 个各带 20 个条目、传了 `collection` 的 Select 挂载由约 530ms 降到约 183ms。打开前的选中文字与收起态连打（焦点在触发器上直接打字选中）改按 `collection` 计算；没给 `collection` 时打开前选中文字退回值本身、连打不生效。headless 的 connect 新增 `isContentMounted()`，机器 context 记 `opened`。Web Components 里把条目写进 list 里的一个 `<template>`，第一次展开才克隆（未开 lazy-mount 时模板也照常克隆进来）。

自绘滚动条在 `disabled` 时容器暂缺不再报「找不到滚动容器」诊断：列表懒挂载、还没展开过时轴先禁用着。
