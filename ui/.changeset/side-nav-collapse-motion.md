---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

SideNav 折叠 / 展开：整栏宽度按 move 过渡，放在 Layout 侧栏里时与侧栏同步；折叠进行中根投影 `data-animating`，行文字、展开箭头与分组标题先淡出、宽度落定才裁成图标栏（展开时落定之后才淡入），分组标题在图标栏里留着高度并画一道细分隔，行不再上下跳。分支箭头按书写方向转向（rtl 下收起指向左侧）。折叠态弹出分支改按锚定列表的 `xh-overlay-slide-in / out` 进退场。皮肤体积随之增长（side-nav.css 约 2 KB）。
