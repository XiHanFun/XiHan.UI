import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectTimeZoneSelect, createTimeZoneOptions, filterTimeZoneOptions } from '../src/time-zone-select'

describe('timeZoneSelect 候选', () => {
  it('按参考时刻计算 DST 偏移，并保留规范 IANA 值', () => {
    const summer = createTimeZoneOptions({
      timeZones: ['America/New_York', 'Asia/Shanghai', 'UTC'],
      referenceTime: Date.UTC(2026, 6, 1),
      locale: 'en-US',
    })
    expect(summer.find(option => option.value === 'America/New_York')?.offset).toBe('-04:00')
    expect(summer.find(option => option.value === 'Asia/Shanghai')?.description).toContain('UTC+08:00')
    expect(summer.find(option => option.value === 'UTC')?.offset).toBe('+00:00')

    const winter = createTimeZoneOptions({
      timeZones: ['America/New_York'],
      referenceTime: Date.UTC(2026, 0, 1),
    })
    expect(winter[0]?.offset).toBe('-05:00')
  })

  it('别名规范化后去重，返回冻结快照', () => {
    const options = createTimeZoneOptions({ timeZones: ['UTC', 'Etc/UTC'], referenceTime: 0 })
    expect(options).toHaveLength(1)
    expect(options[0]?.value).toBe('UTC')
    expect(Object.isFrozen(options)).toBe(true)
    expect(Object.isFrozen(options[0])).toBe(true)
  })

  it('按地区、城市和 UTC 偏移检索，多词取交集', () => {
    const options = createTimeZoneOptions({
      timeZones: ['America/New_York', 'Asia/Shanghai', 'Asia/Tokyo'],
      referenceTime: Date.UTC(2026, 0, 1),
    })
    expect(filterTimeZoneOptions(options, 'new york').map(option => option.value)).toEqual(['America/New_York'])
    expect(filterTimeZoneOptions(options, 'UTC+08:00').map(option => option.value)).toEqual(['Asia/Shanghai'])
    expect(filterTimeZoneOptions(options, 'asia +09').map(option => option.value)).toEqual(['Asia/Tokyo'])
    expect(filterTimeZoneOptions(options, '')).toEqual(options)
  })

  it('非法时区不静默保留', () => {
    expect(() => createTimeZoneOptions({ timeZones: ['Mars/Olympus'], referenceTime: 0 })).toThrow(RangeError)
  })

  it('连接层只声明组合根，过滤函数与候选共享同一快照', () => {
    const api = connectTimeZoneSelect({
      timeZones: ['UTC', 'Asia/Shanghai'],
      referenceTime: 0,
    }, normalizeProps)
    const root = api.getRootProps() as Record<string, unknown>
    expect(root['data-scope']).toBe('time-zone-select')
    expect(root['data-part']).toBe('root')
    expect(api.filter('shanghai')).toHaveLength(1)
  })
})
