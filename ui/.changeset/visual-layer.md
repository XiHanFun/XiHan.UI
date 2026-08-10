---
"@xihan-ui/backgrounds": major
---

新增视觉层：WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。

一张画面两个绘制通道——流场跑片元着色器，粒子走 `gl.POINTS`。粒子有程序化与点云两种来源：
前者位置由粒子序号在顶点着色器里实时算出，不占顶点缓冲也不需要 CPU 逐帧更新；后者位置来自
顶点缓冲，两份点云之间自动形变。两个通道共用同一段 GLSL，粒子因此能精确落在流场的特征位置上。

内置 14 个效果（fluid / glass / mesh / grain / plasma / aurora / beam / ripple / orb / wave /
starfield / nebula / flow-field / particles）。每个效果只声明一次参数规格，取默认值、钳制越界、
生成调参界面三件事都从它推出来。

图片、文字、SVG、参数方程统一采样成 `PointCloud`，「换形态」就是换一份点云。

不支持 WebGL2 时降级成 CSS 静态背景，接口保持一致。
