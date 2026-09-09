---
"@xihan-ui/headless": patch
---

**`image-viewer` 底部那条控件带改报 `role="group"`，不再报 `role="toolbar"`。**

`connectImageViewer` 的 `getToolbarProps` 一直发着 `role="toolbar"`，可整份连接层里 `tabindex` 只出现一处（`content` 上的 `-1`）。`toolbar` 这个角色承诺的是一整套走位：整条只占一个 Tab 位、条内靠方向键在按钮间走、禁用项跳过、RTL 下主轴翻转。这台一样都没有——读屏把它念成工具条，键盘用户却得一颗一颗 Tab 过去。

补上那套走位不是加法，是拿一样换一样：左右方向键与 `Home` / `End` 在这台上是翻页（`image-viewer.kbd.prev` / `.next` / `.first` / `.last`），条内走位一旦接管这四个键，看片的主交互就从条里那七颗钮上整个消失。何况条里装什么归作者——作者往里多放一颗自带 Tab 位的钮（下载、删除），「整条只占一位」当场就不成立。所以这里改的是角色，不是行为：现在报的 `group` 与实测到的走位完全对得上，每颗钮各占一个 Tab 位，方向键照旧翻页。`aria-label`（`translations.toolbar`，缺省 `Image tools`）无条件照发，不发的话读屏念到的只是页面上一堆散落的钮。

真需要那套方向键走位的，往这条带里放一个 `Toolbar` 组件即可——与 `table` 的控件带同一条路子（`getToolbarProps` 不给 role，要就自己往里放）。

同批把这条规矩钉进门禁：`check-aria-shapes` 新增判据 ⑤——连接层里发了 `role="toolbar"` 的，同一份文件必须同时有条内方向键导航（`navigateItems`）与 roving tabindex（条目 `tabindex` 在 `0` / `-1` 之间切），否则判红。眼下全仓只有 `toolbar` 自己发这个角色，它两样都有。

对使用者的影响：读屏播报从「工具条」变成「分组，Image tools」；键盘走位、皮肤、部件名、槽与事件一律没动。断言过 `role="toolbar"` 的用例要改成 `group`。
