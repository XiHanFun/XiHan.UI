---
'@xihan-ui/styles': patch
---

RadioGroup 与 QuestionFlow 单选的圆点对齐为同一套动效：选中时从 0 缩放到 1、落位走 `--xh-motion-ease-settle` 略涨过 1 再收回；收起改走 `--xh-motion-ease-enter-strong`，不再冲成负缩放、闪出一个极小的镜像点；圆点换色走 `--xh-motion-duration-micro`，RadioGroup 按住条目时选中圆点换到语气 active 档走按压时间线。QuestionFlow 单选的圆点此前只做颜色淡入，现在同样按缩放收放。
