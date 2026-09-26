---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

LoadingBar、Carousel、NumberAnimation 改用由框架 useId 派生的 scope：根部件与 Carousel 视口的 id 在服务端渲染与水合两侧同号，不再因计数式生成器错号引出水合告警。
