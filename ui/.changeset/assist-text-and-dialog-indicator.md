---
"@xihan-ui/styles": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**控件下方那一行辅助文字同时只留一段。** 新增 `css/description.css`，`field` 与 `fieldset` 的根一旦带上 `data-invalid`，它们自己那段 `description` 收起，位置让给 `error-text`。两段原先会同时在场，辅助区撑成两行，同一行栅格里的字段高度跟着参差。

只收视觉：说明的 id 仍挂在控件的 `aria-describedby` 上——直接被 `aria-describedby` 指到的节点，隐藏与否都计入可及描述，读屏两段照旧都念得到。

限定到直接子节点，字段集无效时收起的是它自己那段说明，不是组内各字段的。scope 逐个列出而不写通配：`description` 这个部件名在提示、气泡、空状态、说明列表上指的是另一段文字。按需引入的人多引一份：`import '@xihan-ui/styles/description.css'`，位置排在组件皮肤之前。

**表单：字段一被编辑，就清掉它身上那条来自库外的错误。** 服务端返回后经 `setFieldError` 写进来的错误、作者预置的 `defaultErrors`、受控 `errors` 里那些，本库的校验都不认识：`validateOn` 是 `submit` 时两次提交之间没有任何一条路径会重算它们，而 `validate` 与 `rules` 都没给的表单连提交那一路的整表替换也不发生——用户照着提示改完，错误还挂在原处。现在 `FIELD.SET` 会先把这一条清掉，受控档经 `onErrorsChange` 回传。

校验自己算出来的那几条不动，仍由下一次校验负责收回：提交失败后接着打字，规则报的错照旧留在那里。禁用与只读两档整条 `FIELD.SET` 都吃掉，也就不清。

**`dialog` 新增 `indicator` 部件。** 语气徽记此前只活在命令式服务的一个私有渲染函数里，声明式写 `<XhDialogRoot role="alertdialog">` 的人拿不到它。现在它是正式部件：Vue 侧 `XhDialogIndicator`、Web Components 侧 `data-part="indicator"`，两条路得到同一个东西。

圆底与字形两层，圆底是节点自己、字形走 `:empty::before`，作者往里塞节点即整枚换掉。画哪枚字形跟着节点自己那份 `data-tone` 走：`success` 勾、`warning` 三角、`danger` 叉，其余为圆圈问号。颜色取语气层派生的淡底与前景档，新增使用者覆盖槽 `--xh-dialog-indicator-size`、`--xh-dialog-indicator-mark-size`、`--xh-dialog-indicator-radius`、`--xh-dialog-indicator-bg`、`--xh-dialog-indicator-fg`。

`createDialogService` 的默认模板改渲这个部件，那枚徽记从此由皮肤画：节点位置与标签名都没变，变的是它不再自带内联样式，改为按 `[data-scope="dialog"][data-part="indicator"]` 取样式。

覆盖槽名、部件名、props、事件与 `data-*` 取值一个没删也没改名。
