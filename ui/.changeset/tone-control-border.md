---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": minor
---

带语气的 outline 控件边框补到 3:1，并修掉上一版留下的一处断链。

上一版把控件边界迁到 `border.control` 时，如实记了一笔「带语气的 outline 形态够不着 3:1」——
它走的是 `--xh-_tone-border`（语气色兑 40% 底色），六族在两套主题下是 1.44–2.18。这一版补上。

新增 `--xh-_tone-border-control`：直接取语气主色本体，不再兑底色。两族在各自的底上仍不够，
按主题各兜一次——语气色是固定原语、不随主题翻，这是唯一能表达的地方：

- 黄在白底上只有 2.70，浅色态改取新增的 `--xh-color-warning-700`（3.75）；深色态 600 档就有 7.32，不动。
- 中性在深色底上只有 2.54，深色态改取 `--xh-color-neutral-550`（3.59）；浅色态 600 档就有 7.80，不动。

六族 × 两套主题现在最低 3.04（浅色 success），全部达标。

**调色板新增一档** `--xh-color-warning-700 = oklch(0.62 0.15 70)`。步距 ΔL 0.085，落在同族 700 档的
区间中间（brand 0.058 / danger 0.077 / success 0.138），色度按同族惯例微降，色相与 600 一致。
黄族此前只有 500/600 两档，没有更深的档可取，所以必须新增。

**顺带修掉一处断链**：上一版把 `toggle.css` 的 outline 边框改指了 `--xh-_tone-border-control`，
而那个槽当时并不存在——`<XhToggle variant="outline" tone="danger">` 的边框一直退到中性色，语气丢了。
这一版把槽真正建起来，`button` 与 `button-group` 一并接上。

**新增门禁 `check-private-slots`**：皮肤里消费的每个 `--xh-_*` 私有槽都必须在某份皮肤里声明过，
声明了没人用的也要删。上面那条断链正是它该拦下的——CSS 不报错、TS 不报错，
而既有的 `check-token-refs` 整体放行 `--xh-_` 前缀，谁都看不见。拿改动前的仓库实跑过：它红在
`toggle.css:71`，改完转绿。
