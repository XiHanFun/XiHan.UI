import { describe, expect, it } from 'vitest'
import {
  isTimeItemUnavailable,
  laterTimeBound,
  resolveTimeStep,
  timeBoundsOnDate,
  timeColumns,
  timeColumnsFor,
  timeItemValue,
  timeUnavailableValue,
} from '../src/shared/time-constraint'

describe('可选值列表（纯函数）', () => {
  it('默认排时分两列：时 0-23、分逐分钟，全部两位补零', () => {
    const columns = timeColumns()
    expect(columns.map(c => c.unit)).toEqual(['hour', 'minute'])
    expect(columns[0]!.options).toHaveLength(24)
    expect(columns[0]!.options[0]).toBe('00')
    expect(columns[0]!.options[23]).toBe('23')
    expect(columns[1]!.options).toHaveLength(60)
    expect(columns[1]!.options[5]).toBe('05')
  })

  it('granularity 决定排几列：hour 只有时列，second 多一列逐秒', () => {
    expect(timeColumns({ granularity: 'hour' }).map(c => c.unit)).toEqual(['hour'])
    const second = timeColumns({ granularity: 'second' })
    expect(second.map(c => c.unit)).toEqual(['hour', 'minute', 'second'])
    expect(second[2]!.options).toHaveLength(60)
  })

  it('步进按单位各管各的：分列 15 分一格时秒列照旧逐秒', () => {
    const columns = timeColumns({ granularity: 'second', timeStep: { minute: 15 } })
    expect(columns[1]!.options).toEqual(['00', '15', '30', '45'])
    expect(columns[2]!.options).toHaveLength(60)
  })

  it('秒列与时列也各有步进', () => {
    const columns = timeColumns({ granularity: 'second', timeStep: { hour: 6, second: 20 } })
    expect(columns[0]!.options).toEqual(['00', '06', '12', '18'])
    expect(columns[1]!.options).toHaveLength(60)
    expect(columns[2]!.options).toEqual(['00', '20', '40'])
  })

  it('12 小时制下时的步进按真实小时取，显示值随上下午换算', () => {
    // 3 小时一格：上午 0、3、6、9 点显示 12、03、06、09，下午同理
    expect(timeColumns({ hourCycle: 12, timeStep: { hour: 3 } })[0]!.options).toEqual(['03', '06', '09', '12'])
    // 5 小时一格：上午 0、5、10 点，下午 15、20 点——两半天落在不同的显示值上
    expect(timeColumns({ hourCycle: 12, timeStep: { hour: 5 }, dayPeriod: 'am' })[0]!.options).toEqual(['05', '10', '12'])
    expect(timeColumns({ hourCycle: 12, timeStep: { hour: 5 }, dayPeriod: 'pm' })[0]!.options).toEqual(['03', '08'])
    // 上下午列同样按步进收窄：挑了 5 点，下午 5 点（17 点）不在步进上
    expect(timeColumns({ hourCycle: 12, timeStep: { hour: 5 }, hour: 5 }).at(-1)!.options).toEqual(['00'])
  })

  it('步进写坏了回落到逐格：0 会让循环停不下来，不小于进制的只剩一格', () => {
    expect(resolveTimeStep()).toEqual({ hour: 1, minute: 1, second: 1 })
    expect(resolveTimeStep({ minute: 0 }).minute).toBe(1)
    expect(resolveTimeStep({ minute: -5 }).minute).toBe(1)
    expect(resolveTimeStep({ minute: 60 }).minute).toBe(1)
    expect(resolveTimeStep({ second: 60 }).second).toBe(1)
    expect(resolveTimeStep({ hour: 24 }).hour).toBe(1)
    expect(resolveTimeStep({ hour: 23 }).hour).toBe(23)
    expect(resolveTimeStep({ minute: Number.NaN }).minute).toBe(1)
    expect(resolveTimeStep({ minute: 7.9 }).minute).toBe(7)
    expect(timeColumns({ timeStep: { minute: 0 } })[1]!.options).toHaveLength(60)
  })

  it('12 小时制下时列是 1-12', () => {
    expect(timeColumns({ hourCycle: 12 })[0]!.options).toEqual(
      ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    )
  })

  it('上下午成列，只在 12 小时制下出现且恒排末位', () => {
    expect(timeColumns({ hourCycle: 12 }).map(c => c.unit)).toEqual(['hour', 'minute', 'dayPeriod'])
    expect(timeColumns({ hourCycle: 12, granularity: 'second' }).map(c => c.unit))
      .toEqual(['hour', 'minute', 'second', 'dayPeriod'])
    // granularity=hour 也照给：上下午与精度无关
    expect(timeColumns({ hourCycle: 12, granularity: 'hour' }).map(c => c.unit))
      .toEqual(['hour', 'dayPeriod'])
    // 24 小时制没有这一列
    expect(timeColumns({ granularity: 'second' }).some(c => c.unit === 'dayPeriod')).toBe(false)
  })

  it('上下午两格写的是 00 / 01，与这一段上报的数同一个域', () => {
    expect(timeColumns({ hourCycle: 12 }).at(-1)!.options).toEqual(['00', '01'])
  })

  it('上下午列在小时已选中且换算过去出界时才收窄', () => {
    // 还没挑小时：两格都留着
    expect(timeColumns({ hourCycle: 12, min: '09:00', max: '18:00' }).at(-1)!.options).toEqual(['00', '01'])
    // 挑的是 9 点（显示 09）：上午 9 点在界内，下午 9 点是 21 点、出界
    expect(timeColumns({ hourCycle: 12, min: '09:00', max: '18:00', hour: 9 }).at(-1)!.options).toEqual(['00'])
    // 挑的是 15 点（显示 03）：上午 3 点在界外，只剩下午
    expect(timeColumns({ hourCycle: 12, min: '09:00', max: '18:00', hour: 15 }).at(-1)!.options).toEqual(['01'])
    // 挑的是 10 点（显示 10）：上午 10 点、下午 22 点，只剩上午
    expect(timeColumns({ hourCycle: 12, min: '09:00', max: '18:00', hour: 10 }).at(-1)!.options).toEqual(['00'])
  })

  it('min/max 裁掉时列两端', () => {
    expect(timeColumns({ min: '09:00', max: '11:00' })[0]!.options).toEqual(['09', '10', '11'])
  })

  it('下界落在半点上时，那一个整点仍留着（它下面还有分可选）', () => {
    const columns = timeColumns({ min: '09:30', hour: 9 })
    expect(columns[0]!.options[0]).toBe('09')
    // 9 点这一格里，30 分之前的都不可选
    expect(columns[1]!.options[0]).toBe('30')
    expect(columns[1]!.options).toHaveLength(30)
  })

  it('分列只在时已选中且正好卡在界上时才收窄', () => {
    // 还没挑时：不替用户先限死
    expect(timeColumns({ min: '09:30' })[1]!.options).toHaveLength(60)
    // 挑的是界内的另一个整点：整列都可选
    expect(timeColumns({ min: '09:30', hour: 10 })[1]!.options).toHaveLength(60)
    // 上界那一侧同理
    expect(timeColumns({ max: '11:15', hour: 11 })[1]!.options).toEqual(['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'])
    expect(timeColumns({ max: '11:15', hour: 10 })[1]!.options).toHaveLength(60)
  })

  it('秒列只在时与分都卡在界上时才收窄', () => {
    const onBound = timeColumns({ granularity: 'second', min: '09:30:20', hour: 9, minute: 30 })
    expect(onBound[2]!.options[0]).toBe('20')
    expect(onBound[2]!.options).toHaveLength(40)
    const inside = timeColumns({ granularity: 'second', min: '09:30:20', hour: 9, minute: 31 })
    expect(inside[2]!.options).toHaveLength(60)
  })

  it('12 小时制的裁剪按换算回去的真实小时判，上午下午各裁各的', () => {
    // 上午：09:00-18:00 之间只剩 9/10/11（12 上午是 0 点，在界外）
    expect(timeColumns({ hourCycle: 12, min: '09:00', max: '18:00', dayPeriod: 'am' })[0]!.options)
      .toEqual(['09', '10', '11'])
    // 下午：12(=12 点) 与 1-6(=13-18 点) 可选，7 点之后（19 点起）出界
    expect(timeColumns({ hourCycle: 12, min: '09:00', max: '18:00', dayPeriod: 'pm' })[0]!.options)
      .toEqual(['01', '02', '03', '04', '05', '06', '12'])
  })

  it('界写坏了当作没设界', () => {
    expect(timeColumns({ min: '不是时间', max: '' })[0]!.options).toHaveLength(24)
  })

  it('timeColumnsFor 从逐段缓冲里取上午/下午：小时已填时由它说了算', () => {
    const columns = timeColumnsFor(
      { hour: 15, minute: null, second: null, dayPeriod: 'am' },
      { hourCycle: 12, min: '09:00', max: '18:00' },
    )
    // 小时是 15（下午 3 点），缓冲里那个 am 不作数
    expect(columns[0]!.options).toEqual(['01', '02', '03', '04', '05', '06', '12'])
  })

  it('timeItemValue 一律两位补零，与段上的文字同一套写法', () => {
    expect(timeItemValue(0)).toBe('00')
    expect(timeItemValue(9)).toBe('09')
    expect(timeItemValue(23)).toBe('23')
  })
})

