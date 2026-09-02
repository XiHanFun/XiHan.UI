---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/tokens": minor
"@xihan-ui/styles": patch
---

**走马灯：自动播放补上暂停控件，并且不再在减弱动效档下自己起播。**

`autoplay` 一直没有任何播放 / 暂停入口——解剖里没有这样的部件，`connect` 里的 `play` / `pause` / `resume` 三个方法从来没有被接出来过。自动翻页因此是一段用户按不住的动画：读得慢的人永远读不完一张，屏幕上的东西自己在动而没有出口。减弱动效那一路也只关掉了滑动过渡，翻页照走。

- **新增**部件 `autoplay-trigger`（Vue 的 `XhCarouselAutoplayTrigger`，自定义元素的 `data-xh-part="autoplay-trigger"`）。它承载 `data-state="running" / "paused"`，名字随动作走（`translations.autoplayTriggerPlay` / `autoplayTriggerPause`），没配 `autoplay` 时转原生 `disabled`。
- **新增** API 成员 `autoplayStopped`：只算「用户按停了没有」，不含悬停与焦点那两路一挪开就自己续上的临时按住。开关的名字与图形跟着它走，指针碰到按钮时不会翻面。
- **变更**：减弱动效档下 `autoplay` 不再自己起播（停在 `idle`），要播由用户按下开关。偏好探测走 `@xihan-ui/motion` 的 `resolveMotionPreference`，应用级 `setMotionOverride` 同样管用。
- **新增**字形令牌 `--xh-glyph-mark-play` / `--xh-glyph-mark-pause`，皮肤按 `data-state` 换字形。

**差异视图：补上截断提示条，展开按钮补上可访问名。**

超过 `maxLines` 的差异从尾部断开，界面上没有任何痕迹（`data-truncated` 全库无人消费），看着仍像一份完整差异——评审的人会以为自己看完了，而少掉的恰恰是没被审到的那几行。

- **新增**部件 `truncation`（Vue 的 `XhDiffViewTruncation`，自定义元素的 `data-xh-part="truncation"`）与文案 `translations.truncated`，文字默认由组件自己填。
- **新增** `DiffModel.truncatedLines` 与 API 的 `truncatedLines` / `truncationText`：砍掉多少行现在是模型的一部分。
- **修正** `truncated` 的判据：上限改为按新旧两侧各自计，真砍掉了行才置位。旧判据用两侧行数之和，会在一行都没砍的情况下报「截断了」。
- `DiffViewTranslations.expandGap` 由 `string` 放宽为 `string | ((count: number) => string)`。它是这个组件里唯一没有兜底的文案，此前展开按钮的可访问名就是按钮上那串「⋯ 12」，读屏念出来什么都没说明。给函数就能把折起来的行数念进名字；仍传字符串的调用方一行不用改——收两种形状是为了不把这一条修复变成整个锁步组的主版本。
