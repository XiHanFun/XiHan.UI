import { afterEach, describe, expect, it, vi } from 'vitest'
import { XIHAN_UI_METADATA } from '../src/metadata'
import { getXiHanUiBanner, printXiHanUiBanner, xihanUiBanner } from '../src/vite'

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * 收一次 console.info，返回打出去的那几段。
 * 用完当场还原：对已经被 spy 的方法再 spyOn 拿回的是同一个 spy，
 * 不还原的话第二次收到的 calls 里还带着第一次的。
 */
function capture(run: () => void): string[] {
  const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
  try {
    run()
    return spy.mock.calls.map(call => String(call[0]))
  }
  finally {
    spy.mockRestore()
  }
}

const ESC = '\u001B'

describe('终端启动横幅', () => {
  it('标志、名称版本、描述与寄语都在一段里', () => {
    const text = getXiHanUiBanner({ color: false })
    expect(text).toContain('_/|_/___/_/')
    expect(text).toContain(`${XIHAN_UI_METADATA.name} ${XIHAN_UI_METADATA.displayName} v${XIHAN_UI_METADATA.version}`)
    expect(text).toContain(XIHAN_UI_METADATA.description)
    expect(text).toContain('致她')
  })

  it('不报运行时宿主：终端里适配器还没启动，报出来恒是「未登记」', () => {
    expect(getXiHanUiBanner({ color: false })).not.toContain('宿主')
  })

  it('color 决定要不要转义序列，上色只加序列不改正文', () => {
    const plain = getXiHanUiBanner({ color: false })
    expect(plain).not.toContain(ESC)

    const painted = getXiHanUiBanner({ color: true })
    expect(painted).toContain(ESC)
    // 转义序列本身就是控制字符，这条正则要的正是它
    // eslint-disable-next-line no-control-regex
    expect(painted.replaceAll(/\u001B\[[\d;]*m/g, '')).toBe(plain)
  })

  it('printXiHanUiBanner 打到 console.info；enabled: false 一个字都不打', () => {
    expect(capture(() => printXiHanUiBanner({ color: false }))).toHaveLength(1)
    expect(capture(() => printXiHanUiBanner({ enabled: false }))).toHaveLength(0)
  })
})

describe('vite 插件', () => {
  /** 一份够用的假服务器：记下 logger 收到什么、printUrls 有没有被按顺序调到。 */
  function fakeServer() {
    const logged: { msg: string, options?: { clear?: boolean } }[] = []
    const order: string[] = []
    const server = {
      config: {
        logger: {
          info: (msg: string, options?: { clear?: boolean }) => {
            logged.push({ msg, options })
            order.push('banner')
          },
        },
      },
      printUrls: () => order.push('urls'),
    }
    return { server, logged, order }
  }

  it('排在 Vite 打完地址之后，且不许清屏', () => {
    const { server, logged, order } = fakeServer()
    xihanUiBanner({ color: false }).configureServer(server)

    // 只是包了一层，此刻还没打
    expect(order).toEqual([])

    server.printUrls()
    expect(order).toEqual(['urls', 'banner'])
    expect(logged).toHaveLength(1)
    expect(logged[0]!.options?.clear).toBe(false)
    expect(logged[0]!.msg).toContain('致她')
  })

  it('走 Vite 的日志通道而不是 console：--silent 才管得住', () => {
    const { server } = fakeServer()
    const plugin = xihanUiBanner({ color: false })
    plugin.configureServer(server)
    expect(capture(() => server.printUrls())).toHaveLength(0)
  })

  it('没有 printUrls 时退回端口就绪；两者都没有就当场打', () => {
    let listened: string | null = null
    let fire: (() => void) | null = null
    const plugin = xihanUiBanner({ color: false })

    plugin.configureServer({
      httpServer: {
        once: (event, fn) => {
          listened = event
          fire = fn
        },
      },
    })
    expect(listened).toBe('listening')
    expect(capture(() => fire!())).toHaveLength(1)

    expect(capture(() => plugin.configureServer({}))).toHaveLength(1)
  })

  it('enabled: false 时插件一层都不包', () => {
    const { server, order } = fakeServer()
    xihanUiBanner({ enabled: false }).configureServer(server)
    server.printUrls()
    expect(order).toEqual(['urls'])
  })

  it('插件名带命名空间前缀', () => {
    expect(xihanUiBanner().name).toBe('xihan-ui:banner')
  })
})
