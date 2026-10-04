---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

新增十种常用语言的内建语言包：`zhCN`（简体中文）、`zhTW`（繁體中文）、`enUS`、`jaJP`、`koKR`、`frFR`、`deDE`、`esES`、`ptBR`、`ruRU`。

语言包放在新的 `locale` 子入口，四个包各一个：`@xihan-ui/headless/locale`、`@xihan-ui/vue/locale`、`@xihan-ui/react/locale`、`@xihan-ui/web-components/locale`，主入口体积不变，各语言是独立的具名导出，只打进用到的那几份。一份语言包就是一份全局配置 `{ locale, translations }`（类型 `XhLocale`），直接交给 `provideXhConfig` / `XhConfigProvider` / `setXhConfig`，日期时间类组件的 `locale` 随之一起切换；还要配别的项时展开合并，个别文案仍可在实例上覆盖。

语言包覆盖组件的每一条文案，含图表摘要、拖拽播报等函数式文案；`enUS` 与其余九份同形，也是组件没配语言包时用的那一份。没有缺省、或缺省取自实例内容的键（作者自写的可见文字与标签、条目自己的名字、`timestamp.justNow`）刻意不收，给了会改变行为。组件新增文案键时，各语言包在类型检查里一并报缺。
