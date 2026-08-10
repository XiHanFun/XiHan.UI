import { createAnatomy } from '@xihan-ui/kernel'

// root 是占位盒：content 吸住时脱离常规流，root 留在原位撑住那块空间，页面不跳。
export const affixAnatomy = createAnatomy('affix', ['root', 'content'])
