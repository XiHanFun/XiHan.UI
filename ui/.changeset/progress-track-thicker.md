---
'@xihan-ui/tokens': major
---

**调整** Progress 线形轨道加厚：`--xh-track-thickness-sm` / `-md` / `-lg` 由 3 / 4 / 8px 改为 4 / 8 / 12px（引 `--xh-space-1` / `-2` / `-3`），缺省中档从 4px 的细线变成 8px 的条，卡片里一眼读得出是进度。带分段色带（子弹图）的轨道 `--xh-track-band-thickness-*` 不变，仍各比同档线形厚一档。要回到原来的细轨，在主题里写回三支令牌，或用 `--xh-progress-thickness` 逐个覆盖。
