import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  overrides: {
    platform: 'node',
    fixedExtension: false,
    // migrate 命令的公开面差异按需从磁盘读，不打进包（见 src/migrations/index.ts）
    copy: [{ from: 'src/migrations/surface.generated.json', to: 'dist' }],
  },
})
