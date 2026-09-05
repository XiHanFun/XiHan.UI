---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
"@xihan-ui/tokens": minor
---

**动作与触发族补能力：三轴铺齐、两个 group 补分隔线与组级禁用、剪贴板补禁用与播报区、按钮补圆角档与标签选择。** 纯新增，公开面一个名字都没删。

**三轴铺齐。** `toggle-group` 是全族唯一「有 tone 没 variant」的一件，现在补上 `variant`：四档与 `toggle` 一处对一处——未选中那些段的壳与选中那一段用哪一档底都由它定，切换仍由 `data-state='on'` 一条完成。`float-button` 补 `variant` / `tone` / `size`（尺寸缺省与 `lg` 同档，悬浮钮起步就比行内按钮大一号），`back-top` 补 `variant`，`download-trigger` 与 `clipboard` 补 `variant` / `tone` / `size`。五份皮肤同批把颜色改成「使用者令牌 → 私有槽 → 语义令牌」三级：使用者令牌排在形态之前，没写 `data-variant` 时逐值与从前相同。`float-button` 的前景这一支顺带接上语气槽，与 `back-top` 补齐；两颗角落浮钮的按钮块现在逐条同形，`check-family-parity` 立了「角落浮钮族」把它钉住。

**两个 group。** `button-group` 与 `toggle-group` 各补一个可选的 `separator` 部件（`aria-hidden`，朝向是这条线自己的，与组的排布相反）与 `fullWidth`。`toggle-group` 另补 `hidden-input` 表单出口与 `name`，机器认 `FORM.RESET`，`check-form-reset` 的分母里因此多了一件。插了分隔线之后首末两段不再是 root 的首末子节点，圆角另按元素类型认一遍（条目是原生 `button`，分隔线不是），没有分隔线时与从前逐值相同。

**组级禁用是真禁用。** `button-group` 补 `disabled`：Vue 侧经注入让组内每颗 `XhButton` 拿到原生 `disabled`，Web Components 侧把 `disabled` 写到组根的每个直接子节点上（作者自己声明的那一份按元素记住首见值，解禁时解得开）。只打 `data-*` 是假禁用——段照样可聚焦、照样派 click。

**`toggle` 与 `button`。** `toggle` 补 `iconOnly` / `fullWidth` 与三档 `--xh-icon-size`，同一枚图标放进 `button` 与 `toggle` 直径终于一样。`button` 补 `shape`（`rounded` / `pill` / `square`，只换圆角这一个私有槽，不写进尺寸档）与 `as`（`button` / `a`，写成 `a` 时不再产出 `type` 与原生 `disabled`，禁用改由 `aria-disabled` 表达、点击仍被拦下），官方示例里那份「往 `<a>` 上手抄 `data-scope` / `data-part`」的写法可以退休了。

**`clipboard` 与 `download-trigger`。** `clipboard` 补 `disabled`（守卫在机器层，作者调 `api.copy()` 也绕不过去）、`copy-trigger` 的 `indicator` 补上 `aria-hidden`，并新增一个可选的 `status` 部件：`role="status"` + `aria-live="polite"` 的视觉隐藏播报区，不给内容时念 `translations.copied`——在这之前，复制成功对读屏用户是零反馈。`ClipboardTranslations` 与 `DownloadTriggerTranslations` 从空接口立起来（`copy` / `copied`、`trigger`），两处的可及名都只在作者给了文案时才产出，不凭空盖掉按钮上的可见文字。`download-trigger` 另补兜底字形，新增令牌 `--xh-glyph-mark-download`。

体积：`clipboard.css` 5630 → 9144 字节、`download-trigger.css` 3143 → 6914 字节，涨的全是四档形态与两档尺寸的槽赋值，与 `button.css` 同形。
