---
'@xihan-ui/headless': patch
---

工具条的条目写了 `data-tone` 时，收进「更多」菜单后菜单项带同一语气。此前条目在工具条上按语气显示（如破坏性操作标红），收进菜单后就变回普通菜单项。`ToolbarOverflowItem` 新增 `tone`。
