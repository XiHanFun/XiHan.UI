import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, it } from 'vitest'
import { buildComponentTokenManifest } from '../../scripts/lib/component-token-manifest.mjs'

const roots = []

afterAll(async () => {
  for (const root of roots)
    await rm(root, { recursive: true, force: true })
})

async function fixture(css, component = { id: 'sample' }) {
  const root = await mkdtemp(join(tmpdir(), 'xh-component-tokens-'))
  roots.push(root)
  const stylesDir = join(root, 'css')
  await mkdir(stylesDir)
  const componentsPath = join(root, 'components.json')
  const designTokensPath = join(root, 'tokens.json')
  await writeFile(componentsPath, JSON.stringify({
    categories: [{ components: [component] }],
  }))
  await writeFile(designTokensPath, JSON.stringify({ '--xh-space-1': '0.25rem' }))
  if (css != null)
    await writeFile(join(stylesDir, `${component.id}.css`), css)
  return { componentsPath, designTokensPath, stylesDir }
}

it('公开槽经过私有变量投影到最终属性，私有槽与皮肤标记不进入 manifest', async () => {
  const paths = await fixture(`
    [data-scope='sample'][data-part='root'][data-state='open'] {
      --xh-sample-skin: initial;
      --xh-_gap: var(--xh-sample-gap, var(--xh-space-1));
      gap: var(--xh-_gap);
    }
  `)
  const manifest = await buildComponentTokenManifest(paths)
  assert.deepEqual(manifest.tokens, [{
    name: '--xh-sample-gap',
    component: 'sample',
    part: ['root'],
    property: ['gap'],
    state: ['state=open'],
    defaultToken: ['--xh-space-1'],
    visibility: 'public',
    description: 'sample 的 root 部件 gap 覆盖槽。',
  }])
})

it('无组件归属的公开槽直接失败', async () => {
  const paths = await fixture(`[data-scope='sample'][data-part='root'] { color: var(--xh-ghost-fg, red); }`)
  await assert.rejects(buildComponentTokenManifest(paths), /无组件归属的公开槽 --xh-ghost-fg/)
})

it('没有任何 fallback 事实源的公开槽直接失败', async () => {
  const paths = await fixture(`[data-scope='sample'][data-part='root'] { color: var(--xh-sample-fg); }`)
  await assert.rejects(buildComponentTokenManifest(paths), /没有任何带 fallback 的生成事实源/)
})

it('renderless 组件不要求伪造空皮肤', async () => {
  const paths = await fixture(null, { id: 'listener', renderless: true })
  const manifest = await buildComponentTokenManifest(paths)
  assert.deepEqual(manifest.tokens, [])
})
