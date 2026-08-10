/** 管线拒收输入时抛这个。构建期报错并中止，不静默丢弃。 */
export class IconPipelineError extends Error {
  constructor(message) {
    super(message)
    this.name = 'IconPipelineError'
  }
}

/** 抛一条带定位前缀的管线错误。 */
export function fail(where, message) {
  throw new IconPipelineError(`${where}：${message}`)
}
