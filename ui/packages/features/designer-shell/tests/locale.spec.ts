import * as uiLocales from '@xihan-ui/web-components/locale'
import { describe, expect, it } from 'vitest'
import * as locales from '../src/locale'

type Bucket = Record<string, unknown>

const packs = Object.entries(locales) as [string, { translations?: Record<string, Bucket> }][]
const english = locales.designerShellEnUS.translations as unknown as Record<string, Bucket>

/** 一个文案值在样例入参下给出的文字：函数按 1 个、2 个、5 个各调一次，字符串原样。 */
function texts(value: unknown): string[] {
  if (typeof value === 'function')
    return [1, 2, 5].map(n => String((value as (arg: number) => unknown)(n)))
  if (typeof value === 'string')
    return [value]
  return Object.values(value as Bucket).flatMap(texts)
}

describe('语言包', () => {
  it('语言与 UI 的内建语言包一一对应，导出名是 designerShell 加 UI 的语言包名', () => {
    const expected = Object.keys(uiLocales).map(name => `designerShell${name[0]!.toUpperCase()}${name.slice(1)}`).sort()
    expect(packs.map(([name]) => name).sort()).toEqual(expected)
  })

  it.each(packs)('%s 的零件与键和英文一致，每条文案都不空', (_name, pack) => {
    const translations = pack.translations ?? {}
    expect(Object.keys(translations).sort()).toEqual(Object.keys(english).sort())
    for (const [tag, bucket] of Object.entries(translations)) {
      const reference = english[tag]!
      expect(Object.keys(bucket).sort(), tag).toEqual(Object.keys(reference).sort())
      for (const [key, value] of Object.entries(bucket)) {
        expect(typeof value, `${tag}.${key}`).toBe(typeof reference[key])
        if (typeof value === 'object')
          expect(Object.keys(value as Bucket).sort(), `${tag}.${key}`).toEqual(Object.keys(reference[key] as Bucket).sort())
        for (const text of texts(value))
          expect(text.trim(), `${tag}.${key}`).not.toBe('')
      }
    }
  })

  it('带入参的文案把入参写进去', () => {
    for (const [name, pack] of packs) {
      const t = pack.translations as unknown as Record<string, Record<string, (arg: never) => string>>
      expect(t['xh-designer-properties']!.belowMinimum!('17' as never), name).toContain('17')
      expect(t['xh-designer-issues']!.errors!(3 as never), name).toContain('3')
      expect(t['xh-designer-ruler']!.horizontalGuide!('42' as never), name).toContain('42')
      expect(t['xh-designer-frame']!.resize!('Inspector' as never), name).toContain('Inspector')
      const measureText = t['xh-designer-transform']!.measureText as unknown as (width: string, height: string, unit: string) => string
      expect(measureText('12', '34', 'mm'), name).toMatch(/12.*34.*mm/)
      expect(measureText('12', '34', ''), name).not.toMatch(/\s$/)
    }
  })
})
