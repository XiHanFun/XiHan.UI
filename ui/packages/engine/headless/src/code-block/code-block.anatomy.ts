import { createAnatomy } from '@xihan-ui/kernel'

// root 是外壳并承载语言与闭合标记，lang-label 是装饰性语言角标，
// pre 是横向滚动容器与 Tab 停靠点，code 承载代码文本，token 是着色后的一个记号。
// 复制按钮由 clipboard 组件提供。
export const codeBlockAnatomy = createAnatomy('code-block', ['root', 'lang-label', 'pre', 'code', 'token'])
