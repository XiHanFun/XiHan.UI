import { createAnatomy } from '@xihan-ui/core'

// key 与 separator 由 keys 数据铺开；root 承担整组唯一可访问名称。
export const kbdGroupAnatomy = createAnatomy('kbd-group', ['root', 'key', 'separator'])