describe('逐值可选性的上下文', () => {
  const draft = { hour: 21, minute: 15, second: null, dayPeriod: null }

  it('时列恒按 24 小时制交给判定：12 小时制下按这份值的上下午换算', () => {
    expect(timeUnavailableValue('hour', '09', 12, 'pm')).toBe('21')
    expect(timeUnavailableValue('hour', '12', 12, 'am')).toBe('00')
    expect(timeUnavailableValue('hour', '09', 24, 'pm')).toBe('09')
    expect(timeUnavailableValue('minute', '09', 12, 'pm')).toBe('09')
  })

  it('判定收到已选的时分、所属日期与区间的端', () => {
    const calls: unknown[] = []
    const hit = isTimeItemUnavailable((value, unit, context) => {
      calls.push([value, unit, context])
      return unit === 'minute' && context.hour === 21 && Number(value) < 30
    }, { unit: 'minute', value: '20', hourCycle: 12, draft, date: '2026-09-28', index: 1 })
    expect(hit).toBe(true)
    expect(calls).toEqual([['20', 'minute', { hour: 21, minute: 15, date: '2026-09-28', index: 1 }]])
  })

  it('12 小时制的时格换算后再交给判定；没给日期与端时是 null', () => {
    const seen: string[] = []
    isTimeItemUnavailable((value, _unit, context) => {
      seen.push(value)
      expect(context.date).toBeNull()
      expect(context.index).toBeNull()
      return false
    }, { unit: 'hour', value: '09', hourCycle: 12, draft })
    // 这份值在下午（21 点），09 这一格是 21 点
    expect(seen).toEqual(['21'])
  })

  it('没给判定时恒可选', () => {
    expect(isTimeItemUnavailable(undefined, { unit: 'hour', value: '09', hourCycle: 24, draft })).toBe(false)
  })
})

