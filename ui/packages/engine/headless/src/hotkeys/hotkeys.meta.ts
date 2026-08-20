import type { ComponentMeta } from '../spec/types'

// root 缺省则整组组合的名字无处安放，键帽也没有地方铺。
// key 与 separator 按 keys 铺开，keys 为空时一枚都没有，因此都不是必备件。
export const hotkeysMeta: ComponentMeta = {
  component: 'hotkeys',
  requiredParts: ['root'],
}
