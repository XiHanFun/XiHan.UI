// 全局配置注入：locale 与各组件内建文案的应用级默认值。
// 取值优先级：实例 props > 这里注入的全局值 > 组件内建默认（英文）。
// 注入是可选的——不 provide 时组件走原路，零开销。
import type {
  AlertTranslations,
  AnchorTranslations,
  BackTopTranslations,
  BreadcrumbTranslations,
  CarouselTranslations,
  ColorPickerTranslations,
  ComposerTranslations,
  DatePickerTranslations,
  DialogTranslations,
  DrawerTranslations,
  DynamicInputTranslations,
  FileUploadTranslations,
  FloatButtonTranslations,
  ImageViewerTranslations,
  LoadingBarTranslations,
  LogTranslations,
  MentionTranslations,
  NavigationMenuTranslations,
  PaginationTranslations,
  PinInputTranslations,
  PopoverTranslations,
  SpinnerTranslations,
  TagsInputTranslations,
  ThreadTranslations,
  ToasterTranslations,
  ToastTranslations,
  TourTranslations,
} from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue'
import { computed, inject, provide, toValue } from 'vue'

/** 按组件收纳的文案覆盖；date-field 与 date-picker 同一份文案。 */
export interface XhTranslationOverrides {
  'alert'?: Partial<AlertTranslations>
  'anchor'?: Partial<AnchorTranslations>
  'back-top'?: Partial<BackTopTranslations>
  'breadcrumb'?: Partial<BreadcrumbTranslations>
  'carousel'?: Partial<CarouselTranslations>
  'color-picker'?: Partial<ColorPickerTranslations>
  'composer'?: Partial<ComposerTranslations>
  'date-field'?: Partial<DatePickerTranslations>
  'date-picker'?: Partial<DatePickerTranslations>
  'dialog'?: Partial<DialogTranslations>
  'drawer'?: Partial<DrawerTranslations>
  'dynamic-input'?: Partial<DynamicInputTranslations>
  'file-upload'?: Partial<FileUploadTranslations>
  'image-viewer'?: Partial<ImageViewerTranslations>
  'float-button'?: Partial<FloatButtonTranslations>
  'loading-bar'?: Partial<LoadingBarTranslations>
  'log'?: Partial<LogTranslations>
  'mention'?: Partial<MentionTranslations>
  'navigation-menu'?: Partial<NavigationMenuTranslations>
  'pagination'?: Partial<PaginationTranslations>
  'pin-input'?: Partial<PinInputTranslations>
  'popover'?: Partial<PopoverTranslations>
  'spinner'?: Partial<SpinnerTranslations>
  'tags-input'?: Partial<TagsInputTranslations>
  'thread'?: Partial<ThreadTranslations>
  'toast'?: Partial<ToastTranslations>
  'toaster'?: Partial<ToasterTranslations>
  'tour'?: Partial<TourTranslations>
}

export interface XhConfig {
  /** BCP 47 语言标记，喂给日期时间系组件（calendar / date-* / time-*）。 */
  locale?: string
  translations?: XhTranslationOverrides
}

const KEY: InjectionKey<MaybeRefOrGetter<XhConfig>> = Symbol('xh-config')

/** 应用级注入一次；传 ref/getter 即可运行时切语言，组件跟着重渲。 */
export function provideXhConfig(config: MaybeRefOrGetter<XhConfig>): void {
  provide(KEY, config)
}

/** 读当前作用域的全局配置；没注入时得到空对象。 */
export function useXhConfig(): ComputedRef<XhConfig> {
  const injected = inject(KEY, undefined)
  return computed(() => toValue(injected) ?? {})
}

/**
 * 把全局配置垫进组件 props：translations 按键合并（实例键胜出），
 * locale 在实例没给时回落全局。没注入配置时原样返回，零开销。
 * 只能在 setup 期调用。
 */
export function withXhConfig<T extends object>(component: keyof XhTranslationOverrides | 'calendar' | 'time' | 'time-field' | 'time-picker', props: T): T {
  const injected = inject(KEY, undefined)
  if (!injected)
    return props
  return new Proxy(props, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      if (key === 'translations') {
        const globals = (toValue(injected)?.translations as Record<string, object | undefined> | undefined)?.[component]
        if (!globals)
          return value
        return value ? { ...globals, ...(value as object) } : globals
      }
      if (key === 'locale')
        return value ?? toValue(injected)?.locale
      return value
    },
  }) as T
}
