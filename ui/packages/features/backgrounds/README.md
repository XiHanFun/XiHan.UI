# @xihan-ui/backgrounds

WebGL2 背景层：把一层会动的背景铺到任意元素上，或者把任意图片变成粒子。框架无关，零第三方依赖。

```ts
import { createBackgroundSurface, fluidEffect } from '@xihan-ui/backgrounds'

const surface = createBackgroundSurface(cardElement, {
  effect: fluidEffect,
  params: { colorA: '#3aa0ff', speed: 1.4 },
})
```

画布以 `pointer-events: none` 铺满宿主元素，永远不会挡住宿主自己的交互；指针事件监听在宿主上。
宿主的 `position` 为 `static` 时会被改成 `relative`，否则绝对定位的画布会跑到别的祖先上去。

## 渲染结构

每张画面有两个绘制通道：

1. **流场通道** —— 一个全屏三角形跑效果的片元着色器。顶点坐标由顶点序号直接算出，不需要顶点缓冲。
2. **粒子通道** —— `gl.POINTS`，两种来源二选一：
   - **程序化**：位置在顶点着色器里由粒子序号派生的种子实时算出，不占顶点缓冲，也不需要 CPU 逐帧更新；
   - **点云**：位置来自顶点缓冲，两份点云之间由 `u_morph` 插值。

两个通道共用同一段 GLSL（`effect.shared`），所以粒子能精确落在流场的特征位置上——
`plasma` 里火花的出生点就是背景那条闪电边界**在粒子诞生那一刻**的位置，不是贴上去的。

片元着色器一律输出**预乘 alpha**，画布因此可以是半透明的（`glass` 就是这么做的）。

## 内置效果

| 名字 | 是什么 |
| --- | --- |
| `fluid` | 流体墨色，连续色域缓慢翻涌，颜料微粒悬浮其中 |
| `glass` | 同一套流场但整体半透明，带高光与焦散，底下的内容透得出来 |
| `mesh` | 网格渐变，最轻的一档，适合大面积常驻背景 |
| `grain` | 胶片颗粒，只叠一层动态噪点，配任何底色 |
| `plasma` | 噪声塑形的闪电边界把画面切成两半，火花甩向暗区；`progress` 由外部驱动时就是一根发光进度条 |
| `aurora` | RGB 三通道错位采样产生色散虹彩，光尘顺光带流动 |
| `beam` | 几条斜向光带缓慢横扫，比 `aurora` 安静 |
| `ripple` | 同心波从热点扩散，粒子骑在波前上被推到边缘 |
| `orb` | 会呼吸、边缘被噪声啃出毛边的发光球 |
| `wave` | 几条正弦带自下而上层叠推移 |
| `starfield` | 三层视差星点，指针移动时近层跟得比远层快 |
| `nebula` | 厚重的多层噪声云团，中间嵌着亮星 |
| `flow-field` | 粒子被旋度噪声推着走，画出持续变形的丝状纹理 |
| `particles` | 数据驱动点云——图片、文字、SVG、参数方程都走它 |

按名字取用需要先注册；直接传效果对象则完全不经过注册表，没引到的效果会被打包器摇掉：

```ts
import { createBackgroundSurface, registerBuiltinEffects } from '@xihan-ui/backgrounds'

registerBuiltinEffects()
createBackgroundSurface(el, { effect: 'aurora' })
```

## 参数

每个效果只声明一次 `params`，取默认值、钳制越界、生成调参界面三件事都从它推出来：

```ts
fluidEffect.params.speed
// { kind: 'number', label: '速度', min: 0, max: 3, step: 0.05, default: 1 }
```

参数常来自界面滑块或持久化配置，所以解析是**宽容**的：越界钳到区间内、类型不对回落到默认值、
规格里没有的键直接丢掉，不会为一个坏值把整张背景打黑。

`setEffect` 只把**用户显式设过**的值带到新效果上。没碰过的项一律回到新效果自己的默认值——
否则从 `mesh` 切到 `grain` 会继承前者的不透明度 1，噪点浓得完全不像它该有的样子。

