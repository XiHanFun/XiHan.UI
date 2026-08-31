---
"@xihan-ui/markdown": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**新增** `RenderedBlock.source`：代码块与公式块除了已消毒的 `html`，另给一份未转义的正文原文。

代码块给的是剥掉起止围栏的代码，公式块给的是剥掉 `$$` 的公式。`html` 对这两种块只是降级产物——代码要交给代码组件重排行号与着色，公式要交给公式引擎，两者都得拿到未经转义的正文，此前只能从已转义的 html 反解。其余种类的块不带这个字段。

**新增** `logMachine`，`log` 组件不再借用 `thread` 的机器。

两者本来就是各自独立的组件，共用一台机器只是历史遗留。这一改顺带修好一处 `<xh-log>` 的全局文案失效：Web Components 侧按机器名给 `<xh-config>` 的文案分桶，`<xh-log>` 此前会去取 `thread` 那一格，作者写在 `<xh-config>` 上的日志区可访问名从来到不了元素；同时元素的行数、载入态与文案三个视图属性此前完全不过全局配置，现在一并接上。

`stick-change` 事件的载荷类型随之改名为 `LogStickChangeDetails`（形状不变，仍是 `{ atBottom, sticking }`）。
