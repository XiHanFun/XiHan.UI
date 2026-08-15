---
"@xihan-ui/headless": patch
---

104 个组件全部留出 `<Comp>Translations` 的位，哪怕眼下一句文案都没有。

原先只有 32 个组件有 `Translations` 类型，其余 72 个什么都没有。将来某个组件要外露一句读屏文案时，
得同时补：类型、子入口导出、包级 barrel、`XhTranslationOverrides` 的一行、两个适配器的全局配置能否命中。
五处漏一处就是「配了没生效」，而且不报错。

现在类型一律先在，空接口也是接口：

```ts
/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface BadgeTranslations {}
```

`XhTranslationOverrides` 相应从 31 条扩到 104 条，全局配置对每个组件都有落点。
`date-field` 与 `date-picker` 共用一份文案的既有映射原样保留。

新增 `check-translations-slots` 门禁守住两件事：每个组件都有自己的 `Translations`、
且都挂进了覆盖表。加了新组件却忘了留位，当场红。`pnpm gate` 二十项 → 二十一项。
