---
'@xihan-ui/headless': patch
'@xihan-ui/web-components': patch
---

Marquee 的速度与实测长度改为逐条的内联自定义属性：Web Components 只写、只撤自己的那两条 `--xh-marquee-speed` 与 `--xh-_marquee-measured-span`，作者写在 root 上的内联样式（如 `max-inline-size: 20rem`、`--xh-marquee-span: 300`）不再被整串覆盖。此前 `<xh-marquee>` 里写在 root 上的内联样式会在接线时丢掉，作者自定的一份长度随之失效。
