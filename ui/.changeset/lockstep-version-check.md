---
"@xihan-ui/kernel": patch
"@xihan-ui/vue": patch
"@xihan-ui/web-components": patch
---

锁步版本检查:混装版本在 dev 里报 `core.version-mismatch`,不再只靠自觉。

17 包同版本是硬承诺,但包管理器不会拦「vue alpha.2 + kernel alpha.3」这种跨包组合——
类型对不上、同一个 `xh-` 标签被两个版本注册直接抛错,全部静默到运行时。现在 `@xihan-ui/kernel`
导出自己的 `VERSION` 与 `checkLockstepVersion()`,两个适配器在 dev 启动时(与废弃探测同一次
借路)拿自身版本比对,不一致经诊断通道发一条 warn,生产构建跳过。
