<script setup lang="ts">
import type { ParamValue, PointCloud, ShapeName, VisualEffect } from '@xihan-ui/visual'
import {
  builtinEffects,
  defaultParams,
  imageToCloud,
  particlesEffect,
  registerBuiltinEffects,
  SHAPE_NAMES,
  shapeCloud,
  textToCloud,
} from '@xihan-ui/visual'
import { XhButton } from '@xihan-ui/vue'
import { vVisual, XhVisual } from '@xihan-ui/vue/visual'
import { computed, ref, shallowRef, watch } from 'vue'

// 按名字取效果（如 v-visual="'mesh'"）要先把内置效果登记进注册表；
// 直接传效果对象则不经过它
registerBuiltinEffects()

// —— 效果画廊 + 调参 ——

// 画廊只放自成画面的效果。浏览器每页能同时持有的 WebGL 上下文有上限（各家在 16 上下），
// 超了最早创建的会被丢弃变成白板，所以这页把活画面控制在十几个以内。
// grain 是叠在别的内容之上的透明噪点，particles 要喂点云才有东西，单独一张小卡片都看不出所以然。
const galleryEffects = builtinEffects.filter(e => e.name !== 'grain' && e.name !== 'particles')

const selected = shallowRef<VisualEffect>(builtinEffects[0]!)
const params = ref<Record<string, ParamValue>>(defaultParams(builtinEffects[0]!.params))

// 换效果就换一整份默认参数：参数规格是效果自带的，两者必须一起换
watch(selected, effect => (params.value = defaultParams(effect.params)))

const specs = computed(() => Object.entries(selected.value.params))

function reset(): void {
  params.value = defaultParams(selected.value.params)
}

// —— 点云：图片 / 文字 / 参数方程 转粒子 ——

const cloud = shallowRef<PointCloud | null>(shapeCloud('heart', { count: 12000 }))
const cloudLabel = ref('heart')
const text = ref('曦寒')
const busy = ref(false)

function useShape(name: ShapeName): void {
  cloud.value = shapeCloud(name, { count: 12000 })
  cloudLabel.value = name
}

function useText(): void {
  if (text.value.length === 0)
    return
  cloud.value = textToCloud(text.value, { count: 14000, fontSize: 200, color: '#7cc4ff' })
  cloudLabel.value = `文字「${text.value}」`
}

async function useImage(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file)
    return
  busy.value = true
  try {
    cloud.value = await imageToCloud(file, { count: 20000, resolution: 320, depth: 0.25 })
    cloudLabel.value = file.name
  }
  finally {
    busy.value = false
  }
}

// —— 指令用法：给现成组件铺背景 ——

const buttonEffect = shallowRef<VisualEffect>(
  builtinEffects.find(e => e.name === 'aurora') ?? builtinEffects[0]!,
)
</script>

