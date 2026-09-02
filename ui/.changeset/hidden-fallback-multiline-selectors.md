---
"@xihan-ui/styles": patch
---

**修复**七个部件的收起态失效：声明了 `display` 却没把 UA 的 `[hidden] { display: none }` 还回去，作者给节点加 `hidden` 它照样占着版面。

每份皮肤都在文件末尾补一条 `[data-part=…][hidden] { display: none }` 把这件事还回去，守它的门禁却只把带 `{` 的那一行当选择器——多行逗号列表里排在前面的选择器整段进不了判据，`[data-part='prev-trigger'],` 换行再写 `[data-part='next-trigger'] {` 的写法只有 next 被查过。判据改成规则块前每一条逗号分隔的选择器各判各的（拆分只在括号外的逗号处断开，`:is(:hover, [data-highlighted])` 里那个逗号属于伪类参数），并把注释先抹成等长空白，注释里成对出现的 `{}` 不再把块层级算歪。同时收窄免检口径：免检是留给 presence 那类落在部件自身、要把退场播完才卸载的动画，伪元素上的加载环转的是伪元素自己的盒子，宿主该消失照样消失，不再拿它当宿主缺兜底的理由。

补上兜底的七处：`image-viewer` 的 prev-trigger（同一对翻页钮里 next 早就有）、`popconfirm` 的 confirm-trigger（cancel 早就有）、`side-nav` 的 list 与 branch-trigger、`tree` 的 item-checkbox（branch-checkbox 早就有）、`switch` 的 thumb、`spinner` 的 root——最后这份皮肤此前一条兜底都没写。