describe('某一天上的时间界', () => {
  it('与带时间段的 min / max 同一天时取它的时间段', () => {
    expect(timeBoundsOnDate('2026-09-28', '2026-09-28T09:30', '2026-09-28T18:00'))
      .toEqual({ min: '09:30', max: '18:00', closed: false })
  })

  it('只到日期的界、以及界内的其余日子不设时间界', () => {
    expect(timeBoundsOnDate('2026-09-28', '2026-09-28', '2026-09-30')).toEqual({ min: undefined, max: undefined, closed: false })
    expect(timeBoundsOnDate('2026-09-29', '2026-09-28T09:30', '2026-09-30T18:00')).toEqual({ min: undefined, max: undefined, closed: false })
  })

  it('早于 min 或晚于 max 的日子整天不可选', () => {
    expect(timeBoundsOnDate('2026-09-27', '2026-09-28T09:30').closed).toBe(true)
    expect(timeBoundsOnDate('2026-10-01', undefined, '2026-09-30T18:00').closed).toBe(true)
  })

  it('没有日期或日期写坏了不设界', () => {
    expect(timeBoundsOnDate(null, '2026-09-28T09:30')).toEqual({ closed: false })
    expect(timeBoundsOnDate('不是日期', '2026-09-28T09:30')).toEqual({ closed: false })
  })

  it('两个下界取较晚的那个', () => {
    expect(laterTimeBound('09:30', '10:00')).toBe('10:00')
    expect(laterTimeBound('11:00', '10:00')).toBe('11:00')
    expect(laterTimeBound(undefined, '10:00')).toBe('10:00')
    expect(laterTimeBound('10:00', undefined)).toBe('10:00')
    expect(laterTimeBound(undefined, undefined)).toBeUndefined()
  })
})
