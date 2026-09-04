---
"@xihan-ui/headless": minor
---

**收敛表单一族的错误播报**：一次校验失败只留一处打断式活区。

原先 `form` 的错误摘要、`field` 的错误文案、`fieldset` 的错误文案三处都发 `role="alert"`。`role="alert"` 隐含 `aria-live="assertive"`，规范行为是打断当前朗读——整表提交失败时三处同帧翻出，读屏被连着打断，用户听到的是几个半句，一个完整的都没有。

现在：

- `form` 的 `error-summary` 保持 `role="alert"`，并补上显式的 `aria-live="assertive"` 与 `aria-atomic="true"`。它是提交失败那一刻唯一打断朗读的活区——只发一次，且带着错误条数与逐条链接，是用户当下最需要立刻知道的那一条。
- `field` 与 `fieldset` 的 `error-text` 从 `role="alert"` 改为 `role="status"` + `aria-live="polite"` + `aria-atomic="true"`：翻转时排队播报，不打断。这两段文案本来就挂在控件（或 `fieldset` 根）的 `aria-describedby` 上，焦点落过去时读屏会再念一遍；脱离 `form` 单用时按失焦校验翻出的那一条也仍然播报得出来。

**注意**：靠 `field` / `fieldset` 错误文案打断朗读的用法不再成立，打断式播报统一由 `form` 的错误摘要承担。三处的 `role` 都进了两个适配器发出的 DOM，按 `role="alert"` 定位错误文案的测试需要改成 `role="status"`。
