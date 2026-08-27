---
"@xihan-ui/behavior": minor
"@xihan-ui/headless": minor
---

**新增** 选中原语 `applySelection` / `toggleSelectAll` / `rangeBetween`：带锚点的范围选与全选，纯集合运算，不碰 DOM。

`table` / `tree` / `transfer` 三处接上 Shift 范围选（此前只有 `listbox` 有）；`table` 另加 Ctrl/Cmd + A 全选。三处的裸点击语义一点不变——它们是复选框语义（点一下切换），与 `listbox` 的文件管理器语义（点一下替换）本来就不同，范围选是叠上去的新路径。

`listbox` 私有的那份范围选与全选改走共享原语，46 条既有测试原样通过。

**范围选带基线**：第一次按住 Shift 时把当下的选中拍成基线，后面每一下都从它重算「基线 ∪ 这一段」。只并不重算的话，连着按 Shift 就只能把选区越拉越大、往回点收不回来。

`tree` 的范围选按展开后的可见序取，折叠起来的子节点选不进去；级联模式不接范围选。`transfer` 的锚点跨到另一侧时退化成普通切换——两侧是各自独立的列表。
