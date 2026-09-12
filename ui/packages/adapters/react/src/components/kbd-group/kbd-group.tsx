import type { Size } from '@xihan-ui/core'
import type { HotkeysPlatform, KbdGroupProps, KbdGroupTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectKbdGroup } from '@xihan-ui/headless'
import { Fragment } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useKbdPlatform } from '../kbd/use-kbd-platform'

export interface XhKbdGroupProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  keys: string[]
  platform?: HotkeysPlatform
  size?: Size
  pressed?: boolean
  disabled?: boolean
  translations?: Partial<KbdGroupTranslations>
}

/** 数据驱动的完整组合；整组只由一个 aria-label 朗读，不安装键盘监听。 */
export function XhKbdGroup({
  keys,
  platform,
  size,
  pressed,
  disabled,
  translations,
  ...rest
}: XhKbdGroupProps): ReactNode {
  const resolvedPlatform = useKbdPlatform(platform)
  const configured = withXhConfig('kbd-group', { keys, platform: resolvedPlatform, size, pressed, disabled, translations } as KbdGroupProps)
  const api = connectKbdGroup(configured, reactNormalize)
  const separatorProps = api.getSeparatorProps() as Record<string, unknown>

  return (
    <span {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.segments.map((segment, index) => (
        <Fragment key={`${segment.source}-${index}`}>
          {index > 0 ? <span {...separatorProps}>{api.separator}</span> : null}
          <kbd {...api.getKeyProps({ value: segment.source }) as Record<string, unknown>}>{segment.label}</kbd>
        </Fragment>
      ))}
    </span>
  )
}
