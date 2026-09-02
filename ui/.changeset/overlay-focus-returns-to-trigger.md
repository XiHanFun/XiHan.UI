---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**修复**四个浮层「键盘表白纸黑字写着焦点回到触发器，指针打开的那一次却回不去」。

**dialog / drawer / popover / image-viewer 关掉之后，焦点显式落回触发器。** 焦点域此前只按「创建前谁持有焦点」这份快照归还，而各平台对「点按按钮给不给焦点」的处理不一致（Safari 不给），指针打开时快照可能就是 `body`。症状是用鼠标打开对话框、按 Escape 关掉，Tab 得从页首重新走一遍。四台机器现在都把触发器交给焦点域的 `restoreTarget`：dialog / drawer / image-viewer 按 connect 落给 `trigger` 的 id 现取，popover 取锚点。没有触发器的用法（程序化展开）取不到落点，照旧走创建前的快照。显式落点只在归还那一刻生效，`restoreFocus: false` 仍然整条关掉归还。

**`KeyboardRow` 新增可选字段 `restoresFocus`。** 「这一下之后焦点回不回触发器」此前只写在 `does` 的中文措辞里，同一件事有「焦点归还 trigger」「把焦点还给 trigger」「焦点回到 trigger」「焦点还给触发按钮」等七八种写法，`check-focus-restore` 拿措辞去匹配，七家写法不同的组件整体落在盲区外——上面那四个缺口就是这么攒出来的。承诺的真源改成这个字段：`true` 是对外承诺，机器必须为焦点域交出显式落点；`false` 用在明说不归还的键位上（Tab 走 Tab 序列）；与焦点无关的键位不写。字段可选，读键盘表的代码不受影响。

date-picker 的两行键位跟着补标了 `restoresFocus`，它的归还行为不变——触发器是输入行，点它必然把焦点落到某一段上，创建前的快照就是它本身。
