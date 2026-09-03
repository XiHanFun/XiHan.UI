---
"@xihan-ui/web-components": minor
---

**`<xh-pagination>` 交出页码序列与四项派生值，外加四个命令：分页的窗口数学不必再由作者复刻一份。**

Vue 侧 `XhPaginationRoot` 一直把 connect 的产出经插槽作用域交出去（`pages` / `pageItems` / `pageRange` / `slice` 等），自定义元素这侧一项都没有：作者手上只有 `page-change` 里的一个页码，几号页、哪里该折成省略号、省略位算哪一侧，全得自己按当前页、总页数与 `sibling-count` 再推一遍。这段窗口口径（首尾恒显几页、空隙隔一两页时不折、贴边时窗口怎么变宽）住在库里，外面每一份复刻都是一条会在库里调整时静默走样的副本。

新增六个只读属性：

| 取数口 | 是什么 | 机器尚未建起时 |
| --- | --- | --- |
| `pages` | 页码与 `'ellipsis'` 交替的序列 | `[]` |
| `pageItems` | 同一串，但省略位带着被折叠的那几页与所在侧 | `[]` |
| `currentPage` | 夹进合法区间之后的当前页（`page` 属性是入参，可能缺席、可能越界） | `1` |
| `currentPageSize` | 此刻每页几条（非受控那份住在机器里，别处读不到） | `0` |
| `totalPages` | 总页数；无数据是 0 页，不是 1 页空页 | `0` |
| `pageRange` | 当前页的条目区间，末页不满时右端已收成实际条数 | `{ start: 0, end: 0 }` |

外加四个命令：`setPage(page)`（越界夹回合法区间）、`setPageSize(size)`（页码跟着换算，改档前第一条仍留在页内）、`slice(data)`（按当前页从整份数据里切出这一页）、`closeEllipsis()`。机器要到进文档才建，还没建时读到的是上表那份空值、命令是空操作，都不抛错。

**什么时候重读**：取数口现算，读到的恒是此刻那一份。`page-change` 与 `page-size-change` 覆盖了运行期会改动序列的全部输入，在它们的处理器里重读即可；改 `count` / `sibling-count` 这类作者自己写的属性，写完当场重读。受控（写了 `page` 属性）时得先把新页码写回 `page` 再读——受控下当前页住在属性里，不写回读到的还是上一页那一份。

`openEllipsis`（此刻摊开的是哪一侧）刻意没露：它随悬停延时、Escape 与点外面变化，而元素没有一条对应的事件，作者读得到却无从知道什么时候该重读——那与自己复刻一份是同一个坑。摊开省略号所需的那几页从 `pageItems` 的省略位上按侧取即可。`goToPrevPage` / `goToNextPage` 也没露：`prev-trigger` / `next-trigger` 两个部件本就是这件事的入口，真要自己接按钮，`setPage(currentPage ± 1)` 与它们逐字等价。
