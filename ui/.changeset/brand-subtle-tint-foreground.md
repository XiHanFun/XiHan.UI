---
"@xihan-ui/tokens": minor
---

**品牌淡底改为 12% 拼色，并补上淡底前景令牌。** `--xh-bg-brand-subtle` 不再取 brand-100 / brand-950 原语，改为 `color-mix(in oklab, var(--xh-bg-brand) 12%, var(--xh-bg-surface))`，与 `-hover`（20%）、`-active`（28%）和语气层 `--xh-_tone-subtle` 落在同一条曲线上：写 `data-tone='brand'` 与不写语气从此是同一块面。浅色由 L 0.936 提到 0.946，深色由 L 0.282 降到 0.258，肉眼是「更淡一点」。

新增 `--xh-fg-on-brand-subtle`，与 `--xh-_tone-fg` 同式（品牌色往正文色兑到 60%），压淡底 12 / 20 / 28 三档浅色 8.49 / 7.60 / 6.78、深色 7.41 / 6.67 / 5.93。此前皮肤在 `--xh-fg-brand`（压淡底 4.33）与 `--xh-fg-brand-strong`（压按下面 4.42）之间各自取用，两者都够不到 4.5；皮肤切换到这支令牌在后续提交逐组件进行。
