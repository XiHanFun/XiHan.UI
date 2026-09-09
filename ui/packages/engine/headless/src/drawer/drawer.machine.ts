import type { MachineConfig } from '@xihan-ui/core'
import type { DrawerSchema } from './drawer.types'
import { setup } from '@xihan-ui/core'
import { dialogMachine } from '../dialog'

const { createMachine } = setup<DrawerSchema>()

// 抽屉就是贴边渲染的模态对话框：开合转移、受控回写、消解层、焦点域、滚动锁与背景失活
// 逐条相同，跑的是对话框那一份配置。dialogMachine 的类型锚是 DialogSchema，抽屉的 props
// 多出 side 与 contained（两者都只进 connect、不参与状态转移），这里按抽屉的 schema 重标一次。
const base = dialogMachine as unknown as MachineConfig<DrawerSchema>

/** 抽屉的机器：整份取自对话框，只改机器名与部件 id 用的组件名。 */
export const drawerMachine = createMachine({
  ...base,
  name: 'drawer',
  // 归还焦点时按部件 id 现取 trigger，抽屉的部件名是 drawer
  refs: params => ({ ...base.refs!(params), partScope: 'drawer' }),
})
