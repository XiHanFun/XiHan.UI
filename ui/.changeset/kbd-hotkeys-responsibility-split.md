---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

将快捷键展示与行为直接拆成唯一职责边界，不保留旧展示分支。

新增无状态 `Kbd` / `KbdGroup` family：Vue 与 React 分别公开 `XhKbd`、`XhKbdGroup`，
Web Components 新增 `<xh-kbd>`、`<xh-kbd-group>`。单枚键帽使用原生 `<kbd>`；组合由
Headless 统一完成平台格式化、连接符、修饰键身份与整组可读名称，视觉键帽和连接符从无障碍树隐藏，
整组只朗读一次。`value` / `keys` 必填，空声明和空读屏翻译直接报错。

`Hotkeys`、`XhHotkeys`、`<xh-hotkeys>` 与 `useHotkeys` 现在只负责注册和匹配，不再生成 DOM。
删除 `HotkeysApi.segments`、`separator`、`segmentOf`、三个视觉 getter、`HotkeysKeyProps`、
`HotkeysTranslations` 以及 Hotkeys 的 `size` / `translations` props。`keys` 改为必填；空组合或
包含多枚主键的组合直接报错。删除 `target='parent'`，局部范围改为返回真实 EventTarget 的显式 resolver；
SSR 不读取 ambient document，卸载仍精确解绑监听。

删除 `@xihan-ui/styles/hotkeys.css` 与全部 `--xh-hotkeys-*` 槽，新增 `kbd.css` / `kbd-group.css`。
键帽使用 M1 实体小表面、等宽字、1px edge、顶部高光与 contact shadow；只有显式 `pressed`
事实或真实可交互 owner 的 `:active` 才轻压。禁用、compact、RTL、forced-colors 与 200% 缩放
均由新 family 独立承担。

Command、Menu、ContextMenu 与快捷键文档示例已迁移为显式组合 Hotkeys + KbdGroup，
没有 `XhHotkeys` 视觉别名或双轨兼容层。
