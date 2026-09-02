---
"@xihan-ui/styles": minor
---

**修复** 18 个点得动的部件按下去毫无回应。守按压反馈的那道门禁是名单制，没登记的部件永远不查，这批就一直空着：`image-viewer` 十一颗按钮里只有关闭钮登记过，工具条那六颗、变换归零与两颗翻页钮全部零 `:hover` / `:active`；`color-picker` 的取色钮与色板格子、`date-picker` 的确认钮同样没有按下态。新增 5 个使用者槽，没有删名也没有改名。

补规则逐件对参照物。浮在图上的那几颗钮跟着同组件的关闭钮走：底色在半透明深底上再压一档，按下多一次轻微下压（`--xh-image-viewer-action-bg-hover` / `-active`）。`date-picker` 的确认钮跟着框内那两颗小钮走（`--xh-date-picker-confirm-trigger-bg-active`；少一段的 `--xh-date-picker-confirm-bg-active` 已删）。色板格子的底色就是它要展示的那个颜色，换底等于把展示物盖掉，于是指到哪一格看描边（`--xh-color-picker-swatch-border-hover`）、按下去看下压。`composer` 的发送钮与 `pagination` 的四颗页码钮此前只换底不下压，与同族的 `prompt-input`、`segmented` 对齐后一并补上。

缩放量一律走 `--xh-motion-scale-press`，减弱动效档下它归 1。名单补齐后受门禁保护的部件从 42 个增到 60 个。判定为「点得动但不给按压反馈」的部件另立一张登记表，眼下只有 `image-viewer` 的触发区一条——那是作者自己的一块内容，缩放它会把作者的排版一起抖起来；这张表两侧反查：部件名在解剖里查不到、或者皮肤里已经写上了 `:active`，都判失败。
