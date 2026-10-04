---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

组件不再自带英文：界面文字一律取语言包，没配语言包时取英文语言包 `enUS`（现为与其余九份同形的完整语言包）。英文输出与此前逐字相同；新门禁 `check-builtin-text` 拦住把英文兜底写回组件或适配器。

原先写死、语言包管不到的文字一并收进 translations，九种语言同步补齐：

- Dialog 新增 `ok` / `cancel` / `actionError`：命令式对话框服务（三端 `createDialogService`）的确定、取消钮与动作失败提示。没传 `okText` / `cancelText` / `actionErrorText` 时取服务 `config`（自定义元素侧取宿主所在处的 `setXhConfig`）里的语言包，此前固定为 `OK` / `Cancel` / 英文失败提示。新增导出 `dialogServiceTranslations()`。
- Form 新增 `translations` 属性，`FormTranslations` 收进校验报错模板（`required`、`type`、`minLength` 等，形状同 `validateMessages`），三端接全局配置。取值顺序：规则的 `message` → `validateMessages` → `translations`（含全局语言包）→ 英文语言包。`runFieldRules` / `runFormRules` 签名不变。
- Kbd：`keyName` 有了缺省（读屏键名，按平台区分 Option / Alt、Command / Windows），新增 `keyLabel`（键帽字，Mac 用系统符号）。两者第二个参数是平台；`formatHotkey` 新增可选的第三个参数接收这两条，缺省取英文语言包。
- Citation 新增 `previewLinkSource` / `previewLinkDocument`（预览卡里打开来源的链接字），API 新增 `previewLinkText(item)`，Vue / React 的缺省渲染改用它。
- Mention 新增 `empty`（缺省空态文字），API 新增 `emptyText`，Vue / React 的缺省渲染改用它。

带英文缺省的公开常量（`CHART_TRANSLATIONS`、`CARTESIAN_TRANSLATIONS` 等七种图表的文案表、`HEATMAP_LEGEND_TEXT`、`SPINNER_DEFAULT_LABEL`、`DATE_SEGMENT_LABEL`、`DATE_FIELD_CLEAR_LABEL`、`default*Summary` 一类函数）名字与签名不变，值改为取自英文语言包。