<template>
  <section>
    <h2>Visual · 效果画廊</h2>
    <p class="lead">
      内置十四个效果，这里列出自成画面的十二个（<code>grain</code> 是叠加用的透明噪点，
      <code>particles</code> 要喂点云，见下面两节）。点一张切到调参台。
      每张卡片都是一个 <code>&lt;XhVisual&gt;</code>：画布铺满根元素且 <code>pointer-events: none</code>，
      插槽内容浮在效果之上不会被挡住。卡片滚出视口自动停绘，所有画面共用同一条
      <code>requestAnimationFrame</code>。
    </p>

    <div class="gallery">
      <button
        v-for="effect in galleryEffects"
        :key="effect.name"
        type="button"
        class="tile"
        :aria-pressed="effect.name === selected.name"
        @click="selected = effect"
      >
        <XhVisual :effect="effect" quality="eco" class="tile-canvas" />
        <span class="tile-name">{{ effect.name }}</span>
      </button>
    </div>
  </section>

  <section>
    <h2>Visual · 参数全可调</h2>
    <p class="lead">
      下面这排控件不是手写的，是从 <code>{{ selected.name }}.params</code> 这份参数规格推出来的——
      效果只声明一次类型、范围、步长与默认值，取默认值、钳制越界、生成调参界面三件事全从它来。
      解析是宽容的：越界钳进区间、类型不对回落默认值、规格里没有的键直接丢掉。
    </p>

    <XhVisual :effect="selected" :params="params" class="stage">
      <div class="stage-caption">
        <strong>{{ selected.name }}</strong>
        <span>{{ specs.length }} 个可调参数</span>
      </div>
    </XhVisual>

    <div class="controls">
      <label v-for="[key, spec] in specs" :key="key" class="control">
        <span class="control-label">{{ spec.label }}</span>
        <input
          v-if="spec.kind === 'number'"
          v-model.number="params[key]"
          type="range"
          :min="spec.min"
          :max="spec.max"
          :step="spec.step"
        >
        <input v-else-if="spec.kind === 'color'" v-model="params[key]" type="color">
        <input v-else-if="spec.kind === 'boolean'" v-model="params[key]" type="checkbox">
        <select v-else v-model="params[key]">
          <option v-for="value in spec.values" :key="value" :value="value">{{ value }}</option>
        </select>
        <output>{{ params[key] }}</output>
      </label>
    </div>

    <div class="row end">
      <XhButton @click="reset">
        恢复默认
      </XhButton>
    </div>
  </section>

  <section>
    <h2>Visual · 任意图片转粒子</h2>
    <p class="lead">
      图片、文字、参数方程最终都归一到同一种点云表示，所以「换形态」永远只是换一份点云，
      中间的形变是引擎补的。采样按权重带放回抽取，目标点数可以大于也可以小于有效像素数，密度都均匀；
      坐标等比映射，图片不会被拉变形。
    </p>

    <XhVisual
      :effect="particlesEffect"
      :cloud="cloud"
      :params="{ backgroundOpacity: 0.85, pointSize: 2.4 }"
      class="stage"
    >
      <div class="stage-caption">
        <strong>当前形态</strong>
        <span>{{ busy ? '采样中…' : cloudLabel }}</span>
      </div>
    </XhVisual>

    <div class="row" style="margin-block-start: 12px;">
      <XhButton v-for="name in SHAPE_NAMES" :key="name" @click="useShape(name)">
        {{ name }}
      </XhButton>
    </div>

    <div class="row" style="margin-block-start: 12px;">
      <input v-model="text" class="text-input" placeholder="输入文字" @keyup.enter="useText">
      <XhButton @click="useText">
        转成粒子
      </XhButton>
      <label class="file">
        选一张图片
        <input type="file" accept="image/*" @change="useImage">
      </label>
    </div>
  </section>

  <section>
    <h2>Visual · v-visual 指令</h2>
    <p class="lead">
      指令用在组件上时 Vue 会把它落到该组件的单一根元素上，所以给现成组件加背景不必改动组件本身。
      下面这颗按钮就是原封不动的 <code>&lt;XhButton&gt;</code>，只多了一个 <code>v-visual</code>。
    </p>

    <div class="row">
      <XhButton v-visual="{ effect: buttonEffect, params: { opacity: 0.85 } }" class="fancy">
        带流光的按钮
      </XhButton>
      <select v-model="buttonEffect" class="picker">
        <option v-for="effect in galleryEffects" :key="effect.name" :value="effect">
          {{ effect.name }}
        </option>
      </select>
    </div>
  </section>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.tile {
  display: grid;
  gap: 6px;
  padding: 0;
  border: 1px solid var(--xh-border-subtle);
  border-radius: 8px;
  background: none;
  color: inherit;
  cursor: pointer;
  overflow: hidden;
  font: inherit;
  text-align: left;
}

.tile[aria-pressed='true'] {
  border-color: var(--xh-border-default);
  outline: 2px solid var(--xh-fg-default);
  outline-offset: 1px;
}

.tile-canvas {
  aspect-ratio: 16 / 9;
  width: 100%;
}

.tile-name {
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 0 8px 7px;
  color: var(--xh-fg-muted);
}

.stage {
  aspect-ratio: 21 / 8;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.stage-caption {
  position: absolute;
  inset-block-end: 12px;
  inset-inline-start: 14px;
  display: grid;
  gap: 2px;
  color: #fff;
  text-shadow: 0 1px 10px rgb(0 0 0 / 55%);
  font-size: 12px;
}

.stage-caption strong {
  font-size: 15px;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px 16px;
  margin-block-start: 16px;
}

.control {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 4px 8px;
  font-size: 12px;
}

.control-label {
  color: var(--xh-fg-muted);
}

.control input[type='range'] {
  grid-column: 1 / -1;
  width: 100%;
}

.control output {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: var(--xh-fg-muted);
}

.text-input,
.picker {
  border: 1px solid var(--xh-border-default);
  border-radius: 6px;
  background: var(--xh-bg-subtle);
  color: var(--xh-fg-default);
  padding: 6px 10px;
  font: inherit;
  font-size: 13px;
}

.file {
  border: 1px dashed var(--xh-border-default);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  color: var(--xh-fg-muted);
}

.file input {
  display: none;
}

.fancy {
  position: relative;
  overflow: hidden;
}
</style>
