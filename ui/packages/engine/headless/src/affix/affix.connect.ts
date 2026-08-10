import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { AffixApi, AffixSchema } from './affix.types'
import { dataAttr } from '@xihan-ui/kernel'
import { affixAnatomy } from './affix.anatomy'

const parts = affixAnatomy.build()

export function connectAffix<T extends PropTypes>(
  service: Service<AffixSchema>,
  normalize: NormalizeProps<T>,
): AffixApi<T> {
  const { state, context } = service

  const affixed = state.matches('affixed')
  const pin = context.get('pin')
  const placeholder = context.get('placeholder')
  const pinned = affixed ? pin : null

  return {
    affixed,

    // 占位盒只在吸住时撑高：常规流里它本来就是内容自己的高度，写死反而挡住内容变化
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      style: { blockSize: affixed && placeholder ? `${placeholder.height}px` : '' },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'data-affixed': dataAttr(affixed),
      // 四个键每帧写全，用不上的写空串清掉；position 由皮肤按 data-affixed 给，这里只写数字
      'style': {
        top: pinned?.side === 'top' ? `${pinned.offset}px` : '',
        bottom: pinned?.side === 'bottom' ? `${pinned.offset}px` : '',
        left: pinned ? `${pinned.left}px` : '',
        width: pinned ? `${pinned.width}px` : '',
      },
    }),
  }
}
