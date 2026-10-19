---
'@xihan-ui/headless': patch
---

表格（Table）树形表换位后的读屏播报说放进了哪一层。原先拖放与 Alt + 方向键都只播「第几位，共几项」，位次是层内的、总数却是全部可见数据行，用 Alt + 左右键改了层级也听不出去了哪儿；现在树形表（声明了 `tree`，或有行带 `parentId`）播「已将某某移入某某，位于第几位，共几位」，位次与总数按新的那一层的兄弟行算，父行的名字经 `translations.item` 取，放到根层时用 `translations.rootLevel`。平表的播报不变。
