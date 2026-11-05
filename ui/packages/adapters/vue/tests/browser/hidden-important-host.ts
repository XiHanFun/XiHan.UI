// 宿主带 [hidden]{display:none!important}（VitePress 默认主题、Tailwind 的 preflight 都有这条）：
// 引入这个文件，这份用例就在这样的宿主里跑。这条规则压得过皮肤声明的 display，
// 内容区的 hidden 跟着开合走的话，退场一帧都播不出来。
const style = document.createElement('style')
style.textContent = '@layer base { [hidden]:where(:not([hidden="until-found"])) { display: none !important; } }'
document.head.append(style)
