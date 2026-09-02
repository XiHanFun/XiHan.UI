---
"@xihan-ui/styles": major
"@xihan-ui/web-components": major
"@xihan-ui/tokens": minor
---

**槽名的部件段与所在部件对齐，跨组件抄写的默认值收成一处。** 三道门禁把扫描面补到位之后，各揪出一处存量违规，逐条修掉，没有加豁免。默认渲染逐像素未变——40 张像素基线（button / text-field / select / menu / popover / dialog / drawer / toast 共 8 件 × 5 档主题密度对比）无差异。

**破坏性：`--xh-combobox-input-py` 已删，换成 `--xh-combobox-control-py`。** 这条槽管的是「输入行是多行时，控件盒纵向撑开多少」，规则作用在 `control` 上，槽名却写着 `input`——照名字去改 `input` 的内衬，改不动；照名字理解这条槽的人，也不知道它其实动的是外面那个盒。CSS 这一介质没有 IDE 提示，改名之后旧声明只会静默失配，不报错也不降级：请在自己的代码库里全文搜索 `--xh-combobox-input-py`，换成 `--xh-combobox-control-py`。默认值仍是 `var(--xh-field-py)`。

**新增 `--xh-drawer-description-font-size`。** 抽屉的说明文字此前直接写 `var(--xh-text-body-size)`，全库唯一一处没给使用者留口子的说明段——同族的 dialog 早就有这条槽。默认值不变。

**新增令牌 `--xh-measure-prose`（`32rem`）：成段正文的读行宽度。** empty-state 与 result 的说明段此前各写一份 `32rem`，是同一条没被命名的决策：整句话不收窄就会拉成一条难读的长行。两处改指这支令牌，随之删掉私有槽 `--xh-_empty-state-measure` / `--xh-_result-measure`（私有槽不在公开面上）。两处的使用者槽 `--xh-empty-state-description-max-w` / `--xh-result-description-max-w` 不变，仍排在令牌之前。

**实心面顶边的内高光收进语气层。** `inset 0 var(--xh-stroke-thin) 0 0 color-mix(in oklab, …14%, transparent)` 这条式子此前在 16 处实心档里各抄一遍，改一处得挨个找。现在由 `tone.css` 统一声明两支私有槽，各组件指过去：跟着语气走的读 `--xh-_highlight-tone`（badge / button / button-group / icon-wrapper / pagination / tag 带语气那档 / toggle / toggle-group / approval / popconfirm / prompt-input / question-flow），底色恒是品牌色的读 `--xh-_highlight-brand`（editable / form / tag 不带语气那档 / tour）。两支的取值与各处原来那一份逐字相同，各组件自己的 `--xh-<组件>-…-shadow` 覆盖槽与「哪一档才画高光」的规则都不动。

它落在 `:where([data-scope])` 上而不是 `:root` 的令牌层：自定义属性值里的 `var()` 在声明它的那个元素上就替换掉了，写进 `:root` 会把 `--xh-_tone-on` 与 `--xh-fg-on-brand` 一并按根元素解析，语气与嵌套主题（子树上的 `[data-theme='dark']`）就都冻死在根上那一份。
