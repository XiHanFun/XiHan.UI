---
"@xihan-ui/kernel": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

开箱默认语言跟随运行时，兜底英文。

此前是自相矛盾的：i18n 文档明写「内建文案默认是英文」，而日期系的兜底 locale 写死 `zh-CN`（calendar / heatmap / time 三处常量）——开箱就是**英文按钮配中文月份名**，热力图图例还是「少 / 多」。命令式 dialog 的按钮也硬编码着「确定 / 取消」，而那个服务自建 `createApp` 挂在 body 上，根本读不到组件树里的 `provideXhConfig`。

现在 kernel 提供一条解析链 `resolveLocale(locale, scope)`：**作者显式传的 locale → 全局配置 → 宿主 `navigator.language` → `en-US`**。宿主读取一律经 `config.scope`（SSR 安全）。calendar / heatmap / date-field / date-picker / time 全部接上；`RuntimeConfig.locale` 的 `zh-CN` 兜底同改。

**行为变更（预期之内）**：默认周首日随之从周一变成周日（`en-US` 口径）——要固定就显式传 `locale` 或 `firstDayOfWeek`。同时修掉一个此前没有测试覆盖的连带 bug：日历的周序号原先取每行**行首**那天算 ISO 周数，注释写着「行首正是周一」；周首日变成周日后，周日在 ISO 里属于上一周，整列周序号会集体少 1——改成取行内第 4 天，两种周首日下都必落在本行覆盖的那个 ISO 周内。

`TimeProps.locale` 此前是 `'zh-CN' | 'en'` 的窄联合，与全局配置的 BCP 47 `locale` 对不上：配 `de-DE` 会让所有非 `'en'` 的语言（含 `en-US`）拿到中文用词。类型放开为 `string`，判据改成 `zh` 前缀匹配，`TimeLocale` 直接删除、不留别名。`HEATMAP_LEGEND_TEXT` 的「少 / 多」改 `Less / More`。

`createDialogService` / `createToastService` 新增 `config?: XhConfig` 选项——服务在自己那棵子树里 `provideXhConfig` 一次，不造全局单例；按钮兜底改 `OK` / `Cancel`。

登记未接的两处（都写进了 i18n 文档）：`time-picker` / `time-field` 的 `locale` 只影响小时制推断，接上宿主会让 `en-US` 环境静默翻成 12 时制，属另一条裁决；`heatmap` 的 `firstDayOfWeek` 是独立的 prop 轴，不随 locale 走。
