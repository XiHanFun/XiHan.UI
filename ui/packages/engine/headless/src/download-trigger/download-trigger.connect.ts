import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { DownloadTriggerApi, DownloadTriggerSchema } from './download-trigger.types'
import { dataAttr } from '@xihan-ui/core'
import { downloadTriggerAnatomy } from './download-trigger.anatomy'
import { resolveDownloadFileName } from './download-trigger.machine'

const parts = downloadTriggerAnatomy.build()

export function connectDownloadTrigger<T extends PropTypes>(
  service: Service<DownloadTriggerSchema>,
  normalize: NormalizeProps<T>,
): DownloadTriggerApi<T> {
  const { state, prop, send } = service

  const status = state.get()
  const preparing = status === 'preparing'
  const disabled = !!prop('disabled')
  // 与副作用里写进 download 属性的是同一份算法，界面上报的文件名不会与实际写出的那份对不上
  const fileName = resolveDownloadFileName(prop('fileName'))

  return {
    status,
    preparing,
    disabled,
    fileName,
    // 禁用与在途两道守卫都在机器里，这里只把意图递进去
    download: () => send({ type: 'DOWNLOAD.TRIGGER' }),

    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      // 不给 type 会在 form 里变成 submit，Enter 直接提交表单
      'type': 'button',
      // 单体原生控件用原生 disabled：它本就不该被聚焦，也不该派 click
      'disabled': disabled || undefined,
      // 取数在途时按钮仍可聚焦、仍留在原位，只把"正在忙"如实报给读屏
      'aria-busy': preparing ? 'true' : undefined,
      // 按钮里只放一个图标时没有可见文字，可及名字只能由这里给。
      // 不给缺省值：按钮里多半写着「导出 CSV」这类可见文字，凭空盖一个名字上去
      // 会让读屏念的与屏幕上写的对不上
      'aria-label': prop('translations')?.trigger,
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': status,
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (!disabled)
          send({ type: 'DOWNLOAD.TRIGGER' })
      },
    }),
  }
}
