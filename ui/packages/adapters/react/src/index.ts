export { useDialogContext } from './components/dialog/context'
export {
  XhDialogBody,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogFooter,
  XhDialogHeader,
  XhDialogIndicator,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from './components/dialog/dialog'
export type {
  DialogRootSlotProps,
  XhDialogBodyProps,
  XhDialogCloseTriggerProps,
  XhDialogContentProps,
  XhDialogDescriptionProps,
  XhDialogFooterProps,
  XhDialogHeaderProps,
  XhDialogIndicatorProps,
  XhDialogRootProps,
  XhDialogTitleProps,
  XhDialogTriggerProps,
} from './components/dialog/dialog'
export { useDialog } from './components/dialog/use-dialog'
export type { DialogContext } from './components/dialog/use-dialog'
export { XhSwitch } from './components/switch/switch'
export type { XhSwitchProps } from './components/switch/switch'
export { useSwitch } from './components/switch/use-switch'
// @xihan-ui/react —— React 适配器。
export { mergeXhConfig, useXhConfig, withXhConfig, XhConfigProvider } from './config/config'
export type { XhConfig, XhConfigProviderProps, XhTranslationOverrides } from './config/config'
export { createReactRuntime } from './runtime/create-react-runtime'
export { mergeReactProps } from './runtime/merge-props'
export { reactNormalize } from './runtime/normalize-props'
export { usePortalTarget, XhPortal } from './runtime/portal'
export type { PortalContainer, XhPortalProps } from './runtime/portal'
export { useReactIdGenerator, useReactScope } from './runtime/react-id'
export { renderSlot, slotPaints } from './runtime/slot-content'
export type { SlotChildren } from './runtime/slot-content'
export { useMachine } from './runtime/use-machine'
