import type { Scope } from '@xihan-ui/kernel'
import type { DownloadTriggerContent, DownloadTriggerData, DownloadTriggerSchema } from './download-trigger.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<DownloadTriggerSchema>()

/** 没给文件名时写出的名字。 */
export const DOWNLOAD_TRIGGER_FILE_NAME = 'download'

/** 文本内容默认的类型标注。 */
export const DOWNLOAD_TRIGGER_MIME_TYPE = 'text/plain;charset=utf-8'

/**
 * 撤销临时地址前等待的毫秒数。
 *
 * 点击之后浏览器还要一小段时间去取这个地址，当场撤销会让下载落空；
 * 等太久则这份数据一直占着内存。
 *
 * 这段等待不归状态机管：发起下载后机器立刻离开 preparing，
 * 挂在那个状态上的计时器会当场被拆掉——要么撤销永远不发生（地址一直泄着），
 * 要么拆卸时补一次撤销（浏览器还没取完，下载落空）。两条都比现在坏。
 * 计时器取自宿主窗口，宿主整个消失时它跟着一起没了。
 */
export const DOWNLOAD_TRIGGER_REVOKE_DELAY = 1000

/** 文件名归一：缺省与空串都退回内建名——download 属性给空串等于没给名字，浏览器会自己编一个。 */
export function resolveDownloadFileName(fileName: string | undefined): string {
  return fileName == null || fileName === '' ? DOWNLOAD_TRIGGER_FILE_NAME : fileName
}

/**
 * 把作者那一侧的数据形态取成一份内容。
 *
 * 函数形态在这里才被调用，同步抛出也折成 promise 拒绝：调用方只需处理一种失败形态。
 * data 缺席即失败——没有内容可下载，不是"下载了一份空文件"。
 */
export function resolveDownloadData(data: DownloadTriggerData | undefined): Promise<DownloadTriggerContent> {
  if (data == null)
    return Promise.reject(new Error('[xh] download-trigger 没拿到 data，没有可下载的内容'))
  if (typeof data !== 'function')
    return Promise.resolve(data)
  try {
    return Promise.resolve(data())
  }
  catch (error) {
    return Promise.reject(error)
  }
}

/**
 * 把内容包成 Blob。
 *
 * 显式给了 mimeType 就以它为准，Blob 自带的类型也照它重包一次：
 * 类型标注决定浏览器怎么处置这份文件，作者写了就是想改这件事。
 * Blob 取自宿主窗口，跨 iframe 时用本窗口的构造器造出的对象在对面认不出来。
 */
export function toDownloadBlob(
  win: Window & typeof globalThis,
  content: DownloadTriggerContent,
  mimeType: string | undefined,
): Blob {
  if (typeof content === 'string')
    return new win.Blob([content], { type: mimeType ?? DOWNLOAD_TRIGGER_MIME_TYPE })
  return mimeType == null ? content : new win.Blob([content], { type: mimeType })
}

/**
 * 造一次浏览器下载：临时地址 → 隐藏链接 → 点一下 → 撤销地址。
 *
 * 链接必须先进文档再点：部分实现只对在文档里的链接执行激活行为。
 * 全局对象经 scope 取，跨 iframe / shadow 时须问宿主文档的那一份。
 */
export function saveDownload(
  scope: Scope,
  content: DownloadTriggerContent,
  fileName: string,
  mimeType: string | undefined,
): void {
  const win = scope.getWin()
  const doc = scope.getDoc()
  const url = win.URL.createObjectURL(toDownloadBlob(win, content, mimeType))
  const anchor = doc.createElement('a')
  anchor.href = url
  anchor.download = fileName
  // 不参与排版、也不进 Tab 序列
  anchor.style.display = 'none'
  doc.body.appendChild(anchor)
  try {
    anchor.click()
  }
  finally {
    // 链接与地址两件事的时机不同：链接只需要在 click 那一刻在文档里，
    // 激活行为随这一句同步走完，之后留着它只是多一个游离节点；
    // 地址则要活到浏览器把这份数据取完为止，所以只有它延后撤销。
    anchor.remove()
    win.setTimeout(() => win.URL.revokeObjectURL(url), DOWNLOAD_TRIGGER_REVOKE_DELAY)
  }
}

/**
 * 下载触发器机器。
 *
 * 取数住在 preparing 的状态副作用里，靠拆卸钩子挡掉已过期的 promise 回送；
 * 无论成败都回到 idle，界面上不留"下载中"的假象。
 */
export const downloadTriggerMachine = createMachine({
  name: 'download-trigger',
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        // 禁用守卫在机器这一层：点击、键盘激活与 api.download() 都从这里过，
        // 只在连接层挡的话，作者直接调 api 就能绕开禁用把文件写出去
        'DOWNLOAD.TRIGGER': [
          { guard: 'isDisabled' },
          { target: 'preparing' },
        ],
      },
    },
    preparing: {
      effects: ['runDownload'],
      on: {
        'DOWNLOAD.SUCCESS': { target: 'idle', actions: ['invokeComplete'] },
        'DOWNLOAD.ERROR': { target: 'idle', actions: ['invokeError'] },
        // 不接 DOWNLOAD.TRIGGER：取数在途，连点不重复发起
      },
    },
  },
  implementations: {
    guards: {
      isDisabled: ({ prop }) => !!prop('disabled'),
    },
    actions: {
      invokeComplete: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'DOWNLOAD.SUCCESS')
          return
        prop('onDownloadComplete')?.({ fileName: e.fileName })
      },
      invokeError: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'DOWNLOAD.ERROR')
          return
        prop('onDownloadError')?.({ error: e.error, fileName: e.fileName })
      },
    },
    effects: {
      /** 取数并交给浏览器。文件名与类型在发起那一刻定死，不在兑现时重读 prop。 */
      runDownload: ({ prop, scope, send }) => {
        let disposed = false
        const fileName = resolveDownloadFileName(prop('fileName'))
        const mimeType = prop('mimeType')

        resolveDownloadData(prop('data')).then(
          (content) => {
            if (disposed)
              return
            try {
              saveDownload(scope, content, fileName, mimeType)
            }
            catch (error) {
              // 没有 URL.createObjectURL、或文档已经不在了：当作这次下载失败，不谎报完成
              send({ type: 'DOWNLOAD.ERROR', error, fileName })
              return
            }
            send({ type: 'DOWNLOAD.SUCCESS', fileName })
          },
          (error: unknown) => {
            if (!disposed)
              send({ type: 'DOWNLOAD.ERROR', error, fileName })
          },
        )

        return () => {
          disposed = true
        }
      },
    },
  },
})
