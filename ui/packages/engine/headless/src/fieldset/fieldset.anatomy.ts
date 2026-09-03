import { createAnatomy } from '@xihan-ui/kernel'

// root 是原生 <fieldset>、legend 是原生 <legend>；说明与错误文案各占一个部件，
// 由 connect 派生 id 后接进 root 的描述链。
export const fieldsetAnatomy = createAnatomy('fieldset', ['root', 'legend', 'description', 'error-text'])
