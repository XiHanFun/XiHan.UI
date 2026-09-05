---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**AI 与流式族补七项能力，全部是加法：不写新 prop 的既有用法逐值不变。**

**`tool-call` 补形态轴 `variant`**（`outline` / `subtle` / `ghost`，缺省 `outline`）。三档与 `reasoning` 逐条同形——两件本来就共用一台机器，此前只有 `reasoning` 有形态轴，把两件并排放，一件能收成无壳内联、另一件永远自带一张抬起的面。`ghost` 供卡中卡用：嵌在 `message-feed` 的一条消息里时不再自带投影与描边。海拔改经私有槽 `--xh-_tool-call-shadow` 走，语气档那条 `box-shadow` 一并改读它，缺省档与语气档的计算值不变。

**`tool-call` 补 `data-settled` / `data-errored` 两位布尔**（落根，配套只读 api 字段 `settled` / `errored` 与纯函数 `isToolCallSettled` / `isToolCallErrored`）。根上的 `data-state` 被开合占着，阶段此前只发在下面八个部件上，作者只渲根节点时选不中「跑完了」「跑砸了」。出错换描边色那条规则现在两条并列：`[data-errored]` 与原来的 `:has([data-state='output-error'])`。

**`approval` 补形态轴 `variant`**（同三档，缺省 `outline`）。两档排在「判过了描边退回中性」那条之后，`subtle` / `ghost` 的透明描边不会被它按同等特指度盖回来。

**`log` 补尺寸轴 `size`**（三档，缺省档逐值等于 `md`）。全族此前 8 件有档、只有它没有。三档只改行文字号（`--xh-_log-font-size`）与内衬（`--xh-_log-content-px`）两个私有槽；**行高不入档**——视口按 `rows` 定高读的是同一个基准，三档同值才对得上整数行。

**`log` 补 `data-level`**（`debug` / `info` / `warn` / `error`）。Vue 侧是 `XhLogLine` 的 `level` prop，Web Components 侧是 line 角色节点上的 `level` 属性；不写就不落属性，行走内容层的前景色。新增 4 个使用者覆盖槽：`--xh-log-level-debug-fg` / `-info-fg` / `-warn-fg` / `-error-fg`。级别只染颜色不动排版——四档必须等高。官方示例 `05-levels` 两版随之改成走这一位，手写的行内级别色删掉。

**`markdown-stream` 的 `announce` 补 `'assertive'` 一档**，与 `approval` 的 `live` 对齐。这一档下播报区换成 `role="alert"` + `aria-live="assertive"`；`off`（缺省）与 `polite` 两档一字未动。

**`prompt-input` 新增 1 个公开只读槽 `--xh-prompt-input-computed-px`**：整框内衬的当前值，随尺寸档与 `--xh-prompt-input-p` 一起变。附件条与动作行由作者写在 root 里、不是本组件的部件，此前只能靠猜才对得齐那条内衬线。
