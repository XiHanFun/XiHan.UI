---
"@xihan-ui/styles": major
---

每份皮肤现在都能单独引入了，动画不再指望别处的文件在场。

`styles` 的 exports 逐组件铺了一百多条子入口，`import '@xihan-ui/styles/dialog.css'` 是受支持的用法。但 `xh-fade-in`、`xh-fade-out`、`xh-spin`、`xh-dialog-in/out` 这五支关键帧住在 `motion.css` 里，被 15 份别的皮肤引用——单独引入其中任何一份，动画名都查不到。`@keyframes` 的名字查找只认「文档里有没有这个名字」，查不到既不报错也不降级，看上去就是「这个组件没做动效」。`spinner.css` / `switch.css` / `popconfirm.css` 三处注释早就写明了这条理由，只是这五支没照办。

现在每份皮肤都自带它用到的关键帧。`motion.css` 因此空了，**已删除，`./motion.css` 子入口一并移除**——如果你显式引过它，删掉那行即可，它提供的关键帧已经跟着各组件走了。

新增 `check-keyframe-refs` 门禁盯住三件事：引用的动画名必须在同一份皮肤里定义、同名的多份定义必须逐字一致（名字是全局的，两份不同内容会互相覆盖）、关键帧必须写在 `@layer xihan.motion` 里（使用者按层覆盖时才盖得住）。

产物只大了 60 B：重复的关键帧对 gzip 几乎是免费的。
