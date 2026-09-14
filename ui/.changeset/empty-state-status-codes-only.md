---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**空状态的 `status` 只收 `'404' | '403' | '500'` 三个状态码；成功 / 警示 / 出错 / 提示改走 `tone`。**

`status` 原来把结果页的状态码与通用结果的语气混在一根轴上：`'error'` 与 `tone="danger"` 说的是同一件事、写法却有两套，也与全库的语气轴对不上。现在 `status` 只表达结果页的状态码，皮肤仍把它们并进最接近的一族语气色；`'success' | 'warning' | 'error' | 'info'` 四档撤掉，改写 `tone="success" | "warning" | "danger" | "info"`，两者都写时以 `tone` 为准。三端同步：`EmptyStateStatus` 收窄，自定义元素的 `status` attribute 取值同步；皮肤撤掉四条按通用结果换色的规则；「结果类型」示例改成语气示例。
