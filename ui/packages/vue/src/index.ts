// @xihan-ui/vue —— Vue 适配器（组件 + 组合式函数 + machine 运行时）。

export {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from './components/accordion/accordion'
export { useAccordion } from './components/accordion/use-accordion'
export type { AccordionContext } from './components/accordion/use-accordion'
export { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from './components/avatar/avatar'
export { useAvatar } from './components/avatar/use-avatar'
export type { AvatarContext } from './components/avatar/use-avatar'
export { XhBadge } from './components/badge/badge'
export { XhButton } from './components/button'
export { XhCheckbox } from './components/checkbox/checkbox'
export { useCheckbox } from './components/checkbox/use-checkbox'
export type { CheckboxContext } from './components/checkbox/use-checkbox'
export {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from './components/collapsible/collapsible'
export { useCollapsible } from './components/collapsible/use-collapsible'
export type { CollapsibleContext } from './components/collapsible/use-collapsible'
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
export { XhFieldControl, XhFieldDescription, XhFieldErrorText, XhFieldLabel, XhFieldRoot } from './components/field/field'
export { useField } from './components/field/use-field'
export type { FieldContext } from './components/field/use-field'
export {
  XhMenuArrow,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from './components/menu/menu'
export { useMenu } from './components/menu/use-menu'
export type { MenuContext } from './components/menu/use-menu'
export {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from './components/popover/popover'
export { usePopover } from './components/popover/use-popover'
export type { PopoverContext } from './components/popover/use-popover'
export { XhProgress } from './components/progress/progress'
export {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from './components/radio-group/radio-group'
export { useRadioGroup } from './components/radio-group/use-radio-group'
export type { RadioGroupContext } from './components/radio-group/use-radio-group'
export {
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from './components/select/select'
export { useSelect } from './components/select/use-select'
export type { SelectContext } from './components/select/use-select'
export { XhSeparator } from './components/separator/separator'
export { XhSwitch } from './components/switch/switch'
export { useSwitch } from './components/switch/use-switch'
export type { SwitchContext } from './components/switch/use-switch'
export {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from './components/tabs/tabs'
export { useTabs } from './components/tabs/use-tabs'
export type { TabsContext } from './components/tabs/use-tabs'
export { XhToggle } from './components/toggle/toggle'
export { useToggle } from './components/toggle/use-toggle'
export type { ToggleContext } from './components/toggle/use-toggle'
export {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from './components/tooltip/tooltip'
export { useTooltip } from './components/tooltip/use-tooltip'
export type { TooltipContext } from './components/tooltip/use-tooltip'

export { createVueRuntime } from './runtime/create-vue-runtime'
export { vueNormalize } from './runtime/normalize-props'
export { useMachine } from './runtime/use-machine'
export { createVueIdGenerator } from './runtime/vue-id'
