---
"@xihan-ui/headless": major
---

**dialog 不再发 `data-position`。** 这个属性恒为 `'center'`：没有入参改得动它，取值集合只有一个元素，自带皮肤里没有一条规则读它，它对任何人都不产生任何信息。半成品不留在公开面上等，删掉。

**破坏性：`[data-scope='dialog'][data-part='positioner']` 上不再有 `data-position`，选它的 CSS 一条也不会再命中。** `data-*` 没有 IDE 提示，选择器失配既不报错也不降级——请在自己的代码库里全文搜索 `data-position`，凡是选中 dialog 的都删掉这一段（居中是它唯一的落位，不必再限定）。

`image-cropper` 的 `crop-handle`（八个方位）与 `tour` 的 `positioner`（`anchored` / `center`）照旧发 `data-position`，那两处是真取值，一个字没动。

要按位置分档（顶部对齐之类）得先补一个 `position` 入参，那是新功能、走 minor；在补上之前，DOM 上不留一个谁也读不出信息的常量。

## 默认渲染逐像素未变

dialog 的定位由皮肤的 `inset` 直接摆，从来不读这个属性。