## 任意图片 → 粒子

图片、文字、SVG、参数方程最终都归一到 `PointCloud`，于是「换形态」永远只是换一份点云：

```ts
import { createBackgroundSurface, imageToCloud, particlesEffect, textToCloud } from '@xihan-ui/backgrounds'

const surface = createBackgroundSurface(el, { effect: particlesEffect })

surface.setCloud(await imageToCloud('/logo.png', { count: 20000 }))
// 一秒后化成文字，中间自动补形变
setTimeout(async () => surface.setCloud(textToCloud('曦寒', { count: 20000 })), 1000)
```

| 来源 | 函数 |
| --- | --- |
| 图片 URL / `img` / `canvas` / `video` / `ImageBitmap` / `Blob` | `imageToCloud` |
| 文字（多行用 `\n`） | `textToCloud` |
| 单条 SVG 路径 | `pathToCloud` |
| 整段 SVG 标记 | `svgToCloud` |
| 参数方程（heart / sphere / torus / ring / disc / grid / spiral / cube / wave） | `shapeCloud` |

前四种共用一条路径：先光栅化成 RGBA 像素，再由 `sampleImageData` 按权重**带放回抽取**。
因此目标点数可以大于也可以小于有效像素数，密度都是均匀的；同一个 `seed` 每次给出同一份点云。

坐标等比映射到 `[-1, 1]`——长边占满，短边按比例收窄。等比是硬要求：分轴缩放会把圆压成椭圆，
图片粒子立刻走形。

自己造点云也行，`PointCloud` 就是三个定长数组：

```ts
interface PointCloud {
  count: number
  positions: Float32Array // xyz
  colors: Float32Array // rgb 0~1
  sizes?: Float32Array
}
```

## 性能与降级

- `quality` 四档（`auto` / `high` / `balanced` / `eco`）决定像素比上限与程序化粒子数量。
  `auto` 按核数与像素比粗判——判错的代价只是画面糙一点或费一点，不值得做真实测帧。
- 效果各自声明 `scale`，按比例降低渲染分辨率再交给浏览器插值放大。画面本身柔和的
  （`mesh` 0.4、`beam` 0.5、`fluid` 0.6）看不出差别，但省掉大半像素。
- 所有画面共用**一条** `requestAnimationFrame`：一张页面上放十几张效果卡时，
  合成一条既省调度开销，也保证同一帧里各卡拿到同一个 `dt`。
- 滚出视口由 `IntersectionObserver` 暂停绘制。
- 系统开启「减弱动态效果」时时间轴冻结，画面停在当前帧（可用 `respectReducedMotion: false` 关掉）。
- 一张页面上的画面数量有硬上限：浏览器每页能同时持有的 WebGL 上下文各家在 16 上下，
  超了会把**最早创建的**丢掉、那几张就此变白板。丢失与恢复本包都接住了（恢复时自动重建
  着色器程序与点云缓冲），但恢复时机由浏览器说了算，所以正解是**用不到的画面及时 `destroy()`**，
  而不是让几十张常驻同一页。
- 环境不支持 WebGL2 时自动降级：`backend` 变成 `'css'`，画布退化成效果自己给的静态渐变，
  接口保持一致，调用方不必分支。

## 边界

| 情况 | 结果 |
| --- | --- |
| 服务端调用 `createBackgroundSurface` | 抛错，它需要 DOM |
| 没有 WebGL2 | 降级成 CSS 静态背景，`backend === 'css'` |
| 着色器编译失败 | 走 `@xihan-ui/kernel` 的诊断通道报出来，不抛异常——一张背景画不出来不该把宿主组件带崩 |
| 跨源图片污染画布 | `imageToCloud` 返回空点云；需要服务端带 CORS 头，或改传 `Blob` |
| 对非 `cloud` 模式的效果调 `setCloud` | 忽略并发一条诊断 |
| 字体还没加载完就调 `textToCloud` | 按回退字形取样；需要精确字形请先 `await document.fonts.ready` |
