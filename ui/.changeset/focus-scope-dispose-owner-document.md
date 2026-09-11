---
"@xihan-ui/core": patch
---

修复动态 Scope 的宿主锚点先于异步焦点归还卸载时抛错的问题。已释放焦点域按创建时所属 Document 与本域容器、分支的真实 ShadowRoot 清理遗留焦点，保留 iframe 和闭合 ShadowRoot 的归属，不再重新查询已卸载锚点。

动态 Scope 在锚点缺失时的严格错误合同保持不变，没有吞掉异常或改用全局 document。
