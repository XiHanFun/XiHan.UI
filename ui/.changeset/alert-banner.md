---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Alert 新增 `banner`：把提示改成页面顶部的横幅，贴着页面或容器的边铺满整行，不取圆角，只在朝向页面内容的块尾画一道 `--xh-border-default` 描边；面、语气、实时区语义与关闭都与页内提示相同。根投影 `data-banner`。它是放置而不是面的形态，所以不走 `variant`，也不是打包缺省值的 `preset`。
