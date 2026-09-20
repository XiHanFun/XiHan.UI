---
"@xihan-ui/headless": patch
---

**修复** `kbd` 根元素的可读名称对读屏不可见。原生 `kbd` 对应 generic 角色，ARIA 禁止在它身上写 `aria-label`（axe 报 `aria-prohibited-attr`），读屏会直接忽略；视觉键帽各自 `aria-hidden`，整组于是一个名字都没有。根元素现在投影 `role="img"`，由它承接 `aria-label`：放进按钮或菜单项时名字照常汇入宿主的可访问名称。
