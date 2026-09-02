---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**补齐十一处缺失的读屏文案位**，都是「屏幕上看得清、读屏里说不明白」那一类。文案只增不减，已有写法一律照旧。

**新增** `ComboboxTranslations.trigger`（兜底 `Show suggestions`）。展开钮里只有一枚箭头，此前一个 `aria-label` 都不发，读屏念到的是一颗没有名字的按钮——同一个组件里的清空钮早就有名字了。

**新增** `DatePickerTranslations.hour` / `minute` / `second`。`showTime` 的三列此前直接把内部枚举 `hour` / `minute` / `second` 当 `aria-label` 发出去，作者改不动。现在走文案桶，内建英文与 `time-picker` 那份逐字相同。

**新增** `ImageViewerTranslations.toolbar`（兜底 `Image tools`）。工具条此前借用对话框那句 `Image preview`，读屏里两块区域同名，走到哪儿分不出来。

**新增** `MenubarTranslations.root`（兜底 `Menu bar`）与 `menubar` 的 `translations` prop。`role=menubar` 的名字不从内容来，此前整条菜单栏没有名字。

**新增** `RatingTranslations.item`（兜底 `${value} of ${count}`）与 `rating` 的 `translations` prop。星星那一格里只有符号，亮着与暗着画的还不是同一个，名字此前随高亮在两个符号之间来回变。

**新增** `TourTranslations.next` / `finish`。末步那颗按钮的语义是「完成」，此前只有一个 `data-last` 供皮肤换样子，没有任何地方能给它一句名字。两句都**不给就不产出 `aria-label`**——这颗按钮通常带可见文字。

`MessageFeedTranslations.item` 现在**同时收字符串与函数**：给函数拿得到「第几条、共几条、谁说的」，给字符串仍是一句固定名字。它此前写着「模板串由调用方现场代入」，可连接层并不插值，`Message {position} of {size}` 里的占位符会被原样念出来；它也是这个组件唯一没有兜底的一条，现在兜底 `Message 2 of 5, assistant`。已经传字符串的调用方一行都不用改。

`resizable` 八个把手的兜底名字不再是 `Resize n` / `Resize ne`——内部枚举念给用户听没人懂。改成方位说法（`Resize top edge` / `Resize top right corner`），与 `floating-panel` 那份一致；作者给了 `translations.handle` 仍以作者为准。

`sortable` 的拖动播报不再念内部 id，退回那一项屏幕上写着的字（与 `table` 的列拖拽、`tabs` 的标签换位同一口径）；项上一个字都取不到时才退回 id。

`tag` 关闭钮的兜底名字由 `Remove` 改为 `Delete`：摘掉一枚标签这个动作，`select` 与 `tags-input` 念的都是 `Delete`，三处从此用同一个词。
