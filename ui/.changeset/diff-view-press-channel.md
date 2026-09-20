---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**DiffView 的展开按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
diff-view 机器 context 新增 `pressedValue`（按折叠格 id 记），事件 `PRESS.START { value }` / `PRESS.END { value }`；按住途中那一格被展开
（Enter 在 keydown 即 click，折叠格离开行序）时由机器松开，受控写回同样松开。`<xh-diff-view>` 在行序未变时也刷新展开按钮的属性，
按压面不再被「内容未变不重铺」挡住。键盘表新增 `diff-view.kbd.press`。三端公开 props 与事件不变。
