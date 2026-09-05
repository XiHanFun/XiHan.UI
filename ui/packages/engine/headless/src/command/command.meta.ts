import type { ComponentMeta } from '../spec/types'

// content / input / list 三件缺一即违约：没有它们就不是一块能检索的面板。
// trigger 可缺省——面板常由全局快捷键打开，那时没有触发按钮。
export const commandMeta: ComponentMeta = {
  component: 'command',
  requiredParts: ['content', 'input', 'list'],
}
