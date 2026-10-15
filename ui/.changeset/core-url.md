---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
---

`@xihan-ui/core` 新增子入口 `@xihan-ui/core/url`，提供 `toSafeImageSource(value)`：把一个值收成可以安全当图片地址用的串，放行 http(s)、`blob:`、以 `data:image/` 开头的内联图片与不带协议的相对地址，其余协议（如 `javascript:`、非图片的 `data:`）、非字符串与空串返回 `undefined`。判定前按浏览器解析 URL 的规则去掉首尾的控制字符与空格、删去串中的制表与换行，`java\nscript:` 这类写法拼不出被挡的协议。

`@xihan-ui/headless` 的 Watermark 改用它判定 `image`：串中夹着制表或换行、去掉后是被挡协议的地址，现在同样不印也不去取。
