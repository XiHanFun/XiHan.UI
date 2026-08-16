---
"@xihan-ui/kernel": patch
"@xihan-ui/web-components": patch
"@xihan-ui/vue": patch
---

废弃提示落地：五种没有 IDE 提示的介质在 dev 里经诊断通道发 `warn`。

版本政策承诺过「dev 构建下经诊断通道发 warn」，此前一直未落地。现在 `@xihan-ui/kernel` 新增
废弃登记表与探测：维护者 `registerDeprecation({ medium, match, message, replaceWith, until })` 登记
一条，消费方的旧用法在 dev 里变成一条带迁移方向的诊断。

五种介质与探测面：

- `css-var` / `layer` / `selector` —— 样式表（`<style>` 文本与 CSSOM，跨域样式表静默跳过）
- `attribute` —— DOM 里 `xh-*` 元素上的废弃 attribute（业务元素同名属性不误报）
- `part` —— 作者写的 `data-xh-part` 角色名，由 Web Components 适配器的部件契约校验带上下文投递

两个适配器都在 dev 里自动启动探测（Vue 在第一个组件建机器时借路启动一次，Web Components 在
`defineXhElements()` 里启动），生产构建跳过；登记表为空时扫描器直接早退，零开销。同一废弃名
无论命中多少条规则只报一次（通道去重）。登记表当前为空，发废弃时随 changeset 一起登记第一条。
