---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**修复**四处「想改一处视觉，改不动，或者调 A 把 B 一起改了」。全部加法式：新槽名在外、旧名当默认值，照旧名写的覆盖一条不失效。

**toggle-group 整件不接语气轴。** 同族的 toggle 与 segmented 都发 `data-tone`，只有它不发，选中档的底、悬停底、按下底、前景与描边一律钉死在品牌色上——把一组开关放进 `data-tone="danger"` 的区域里，旁边的 toggle 变红，它一点不变。补上 `tone` prop 与 `data-tone`，选中档与「禁用且选中」档改读语气槽（`--xh-_tone` / `-hover` / `-active` / `-on`），没有语气时逐值退回原来的品牌配色。使用者的组件槽仍排在语气之前：写了 `--xh-toggle-group-item-bg-on` 就以它为准。顺带把作用在条目上的 `--xh-toggle-group-radius` 补出带部件段的 `--xh-toggle-group-item-radius`，与同文件另外 22 个条目槽同段。

**button-group 把使用者的圆角槽写成 0。** 组在根上直接写 `--xh-button-radius: 0` 让段与段接成一条，可那正是使用者改按钮圆角的入口：设了胶囊按钮，进了组就静默归零，而且组内怎么写都盖不回来——继承来的值压不过组根上的那条声明。改成写私有槽 `--xh-_button-group-radius`（与同文件高度、内距、间距、字号四项一致），按钮的圆角兜底链插进这一层。不写覆盖时段与段照旧是直角，两端的圆角照旧归 `--xh-button-group-radius` 管。

**navigation-menu 的两种面板形态共用一个内衬槽。** 逐项面板 content 的默认内衬是一档，共享外壳 viewport 是两档，两处却都读 `--xh-navigation-menu-content-p`——使用者一改，两者一起走，缺省的这一档差值再也调不开。外壳另立 `--xh-navigation-menu-viewport-p`，content 那个槽接在后面当默认值。

**typography 一个槽吃掉六个语气。** `--xh-typography-text-fg` 同时管次要文字档与全部六个语气档，两条规则同权重：想把次要文字调淡一点，六族语气当场一起塌成同一个灰。拆成 `--xh-typography-text-fg-muted` 与 `--xh-typography-text-fg-tone`，旧槽降为两者共同的默认值。
