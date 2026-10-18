---
'@xihan-ui/headless': minor
---

分栏（Splitter）的分隔条支持双击折叠：双击把它一侧可折叠的面板折到 `collapsedSize`（缺省 0），再双击回到折叠前的尺寸，Vue、React 与 Web Components 同时可用。键盘上照 WAI-ARIA 窗口分隔条的做法用 Enter，与双击是同一件事。

两侧怎么挑：两侧有折叠着的先展开它，否则折叠前一块，前一块不可折叠时折叠后一块；两侧都不可折叠时双击与 Enter 都不接。此前 Enter 只管分隔条前面那块，前一块不可折叠、后一块可折叠时（比如三栏布局右侧可收起的面板）按 Enter 没有反应，现在管到后一块。
