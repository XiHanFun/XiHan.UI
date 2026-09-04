import { createCounterIdGenerator, createScope, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectField } from '../src/field/index'
import { connectFieldset } from '../src/fieldset/index'
import { connectForm, formMachine } from '../src/form/index'

type Dict = Record<string, unknown>

const scope = () => createScope(null, createCounterIdGenerator())

/** 起一台提交必失败的表单，取提交失败那一刻的错误摘要属性。 */
function failedSummaryProps(): Dict {
  const runtime = createVanillaRuntime()
  const service = createService(formMachine, {
    props: () => ({ validate: () => ({ email: '不能为空', password: '太短' }) }),
    runtime,
  })
  runtime.start()
  service.send({ type: 'SUBMIT' })
  return connectForm(service, normalizeProps).getErrorSummaryProps() as Dict
}

function fieldErrorProps(): Dict {
  return connectField({ invalid: true }, scope(), normalizeProps).getErrorTextProps() as Dict
}

function fieldsetErrorProps(): Dict {
  return connectFieldset({ invalid: true }, scope(), normalizeProps).getErrorTextProps() as Dict
}

describe('一次校验失败只有一处打断式活区', () => {
  it('三处错误出口里只有表单的错误摘要是 assertive', () => {
    const regions = [failedSummaryProps(), fieldErrorProps(), fieldsetErrorProps()]
    const assertive = regions.filter(props => props['aria-live'] === 'assertive')
    expect(assertive).toHaveLength(1)
    expect(assertive[0]!['data-part']).toBe('error-summary')
  })

  it('字段与字段集的错误文案排队播报，同时翻转不会互相截断', () => {
    for (const props of [fieldErrorProps(), fieldsetErrorProps()]) {
      expect(props.role).toBe('status')
      expect(props['aria-live']).toBe('polite')
      expect(props['aria-atomic']).toBe('true')
    }
  })

  it('三处都整条一起念，读屏不会只播出半截', () => {
    for (const props of [failedSummaryProps(), fieldErrorProps(), fieldsetErrorProps()])
      expect(props['aria-atomic']).toBe('true')
  })
})
