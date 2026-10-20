// @vitest-environment jsdom

// 自动保存：开着时有未保存的修改，停手约 1 秒把整份模板存进本机草稿；变干净时删掉草稿，关着时不删已有草稿；
// 下次载入同一个草稿键时，草稿和载入的不一样就问恢复还是丢弃。读写失败安静跳过。
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerAutosaveOptions } from '../src'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { autoSaveOf, createDesignerAutosave, DESIGNER_COMMANDS_EN_US, DESIGNER_SETTING_KEYS } from '../src'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 21, 14, 32))
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  document.body.replaceChildren()
})

const KEY = 'xh-designer-draft:xh-flow-designer:t1'

function setup(extra: Partial<DesignerAutosaveOptions> = {}) {
  const root = document.createElement('div')
  document.body.append(root)
  let doc: JsonValue = { nodes: [] }
  let enabled = true
  const restored: JsonValue[] = []
  const prompts: { title: string, content: string, okText: string, cancelText: string }[] = []
  let answer = true
  const autosave = createDesignerAutosave({
    root,
    kind: 'xh-flow-designer',
    key: () => 't1',
    enabled: () => enabled,
    snapshot: () => doc,
    restore: document => void restored.push(document),
    confirm: async (options) => {
      prompts.push(options)
      return answer
    },
    translations: () => DESIGNER_COMMANDS_EN_US,
    ...extra,
  })
  return {
    autosave,
    restored,
    prompts,
    setDoc: (next: JsonValue) => void (doc = next),
    setEnabled: (next: boolean) => void (enabled = next),
    answer: (next: boolean) => void (answer = next),
  }
}

describe('设置', () => {
  it('「基础」里的自动保存缺省关；autoSaveOf 只认 true', () => {
    expect(DESIGNER_SETTING_KEYS.autoSave).toBe('general.autoSave')
    expect([autoSaveOf(undefined), autoSaveOf({ 'general.autoSave': 'yes' }), autoSaveOf({ 'general.autoSave': true })]).toEqual([false, false, true])
  })
})

describe('createDesignerAutosave', () => {
  it('开着且有未保存的修改：停手 1 秒存一份（连着改只存最后一次），键是设计器种类加草稿键，带存的时间', () => {
    const t = setup()
    t.setDoc({ nodes: [1] })
    t.autosave.changed(true)
    vi.advanceTimersByTime(600)
    t.setDoc({ nodes: [1, 2] })
    t.autosave.changed(true)
    vi.advanceTimersByTime(999)
    expect(localStorage.getItem(KEY)).toBeNull()
    vi.advanceTimersByTime(1)
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ savedAt: new Date(2026, 9, 21, 14, 32, 1, 600).getTime(), document: { nodes: [1, 2] } })
  })

  it('变干净（存完或撤销回保存点）时删掉草稿、取消待存的；关着自动保存时不存，也不删已有的草稿', () => {
    const t = setup()
    t.autosave.changed(true)
    vi.advanceTimersByTime(1000)
    expect(localStorage.getItem(KEY)).not.toBeNull()
    t.autosave.changed(true)
    t.autosave.changed(false)
    vi.advanceTimersByTime(1000)
    expect(localStorage.getItem(KEY)).toBeNull()
    localStorage.setItem(KEY, JSON.stringify({ savedAt: 1, document: { old: true } }))
    t.setEnabled(false)
    t.autosave.changed(true)
    vi.advanceTimersByTime(1000)
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ savedAt: 1, document: { old: true } })
  })

  it('没给草稿键时按页面地址区分；存不了时安静跳过、不抛错', () => {
    const t = setup({ key: () => undefined })
    t.autosave.changed(true)
    vi.advanceTimersByTime(1000)
    expect(Object.keys(localStorage)).toEqual([`xh-designer-draft:xh-flow-designer:${location.pathname}${location.search}${location.hash}`])
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    try {
      t.autosave.changed(true)
      expect(() => vi.advanceTimersByTime(1000)).not.toThrow()
    }
    finally {
      setItem.mockRestore()
    }
  })

  it('载入时有和它不一样的草稿：问「发现未保存的草稿（时间）」，恢复交给 restore；丢弃就删掉草稿', async () => {
    const t = setup()
    const savedAt = new Date(2026, 9, 20, 9, 5).getTime()
    localStorage.setItem(KEY, JSON.stringify({ savedAt, document: { nodes: ['draft'] } }))
    await t.autosave.loaded({ nodes: [] })
    const time = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(savedAt)
    expect(t.prompts).toEqual([{
      title: DESIGNER_COMMANDS_EN_US.draftFound(time),
      content: DESIGNER_COMMANDS_EN_US.draftFoundDescription,
      okText: DESIGNER_COMMANDS_EN_US.draftRestore,
      cancelText: DESIGNER_COMMANDS_EN_US.draftDiscard,
    }])
    expect(t.restored).toEqual([{ nodes: ['draft'] }])
    t.answer(false)
    await t.autosave.loaded({ nodes: [] })
    expect([t.prompts.length, t.restored.length, localStorage.getItem(KEY)]).toEqual([2, 1, null])
  })

  it('草稿和载入的一样就悄悄删掉；没有草稿或草稿读不出时什么都不问', async () => {
    const t = setup()
    localStorage.setItem(KEY, JSON.stringify({ savedAt: 1, document: { nodes: [] } }))
    await t.autosave.loaded({ nodes: [] })
    expect([t.prompts.length, localStorage.getItem(KEY)]).toEqual([0, null])
    localStorage.setItem(KEY, '{broken')
    await t.autosave.loaded({ nodes: [] })
    localStorage.setItem(KEY, JSON.stringify({ document: 1 }))
    await t.autosave.loaded({ nodes: [] })
    expect(t.prompts.length).toBe(0)
  })
})
