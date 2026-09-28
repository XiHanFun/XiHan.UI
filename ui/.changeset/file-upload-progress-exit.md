---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

FileUpload 的传输收尾与文件列表补上动效。传完那一刻进度条不再当场收起：填充先走满（move），随后整条淡出（exit，延后一个 move），淡出播完机器才让连接层给进度条写 `hidden`；行首对号在同一时刻淡入，与淡出的条子交叉。进度条的显隐改由连接层的 `hidden` 表达（没在传也没刚传完的一律 `hidden`），皮肤只按 `data-state='uploading'` 给不透明。填充的平移乘 `--xh-direction-sign`，撤掉 `:dir(rtl)` 分支。

文件列表接上 core 的 `trackListMotion`：首帧就在的文件直接呈现（列表在动效接上之前带 `data-instant`），之后收下的一批按到达顺序错开进场，删掉的那一行由替身在原处淡出，其余行滑到新位置；列表晚于根挂上时，后来出现的条目照常进场。替身的 `data-state` 换成 `closed` 后，传完 / 失败的行首标记与失败配色从进度条的 `data-state` 读回，退场途中文件名不再往行首跳。
