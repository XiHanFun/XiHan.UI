import { createAnatomy } from '@xihan-ui/kernel'

// root 是外壳并承载语言、闭合与折叠标记，header 是文件名与语言角标那一行，
// pre 是滚动容器与 Tab 停靠点，code 承载全部行，line 是一行，
// line-number 是行号槽（皮肤用 attr() 画，复制代码不带它），line-content 承载该行的记号，
// token 是着色后的一个记号，fold-trigger 展开或收起超长代码。
// 复制按钮由 clipboard 组件提供。
export const codeViewAnatomy = createAnatomy('code-view', [
  'root',
  'header',
  'filename',
  'lang-label',
  'pre',
  'code',
  'line',
  'line-number',
  'line-content',
  'token',
  'fold-trigger',
])
