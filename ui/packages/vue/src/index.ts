// @xihan-ui/vue —— Vue 适配器（组件 + 组合式函数 + machine 运行时）。

export { XhButton } from './components/button'
export {
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from './components/dialog/dialog'
export { useDialog } from './components/dialog/use-dialog'
export type { DialogContext } from './components/dialog/use-dialog'

export { createVueRuntime } from './runtime/create-vue-runtime'
export { vueNormalize } from './runtime/normalize-props'
export { useMachine } from './runtime/use-machine'
export { createVueIdGenerator } from './runtime/vue-id'
