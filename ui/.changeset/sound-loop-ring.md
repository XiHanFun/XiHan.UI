---
'@xihan-ui/sound': minor
---

**新增** 播放器 `loop(sound, options?)`：循环播放到返回句柄的 `stop()` 为止，给来电铃声、回铃这类要一直响到有结果的声音。每一遍按配方的 `period`（新字段：相邻两遍起点的间隔，秒；不写即首尾相接）在音频时钟上提前排好，后台页签的计时器被放慢也不断档；上下文挂起时不排，恢复了从头响；`setEnabled(false)` 与 `dispose()` 停下全部循环，循环不参与同名节流。自己实现 `SoundPlayer` 的要补上 `loop`。

**新增** 内置语义名 `ring`（来电）与 `ringback`（回铃），三套主题都有：default 与 soft 是一遍一两秒的长音（来电是两句琶音垫着长音，回铃是平稳的大三度长音），minimal 是按周期连成一串的短点。另导出 `SoundLoop`、`specPeriod`、`MIN_PERIOD`、`MAX_PERIOD`。

**改进** default 与 soft 主题的 `receive` 改成两声上挑的短泡音，与 `notification` 的下行双音拉开方向、速度与音区：收到消息和站内通知前后脚到时一听就分得出来。
