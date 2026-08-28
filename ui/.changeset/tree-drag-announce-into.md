---
"@xihan-ui/headless": minor
---

**改动** `tree` 的拖拽播报报出落脚处。树的搬家是换父，位次说不清去向：把「甲」拖进「收件箱」
与拖进「归档」，只要都落在第 1 位，读屏听到的是同一句 `Moved 甲 to position 1 of 3.`，
用户无从知道东西搬到哪儿了。现在报 `Moved 甲 into 收件箱, position 1 of 3.`，父为 null
的根层报 `the top level`。

**新增** `DragAnnounceInput.into` 与 `DragTranslations` 的 `movedInto` / `droppedInto` /
`canceledInto` / `rootLevel`。`into` 给 `null` 是根层，容器名走 `rootLevel`；不给这一位
表示这个组件没有层级可言——`table` 的行与列、`tabs` 的标签是一维重排，位次已经够用，
三处播报一个字都没变。

作者只本地化了 `moved` / `dropped` / `canceled` 的，树上仍说他的话，只是不报容器；
要报容器再补 `movedInto` 那三句。播报绝不会一半母语一半英文。
