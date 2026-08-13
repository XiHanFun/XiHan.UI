# @xihan-ui/sound

纯 Web Audio 的程序化 UI 音效：零音频文件、零第三方依赖、框架无关。声音是可序列化的声明式配方，主题把 success / error / click 这样的语义名映射到配方；播放器管好自动播放策略、音量、开关与节流。

**谁会装它**：想让界面反馈带声音的人直接装它。三套内置主题开箱即用，也可以只拿配方模型自己调音。

## 用法

```ts
import { createSoundPlayer } from '@xihan-ui/sound'

const sound = createSoundPlayer()
sound.play('success')
```

## 装

```bash
pnpm add @xihan-ui/sound
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `features/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
