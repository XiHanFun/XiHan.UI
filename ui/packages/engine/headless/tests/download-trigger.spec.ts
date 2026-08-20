/**
 * 造下载要真实的活 DOM：临时地址、隐藏链接与那一下点击都发生在文档里，纯逻辑环境里演不出来。
 *
 * @vitest-environment jsdom
 */

import type { DownloadTriggerCompleteDetails, DownloadTriggerErrorDetails, DownloadTriggerSchema } from '../src/download-trigger'
import { createCounterIdGenerator, createScope, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指到组件目录：包主入口的导出由接线一并补，测试不等它
import {
  connectDownloadTrigger,
  DOWNLOAD_TRIGGER_FILE_NAME,
  DOWNLOAD_TRIGGER_MIME_TYPE,
  DOWNLOAD_TRIGGER_REVOKE_DELAY,
  downloadTriggerMachine,
  resolveDownloadData,
  resolveDownloadFileName,
  saveDownload,
  toDownloadBlob,
} from '../src/download-trigger'

type Props = DownloadTriggerSchema['props']
type Dict = Record<string, unknown>

/** 这一次下载被发起时，那个隐藏链接上写着什么。 */
interface CapturedDownload {
  href: string
  download: string
  /** 点下去那一刻链接是否在文档里：部分实现只对在文档里的链接执行激活行为。 */
  connected: boolean
}

/**
 * 拦下所有由 <a download> 发起的跳转并把它记下来。
 * jsdom 不实现导航，放它过去只会打一行"未实现"；捕获阶段拦下既留住了证据也不吵。
 */
function captureDownloads(): { list: CapturedDownload[], dispose: () => void } {
  const list: CapturedDownload[] = []
  const onClick = (event: Event): void => {
    const el = event.target as HTMLAnchorElement
    if (el.tagName !== 'A')
      return
    list.push({
      href: el.getAttribute('href') ?? '',
      download: el.getAttribute('download') ?? '',
      connected: el.isConnected,
    })
    event.preventDefault()
  }
  document.addEventListener('click', onClick, true)
  return { list, dispose: () => document.removeEventListener('click', onClick, true) }
}

const teardowns: Array<() => void> = []

afterEach(() => {
  while (teardowns.length) teardowns.pop()!()
  vi.restoreAllMocks()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

function makeTrigger(initial: Props = {}) {
  const completes: DownloadTriggerCompleteDetails[] = []
  const errors: DownloadTriggerErrorDetails[] = []
  const props: Props = {
    ...initial,
    onDownloadComplete: d => completes.push(d),
    onDownloadError: d => errors.push(d),
  }
  const runtime = createVanillaRuntime()
  // 每次展开成新对象：props 身份变了，解释器的归一化缓存才会失效，改 prop 才看得见
  const service = createService(downloadTriggerMachine, {
    props: () => ({ ...props }),
    runtime,
    scope: createScope(document.body, createCounterIdGenerator()),
  })
  runtime.start()
  teardowns.push(() => runtime.stop())
  return {
    state: () => service.state.get(),
    setProps: (next: Props) => Object.assign(props, next),
    api: () => connectDownloadTrigger(service, normalizeProps),
    completes,
    errors,
  }
}

/** 等取数的 promise 兑现并让机器把回送的事件消化掉。 */
async function settleDownload(): Promise<void> {
  for (let i = 0; i < 6; i++)
    await Promise.resolve()
}

function fire(props: Dict, key: string, event: unknown): void {
  (props[key] as (e: unknown) => void)(event)
}

describe('download-trigger 文件名归一', () => {
  it('缺省与空串都退回内建名：download 属性给空串等于没给名字', () => {
    expect(resolveDownloadFileName(undefined)).toBe(DOWNLOAD_TRIGGER_FILE_NAME)
    expect(resolveDownloadFileName('')).toBe(DOWNLOAD_TRIGGER_FILE_NAME)
  })

  it('给了就原样用，不替作者补扩展名', () => {
    expect(resolveDownloadFileName('report')).toBe('report')
    expect(resolveDownloadFileName('报表.csv')).toBe('报表.csv')
  })
})

describe('resolveDownloadData 取数', () => {
  it('值形态直通，空串也是合法内容', async () => {
    await expect(resolveDownloadData('hello')).resolves.toBe('hello')
    await expect(resolveDownloadData('')).resolves.toBe('')
  })

  it('函数形态在这里才被调用，同步返回值也折成 promise', async () => {
    const make = vi.fn(() => 'lazy')
    const promise = resolveDownloadData(make)
    expect(make).toHaveBeenCalledTimes(1)
    await expect(promise).resolves.toBe('lazy')
  })

  it('取数函数同步抛出时同样走拒绝：调用方只需处理一种失败形态', async () => {
    const boom = new Error('算不出来')
    await expect(resolveDownloadData(() => {
      throw boom
    })).rejects.toBe(boom)
  })

  it('data 缺席即失败，不当成"下载一份空文件"', async () => {
    await expect(resolveDownloadData(undefined)).rejects.toBeInstanceOf(Error)
  })
})

describe('toDownloadBlob 内容打包', () => {
  it('文本缺省按纯文本标注', () => {
    const blob = toDownloadBlob(window, 'a,b\n1,2', undefined)
    expect(blob.type).toBe(DOWNLOAD_TRIGGER_MIME_TYPE)
  })

  it('显式 mimeType 覆盖默认标注', () => {
    expect(toDownloadBlob(window, 'a,b', 'text/csv').type).toBe('text/csv')
  })

  it('没给 mimeType 时 Blob 原样带走自己的类型', () => {
    const source = new Blob(['{}'], { type: 'application/json' })
    expect(toDownloadBlob(window, source, undefined)).toBe(source)
  })

  it('给了 mimeType 就连 Blob 自带的类型也照它重包：作者写了就是想改这件事', () => {
    const source = new Blob(['{}'], { type: 'application/json' })
    const packed = toDownloadBlob(window, source, 'text/plain')
    expect(packed).not.toBe(source)
    expect(packed.type).toBe('text/plain')
  })
})

describe('saveDownload 造一次浏览器下载', () => {
  it('隐藏链接带着文件名进文档、点一下、随即离场', () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    const scope = createScope(document.body, createCounterIdGenerator())

    saveDownload(scope, 'hello', 'a.txt', undefined)

    expect(captured.list).toHaveLength(1)
    expect(captured.list[0]!.download).toBe('a.txt')
    expect(captured.list[0]!.href.startsWith('blob:')).toBe(true)
    // 点下去那一刻必须在文档里，点完不留痕
    expect(captured.list[0]!.connected).toBe(true)
    expect(document.querySelector('a')).toBeNull()
  })

  it('临时地址延后撤销：当场撤销会让浏览器取不到这份数据', () => {
    vi.useFakeTimers()
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    const revoke = vi.spyOn(URL, 'revokeObjectURL')
    const scope = createScope(document.body, createCounterIdGenerator())

    saveDownload(scope, 'hello', 'a.txt', undefined)
    expect(revoke).not.toHaveBeenCalled()

    vi.advanceTimersByTime(DOWNLOAD_TRIGGER_REVOKE_DELAY)
    expect(revoke).toHaveBeenCalledWith(captured.list[0]!.href)
  })
})

describe('downloadTriggerMachine 一次下载的来回', () => {
  it('点下去先进 preparing，数据交出去后回 idle 并通知完成', async () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    const trigger = makeTrigger({ data: 'a,b\n1,2', fileName: 'report.csv', mimeType: 'text/csv' })

    fire(trigger.api().getRootProps() as Dict, 'onClick', undefined)
    expect(trigger.state()).toBe('preparing')

    await settleDownload()
    expect(trigger.state()).toBe('idle')
    expect(captured.list[0]!.download).toBe('report.csv')
    expect(trigger.completes).toEqual([{ fileName: 'report.csv' }])
    expect(trigger.errors).toEqual([])
  })

  it('取数失败回 idle 并把原始原因报出去，不谎报完成', async () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    const boom = new Error('接口挂了')
    const trigger = makeTrigger({ data: () => Promise.reject(boom), fileName: 'x.txt' })

    fire(trigger.api().getRootProps() as Dict, 'onClick', undefined)
    await settleDownload()

    expect(trigger.state()).toBe('idle')
    expect(captured.list).toEqual([])
    expect(trigger.completes).toEqual([])
    expect(trigger.errors).toEqual([{ error: boom, fileName: 'x.txt' }])
  })

  it('取数在途时连点不重复取数：同一次点击只造一份数据', async () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    const make = vi.fn(() => new Promise<string>((resolve) => {
      setTimeout(resolve, 0, 'done')
    }))
    const trigger = makeTrigger({ data: make, fileName: 'x.txt' })
    const props = trigger.api().getRootProps() as Dict

    fire(props, 'onClick', undefined)
    fire(trigger.api().getRootProps() as Dict, 'onClick', undefined)
    fire(trigger.api().getRootProps() as Dict, 'onClick', undefined)
    expect(make).toHaveBeenCalledTimes(1)

    await new Promise(resolve => setTimeout(resolve, 1))
    await settleDownload()
    expect(trigger.state()).toBe('idle')
    expect(captured.list).toHaveLength(1)
  })

  it('文件名在发起那一刻定死：取数途中宿主改名，报出去的仍是实际写出的那一份', async () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    let release: (value: string) => void = () => {}
    const trigger = makeTrigger({
      data: () => new Promise<string>((resolve) => {
        release = resolve
      }),
      fileName: 'old.txt',
    })

    fire(trigger.api().getRootProps() as Dict, 'onClick', undefined)
    trigger.setProps({ fileName: 'new.txt' })
    release('done')
    await settleDownload()

    expect(captured.list[0]!.download).toBe('old.txt')
    expect(trigger.completes).toEqual([{ fileName: 'old.txt' }])
  })

  it('禁用时点不动：不进 preparing，也不去取数', async () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    const make = vi.fn(() => 'x')
    const trigger = makeTrigger({ data: make, disabled: true })

    fire(trigger.api().getRootProps() as Dict, 'onClick', undefined)
    await settleDownload()

    expect(trigger.state()).toBe('idle')
    expect(make).not.toHaveBeenCalled()
    expect(captured.list).toEqual([])
  })

  it('禁用时 api.download() 同样不动：守卫在机器里，绕开 DOM 也写不出文件', async () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    const make = vi.fn(() => 'x')
    const trigger = makeTrigger({ data: make, fileName: 'x.txt', disabled: true })

    trigger.api().download()
    await settleDownload()

    expect(trigger.state()).toBe('idle')
    expect(trigger.api().preparing).toBe(false)
    expect(make).not.toHaveBeenCalled()
    expect(captured.list).toEqual([])
    expect(trigger.completes).toEqual([])
    expect(trigger.errors).toEqual([])
  })

  it('禁用只挡新的发起，途中改成禁用不打断已在跑的那一次', async () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    let release: (value: string) => void = () => {}
    const trigger = makeTrigger({
      data: () => new Promise<string>((resolve) => {
        release = resolve
      }),
      fileName: 'x.txt',
    })

    fire(trigger.api().getRootProps() as Dict, 'onClick', undefined)
    expect(trigger.state()).toBe('preparing')
    trigger.setProps({ disabled: true })
    release('done')
    await settleDownload()

    expect(trigger.state()).toBe('idle')
    expect(captured.list[0]!.download).toBe('x.txt')
    expect(trigger.completes).toEqual([{ fileName: 'x.txt' }])
  })
})

