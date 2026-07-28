import { createAnatomy } from '@xihan-ui/core'

// segment 是多实例 part：一段一个节点，文档序即段序，而段序本身随 locale 变
// （zh-CN 是年月日，en-US 是月日年）——同一份作者标记换个 locale 就换一副面孔。
// control 单独一层：它是 role=group 的分段容器，root 还要兜住标题与其它作者内容，
// 两者合成一个节点会让"组"把标题也圈进去。
export const dateFieldAnatomy = createAnatomy('date-field', [
  'root',
  'label',
  'control',
  'segment',
  'hidden-input',
])