describe('connectDownloadTrigger 属性表', () => {
  it('闲置态：原生按钮、不忙、无 data-disabled', () => {
    const props = makeTrigger({ data: 'x' }).api().getRootProps() as Dict
    expect(props.type).toBe('button')
    expect(props['data-scope']).toBe('download-trigger')
    expect(props['data-part']).toBe('root')
    expect(props['aria-busy']).toBe('false')
    expect(props['data-state']).toBe('idle')
    expect(props['data-disabled']).toBeUndefined()
    expect(props.disabled).toBeUndefined()
  })

  it('禁用走原生 disabled，同时留一个 data-disabled 给皮肤与作者取用', () => {
    const props = makeTrigger({ data: 'x', disabled: true }).api().getRootProps() as Dict
    expect(props.disabled).toBe(true)
    expect(props['data-disabled']).toBe('')
  })

  it('取数在途报 aria-busy，但按钮不变禁用：变禁用会把焦点从按钮上弹走', () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    const trigger = makeTrigger({ data: () => new Promise<string>(() => {}), fileName: 'x.txt' })

    fire(trigger.api().getRootProps() as Dict, 'onClick', undefined)
    const props = trigger.api().getRootProps() as Dict
    expect(props['data-state']).toBe('preparing')
    expect(props['aria-busy']).toBe('true')
    expect(props.disabled).toBeUndefined()
  })

  it('api.download() 与点按钮同一条路，api.fileName 与实际写出的那份同源', async () => {
    const captured = captureDownloads()
    teardowns.push(captured.dispose)
    const trigger = makeTrigger({ data: 'x' })

    expect(trigger.api().fileName).toBe(DOWNLOAD_TRIGGER_FILE_NAME)
    trigger.api().download()
    expect(trigger.api().preparing).toBe(true)

    await settleDownload()
    expect(captured.list[0]!.download).toBe(DOWNLOAD_TRIGGER_FILE_NAME)
  })
})
