来源：https://ui.docs.xihanfun.com/components/time-picker

# TimePicker 时间选择器

将可键入的分段时间框、时钟触发器和分列选择浮层组合成一个字段。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/time-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/time-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/time-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/time-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/time-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

输入框与选择面板共享同一份值；按 15 分钟列出选项并实时显示结果

```vue
<script setup lang="ts">
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerHiddenInput,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("09:30");
</script>

<template>
  <XhTimePickerRoot
    v-model:value="value"
    name="meeting-time"
    :step="15"
  >
    <XhTimePickerLabel>会议开始</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerClearTrigger />
      <XhTimePickerTrigger />
    </XhTimePickerControl>
    <XhTimePickerHiddenInput />
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ value || "（未填齐）" }}
  </span>
</template>
```

```html
<xh-time-picker id="time-picker-basic" name="meeting-time" value="09:30" step="15">
  <div data-xh-part="root">
    <label data-xh-part="label">会议开始</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
      <button data-xh-part="trigger"></button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" unit="hour">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
          <div data-xh-part="item" value="13"></div>
          <div data-xh-part="item" value="14"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="16"></div>
          <div data-xh-part="item" value="17"></div>
          <div data-xh-part="item" value="18"></div>
          <div data-xh-part="item" value="19"></div>
          <div data-xh-part="item" value="20"></div>
          <div data-xh-part="item" value="21"></div>
          <div data-xh-part="item" value="22"></div>
          <div data-xh-part="item" value="23"></div>
        </div>
        <div data-xh-part="column" unit="minute">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="30"></div>
          <div data-xh-part="item" value="45"></div>
        </div>
      </div>
    </div>
  </div>
</xh-time-picker>

<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-picker-basic-value">09:30</span>
</span>

<script type="module">
  const picker = document.getElementById("time-picker-basic");
  const readout = document.getElementById("time-picker-basic-value");

  picker.addEventListener("value-change", (event) => {
    const next = event.detail.value;
    picker.value = next;
    readout.textContent = next || "（未填齐）";
  });
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="time-picker"`：**`root`** · `label` · **`control`** · `segment-group` · **`segment`** · **`trigger`** · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · `column` · `item` · `hidden-input`

## 示例

### 分列步长

step=15 只裁剪浮层中的可选值（分列剩四格），段位上手动输入的分钟数不受它限制

```vue
<script setup lang="ts">
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("09:30");
</script>

<template>
  <XhTimePickerRoot v-model:value="value" :step="15">
    <XhTimePickerLabel>预约时段</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerClearTrigger />
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <!-- 时列 24 格装不下，方向键走到列尾它自己滚起来，滚的是那一列不是整个面板 -->
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
```

```html
<xh-time-picker id="time-picker-step" step="15" default-value="09:30">
  <div data-xh-part="root">
    <label data-xh-part="label">预约时段</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <!-- 时列 24 格装不下，方向键走到列尾它自己滚起来，滚的是那一列不是整个面板 -->
        <div data-xh-part="column" unit="hour">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
          <div data-xh-part="item" value="13"></div>
          <div data-xh-part="item" value="14"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="16"></div>
          <div data-xh-part="item" value="17"></div>
          <div data-xh-part="item" value="18"></div>
          <div data-xh-part="item" value="19"></div>
          <div data-xh-part="item" value="20"></div>
          <div data-xh-part="item" value="21"></div>
          <div data-xh-part="item" value="22"></div>
          <div data-xh-part="item" value="23"></div>
        </div>
        <div data-xh-part="column" unit="minute">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="30"></div>
          <div data-xh-part="item" value="45"></div>
        </div>
      </div>
    </div>
  </div>
</xh-time-picker>

<span style="font-size: 13px">当前值：<span id="time-picker-step-value">09:30</span></span>

<script type="module">
  // 当前值回显在旁边那行文字里
  const picker = document.getElementById("time-picker-step");
  const readout = document.getElementById("time-picker-step-value");
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });
</script>
```

### 12 小时制

时列写的是显示值 01-12，落到哪个真实小时由上下午决定：输入行中输入、浮层中选择都会修改它

```vue
<script setup lang="ts">
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("09:30");
</script>

<template>
  <XhTimePickerRoot v-model:value="value" :hour-cycle="12" locale="zh-CN">
    <XhTimePickerLabel>提醒时间</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
        <XhTimePickerSegment segment="dayPeriod" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerClearTrigger />
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <!-- 上下午列只在 12 小时制下出现；格子上的文字由组件按 locale 填 -->
        <XhTimePickerColumn v-slot="{ options }" unit="dayPeriod">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">值仍是 24 小时的串：{{ value || "（空）" }}</span>
</template>
```

```html
<xh-time-picker id="time-picker-hour-cycle" hour-cycle="12" locale="zh-CN" default-value="09:30">
  <div data-xh-part="root">
    <label data-xh-part="label">提醒时间</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
        <span data-xh-part="segment" segment="dayPeriod"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" unit="hour">
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
        </div>
        <div data-xh-part="column" unit="minute">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
          <div data-xh-part="item" value="13"></div>
          <div data-xh-part="item" value="14"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="16"></div>
          <div data-xh-part="item" value="17"></div>
          <div data-xh-part="item" value="18"></div>
          <div data-xh-part="item" value="19"></div>
          <div data-xh-part="item" value="20"></div>
          <div data-xh-part="item" value="21"></div>
          <div data-xh-part="item" value="22"></div>
          <div data-xh-part="item" value="23"></div>
          <div data-xh-part="item" value="24"></div>
          <div data-xh-part="item" value="25"></div>
          <div data-xh-part="item" value="26"></div>
          <div data-xh-part="item" value="27"></div>
          <div data-xh-part="item" value="28"></div>
          <div data-xh-part="item" value="29"></div>
          <div data-xh-part="item" value="30"></div>
          <div data-xh-part="item" value="31"></div>
          <div data-xh-part="item" value="32"></div>
          <div data-xh-part="item" value="33"></div>
          <div data-xh-part="item" value="34"></div>
          <div data-xh-part="item" value="35"></div>
          <div data-xh-part="item" value="36"></div>
          <div data-xh-part="item" value="37"></div>
          <div data-xh-part="item" value="38"></div>
          <div data-xh-part="item" value="39"></div>
          <div data-xh-part="item" value="40"></div>
          <div data-xh-part="item" value="41"></div>
          <div data-xh-part="item" value="42"></div>
          <div data-xh-part="item" value="43"></div>
          <div data-xh-part="item" value="44"></div>
          <div data-xh-part="item" value="45"></div>
          <div data-xh-part="item" value="46"></div>
          <div data-xh-part="item" value="47"></div>
          <div data-xh-part="item" value="48"></div>
          <div data-xh-part="item" value="49"></div>
          <div data-xh-part="item" value="50"></div>
          <div data-xh-part="item" value="51"></div>
          <div data-xh-part="item" value="52"></div>
          <div data-xh-part="item" value="53"></div>
          <div data-xh-part="item" value="54"></div>
          <div data-xh-part="item" value="55"></div>
          <div data-xh-part="item" value="56"></div>
          <div data-xh-part="item" value="57"></div>
          <div data-xh-part="item" value="58"></div>
          <div data-xh-part="item" value="59"></div>
        </div>
        <!-- 上下午列只在 12 小时制下出现；格子上的文字由组件按 locale 填 -->
        <div data-xh-part="column" unit="dayPeriod">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
        </div>
      </div>
    </div>
  </div>
</xh-time-picker>

<span style="font-size: 13px">值仍是 24 小时的串：<span id="time-picker-hour-cycle-value">09:30</span></span>

<script type="module">
  // 当前值回显在旁边那行文字里
  const picker = document.getElementById("time-picker-hour-cycle");
  const readout = document.getElementById("time-picker-hour-cycle-value");
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });
</script>
```

### 精度到秒

granularity 同时决定输入行显示几段、浮层中排几列

```vue
<script setup lang="ts">
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("");
</script>

<template>
  <XhTimePickerRoot v-model:value="value" granularity="second">
    <XhTimePickerLabel>执行时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
        <span>:</span>
        <XhTimePickerSegment segment="second" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerClearTrigger />
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="second">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
```

```html
<xh-time-picker id="time-picker-granularity" granularity="second">
  <div data-xh-part="root">
    <label data-xh-part="label">执行时刻</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="second"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" unit="hour">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
          <div data-xh-part="item" value="13"></div>
          <div data-xh-part="item" value="14"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="16"></div>
          <div data-xh-part="item" value="17"></div>
          <div data-xh-part="item" value="18"></div>
          <div data-xh-part="item" value="19"></div>
          <div data-xh-part="item" value="20"></div>
          <div data-xh-part="item" value="21"></div>
          <div data-xh-part="item" value="22"></div>
          <div data-xh-part="item" value="23"></div>
        </div>
        <div data-xh-part="column" unit="minute">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
          <div data-xh-part="item" value="13"></div>
          <div data-xh-part="item" value="14"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="16"></div>
          <div data-xh-part="item" value="17"></div>
          <div data-xh-part="item" value="18"></div>
          <div data-xh-part="item" value="19"></div>
          <div data-xh-part="item" value="20"></div>
          <div data-xh-part="item" value="21"></div>
          <div data-xh-part="item" value="22"></div>
          <div data-xh-part="item" value="23"></div>
          <div data-xh-part="item" value="24"></div>
          <div data-xh-part="item" value="25"></div>
          <div data-xh-part="item" value="26"></div>
          <div data-xh-part="item" value="27"></div>
          <div data-xh-part="item" value="28"></div>
          <div data-xh-part="item" value="29"></div>
          <div data-xh-part="item" value="30"></div>
          <div data-xh-part="item" value="31"></div>
          <div data-xh-part="item" value="32"></div>
          <div data-xh-part="item" value="33"></div>
          <div data-xh-part="item" value="34"></div>
          <div data-xh-part="item" value="35"></div>
          <div data-xh-part="item" value="36"></div>
          <div data-xh-part="item" value="37"></div>
          <div data-xh-part="item" value="38"></div>
          <div data-xh-part="item" value="39"></div>
          <div data-xh-part="item" value="40"></div>
          <div data-xh-part="item" value="41"></div>
          <div data-xh-part="item" value="42"></div>
          <div data-xh-part="item" value="43"></div>
          <div data-xh-part="item" value="44"></div>
          <div data-xh-part="item" value="45"></div>
          <div data-xh-part="item" value="46"></div>
          <div data-xh-part="item" value="47"></div>
          <div data-xh-part="item" value="48"></div>
          <div data-xh-part="item" value="49"></div>
          <div data-xh-part="item" value="50"></div>
          <div data-xh-part="item" value="51"></div>
          <div data-xh-part="item" value="52"></div>
          <div data-xh-part="item" value="53"></div>
          <div data-xh-part="item" value="54"></div>
          <div data-xh-part="item" value="55"></div>
          <div data-xh-part="item" value="56"></div>
          <div data-xh-part="item" value="57"></div>
          <div data-xh-part="item" value="58"></div>
          <div data-xh-part="item" value="59"></div>
        </div>
        <div data-xh-part="column" unit="second">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
          <div data-xh-part="item" value="13"></div>
          <div data-xh-part="item" value="14"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="16"></div>
          <div data-xh-part="item" value="17"></div>
          <div data-xh-part="item" value="18"></div>
          <div data-xh-part="item" value="19"></div>
          <div data-xh-part="item" value="20"></div>
          <div data-xh-part="item" value="21"></div>
          <div data-xh-part="item" value="22"></div>
          <div data-xh-part="item" value="23"></div>
          <div data-xh-part="item" value="24"></div>
          <div data-xh-part="item" value="25"></div>
          <div data-xh-part="item" value="26"></div>
          <div data-xh-part="item" value="27"></div>
          <div data-xh-part="item" value="28"></div>
          <div data-xh-part="item" value="29"></div>
          <div data-xh-part="item" value="30"></div>
          <div data-xh-part="item" value="31"></div>
          <div data-xh-part="item" value="32"></div>
          <div data-xh-part="item" value="33"></div>
          <div data-xh-part="item" value="34"></div>
          <div data-xh-part="item" value="35"></div>
          <div data-xh-part="item" value="36"></div>
          <div data-xh-part="item" value="37"></div>
          <div data-xh-part="item" value="38"></div>
          <div data-xh-part="item" value="39"></div>
          <div data-xh-part="item" value="40"></div>
          <div data-xh-part="item" value="41"></div>
          <div data-xh-part="item" value="42"></div>
          <div data-xh-part="item" value="43"></div>
          <div data-xh-part="item" value="44"></div>
          <div data-xh-part="item" value="45"></div>
          <div data-xh-part="item" value="46"></div>
          <div data-xh-part="item" value="47"></div>
          <div data-xh-part="item" value="48"></div>
          <div data-xh-part="item" value="49"></div>
          <div data-xh-part="item" value="50"></div>
          <div data-xh-part="item" value="51"></div>
          <div data-xh-part="item" value="52"></div>
          <div data-xh-part="item" value="53"></div>
          <div data-xh-part="item" value="54"></div>
          <div data-xh-part="item" value="55"></div>
          <div data-xh-part="item" value="56"></div>
          <div data-xh-part="item" value="57"></div>
          <div data-xh-part="item" value="58"></div>
          <div data-xh-part="item" value="59"></div>
        </div>
      </div>
    </div>
  </div>
</xh-time-picker>

<span style="font-size: 13px">当前值：<span id="time-picker-granularity-value">（空）</span></span>

<script type="module">
  // 当前值回显在旁边那行文字里
  const picker = document.getElementById("time-picker-granularity");
  const readout = document.getElementById("time-picker-granularity-value");
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });
</script>
```

### 禁用 / 只读 / 校验失败

禁用整条退出 Tab 序列，只读仍能展开浏览只是不可修改值，invalid 只改变标注

```vue
<script setup lang="ts">
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";

const states = [
  { label: "禁用", disabled: true, readOnly: false, invalid: false },
  { label: "只读", disabled: false, readOnly: true, invalid: false },
  { label: "校验失败", disabled: false, readOnly: false, invalid: true },
];
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhTimePickerRoot
      v-for="s in states"
      :key="s.label"
      :disabled="s.disabled"
      :read-only="s.readOnly"
      :invalid="s.invalid"
      default-value="09:30"
    >
      <XhTimePickerLabel>{{ s.label }}</XhTimePickerLabel>
      <XhTimePickerControl>
        <XhTimePickerSegmentGroup>
          <XhTimePickerSegment segment="hour" />
          <span>:</span>
          <XhTimePickerSegment segment="minute" />
        </XhTimePickerSegmentGroup>
      </XhTimePickerControl>
      <XhTimePickerPositioner>
        <XhTimePickerContent>
          <XhTimePickerColumn v-slot="{ options }" unit="hour">
            <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimePickerColumn>
          <XhTimePickerColumn v-slot="{ options }" unit="minute">
            <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimePickerColumn>
        </XhTimePickerContent>
      </XhTimePickerPositioner>
    </XhTimePickerRoot>
  </div>
</template>
```

```html
<div id="time-picker-state" style="display: grid; gap: 16px; justify-items: start"></div>

<!-- 结构先收在模板里：列里的格子要在元素接线前就位，所以铺满了才入页 -->
<template id="time-picker-state-shell">
  <xh-time-picker default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label"></label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="column" unit="hour"></div>
          <div data-xh-part="column" unit="minute"></div>
        </div>
      </div>
    </div>
  </xh-time-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-picker-state");
  const shell = document.getElementById("time-picker-state-shell");

  // 往一列里铺 count 格，值是两位补零的显示串
  function fill(column, count) {
    for (let i = 0; i < count; i++) {
      const item = document.createElement("div");
      item.dataset.xhPart = "item";
      item.setAttribute("value", String(i).padStart(2, "0"));
      column.append(item);
    }
  }

  const states = [
    { label: "禁用", flag: "disabled" },
    { label: "只读", flag: "read-only" },
    { label: "校验失败", flag: "invalid" },
  ];

  for (const state of states) {
    const node = shell.content.cloneNode(true);
    node.querySelector("xh-time-picker").setAttribute(state.flag, "");
    node.querySelector('[data-xh-part="label"]').textContent = state.label;
    fill(node.querySelector('[unit="hour"]'), 24);
    fill(node.querySelector('[unit="minute"]'), 60);
    stage.append(node);
  }
</script>
```

### 可选时段

min / max 直接把界外的格从列中裁掉；分列还会随已选的小时再裁剪一次

```vue
<script setup lang="ts">
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("");
</script>

<template>
  <XhTimePickerRoot v-model:value="value" min="09:00" max="18:00" :step="30">
    <XhTimePickerLabel>面谈时段</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <!-- 时列只剩 09 到 18；选到 18 时分列就只剩 00 -->
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">
    手打进段位的时间不受裁剪限制，越界只被标注：{{ value || "（空）" }}
  </span>
</template>
```

```html
<xh-time-picker id="time-picker-range" min="09:00" max="18:00" step="30">
  <div data-xh-part="root">
    <label data-xh-part="label">面谈时段</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <!-- 列与格子都由作者渲染，组件只说该排哪几列、每列还剩哪些值 -->
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-time-picker>

<span style="font-size: 13px">
  手打进段位的时间不受裁剪限制，越界只被标注：<span id="time-picker-range-value">（空）</span>
</span>

<script type="module">
  const picker = document.getElementById("time-picker-range");
  const content = picker.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("time-picker-range-value");

  // 一列一个节点，按单位记着；重画只换里面的格子
  const columns = new Map();
  // 每列上一次画的是哪一串值，没变就不动它（正在用方向键走的那一列不该被换掉）
  const painted = new Map();

  function columnOf(unit) {
    let node = columns.get(unit);
    if (!node) {
      node = document.createElement("div");
      node.dataset.xhPart = "column";
      node.setAttribute("unit", unit);
      columns.set(unit, node);
      content.append(node);
    }
    return node;
  }

  function itemNode(value) {
    const cell = document.createElement("div");
    cell.dataset.xhPart = "item";
    cell.setAttribute("value", value);
    // 格子上的字由组件按 locale 填
    return cell;
  }

  // 列里排哪些格子由组件给：越界的、不合 step 的、随已选的时收窄掉的，都已经不在里面
  function paint() {
    for (const column of picker.columns) {
      const shape = column.options.join(",");
      if (painted.get(column.unit) === shape) continue;
      painted.set(column.unit, shape);
      columnOf(column.unit).replaceChildren(...column.options.map(itemNode));
    }
  }

  // 挑一格、敲一个数字都可能让别的列跟着收窄；交互之后重读一遍
  for (const type of ["value-change", "click", "keydown"])
    picker.addEventListener(type, paint);

  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });

  paint();
</script>
```

### 浮层中的操作按钮

列表下方这排按钮是作者自己的节点，键盘事件在这一层收口，不再上交给列表

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("");

// 此刻的时分，两位补零
function now() {
  const d = new Date();
  const h = `${d.getHours()}`.padStart(2, "0");
  const m = `${d.getMinutes()}`.padStart(2, "0");
  return `${h}:${m}`;
}
</script>

<template>
  <XhTimePickerRoot
    v-slot="{ canClear, setValue, clear, setOpen }"
    v-model:value="value"
    :step="15"
  >
    <XhTimePickerLabel>提交时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <!-- 面板默认把列横排，改成竖排才放得下下面这一排按钮 -->
      <XhTimePickerContent style="flex-direction: column; gap: 8px">
        <div style="display: flex">
          <XhTimePickerColumn v-slot="{ options }" unit="hour">
            <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimePickerColumn>
          <XhTimePickerColumn v-slot="{ options }" unit="minute">
            <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimePickerColumn>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px" @keydown.stop>
          <XhButton size="sm" variant="ghost" @click="setValue(now())">此刻</XhButton>
          <XhButton size="sm" variant="ghost" :disabled="!canClear" @click="clear()">
            清空
          </XhButton>
          <XhButton size="sm" @click="setOpen(false)">确定</XhButton>
        </div>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
```

```html
<xh-time-picker id="time-picker-actions" step="15">
  <div data-xh-part="root">
    <label data-xh-part="label">提交时刻</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <!-- 面板默认把列横排，改成竖排才放得下下面这一排按钮 -->
      <div data-xh-part="content" style="flex-direction: column; gap: 8px">
        <div style="display: flex">
          <div data-xh-part="column" unit="hour">
            <div data-xh-part="item" value="00"></div>
            <div data-xh-part="item" value="01"></div>
            <div data-xh-part="item" value="02"></div>
            <div data-xh-part="item" value="03"></div>
            <div data-xh-part="item" value="04"></div>
            <div data-xh-part="item" value="05"></div>
            <div data-xh-part="item" value="06"></div>
            <div data-xh-part="item" value="07"></div>
            <div data-xh-part="item" value="08"></div>
            <div data-xh-part="item" value="09"></div>
            <div data-xh-part="item" value="10"></div>
            <div data-xh-part="item" value="11"></div>
            <div data-xh-part="item" value="12"></div>
            <div data-xh-part="item" value="13"></div>
            <div data-xh-part="item" value="14"></div>
            <div data-xh-part="item" value="15"></div>
            <div data-xh-part="item" value="16"></div>
            <div data-xh-part="item" value="17"></div>
            <div data-xh-part="item" value="18"></div>
            <div data-xh-part="item" value="19"></div>
            <div data-xh-part="item" value="20"></div>
            <div data-xh-part="item" value="21"></div>
            <div data-xh-part="item" value="22"></div>
            <div data-xh-part="item" value="23"></div>
          </div>
          <div data-xh-part="column" unit="minute">
            <div data-xh-part="item" value="00"></div>
            <div data-xh-part="item" value="15"></div>
            <div data-xh-part="item" value="30"></div>
            <div data-xh-part="item" value="45"></div>
          </div>
        </div>

        <div id="time-picker-actions-row" style="display: flex; justify-content: flex-end; gap: 8px">
          <xh-button size="sm" variant="ghost">
            <button data-xh-part="root" id="time-picker-actions-now">此刻</button>
          </xh-button>
          <xh-button size="sm" variant="ghost">
            <button data-xh-part="root" id="time-picker-actions-clear">清空</button>
          </xh-button>
          <xh-button size="sm">
            <button data-xh-part="root" id="time-picker-actions-ok">确定</button>
          </xh-button>
        </div>
      </div>
    </div>
  </div>
</xh-time-picker>

<span style="font-size: 13px">当前值：<span id="time-picker-actions-value">（空）</span></span>

<script type="module">
  const picker = document.getElementById("time-picker-actions");
  const readout = document.getElementById("time-picker-actions-value");

  // 键盘事件在这一排收口，不再上交给列表
  document
    .getElementById("time-picker-actions-row")
    .addEventListener("keydown", (event) => event.stopPropagation());

  // 值与开合都由宿主持有，写回元素才生效
  function setValue(next) {
    picker.value = next;
    readout.textContent = next || "（空）";
  }

  function setOpen(next) {
    picker.open = next;
  }

  setValue("");
  setOpen(false);
  picker.addEventListener("value-change", (event) => setValue(event.detail.value));
  picker.addEventListener("open-change", (event) => setOpen(event.detail.open));

  // 此刻的时分，两位补零
  document.getElementById("time-picker-actions-now").addEventListener("click", () => {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    setValue(`${hour}:${minute}`);
  });

  document
    .getElementById("time-picker-actions-clear")
    .addEventListener("click", () => setValue(""));

  document
    .getElementById("time-picker-actions-ok")
    .addEventListener("click", () => setOpen(false));
</script>
```

### 自定义可选格

列中渲染哪几格由作者决定，午休两格整段移除；手动输入段位的小时被吸附到下一个可约小时

```vue
<script setup lang="ts">
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 午休不接待
const closed = [12, 13];

const value = ref("09:00");

// 列里只留通过谓词的那几格
function bookable(options: readonly string[]) {
  return options.filter(o => !closed.includes(Number(o)));
}

// 落进午休的小时往后挪到最近一个可约的小时
function snap(next: string) {
  if (next === "")
    return next;
  let hour = Number(next.slice(0, 2));
  while (closed.includes(hour)) hour += 1;
  return `${`${hour}`.padStart(2, "0")}${next.slice(2)}`;
}
</script>

<template>
  <XhTimePickerRoot
    :value="value"
    :step="30"
    min="09:00"
    max="18:00"
    @update:value="value = snap($event)"
  >
    <XhTimePickerLabel>面谈时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <!-- min / max 先裁一遍，这里再按自己的谓词裁一遍；格里的文案也自己写 -->
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in bookable(options)" :key="o" :value="o">
            {{ Number(o) }} 点
          </XhTimePickerItem>
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
```

```html
<xh-time-picker id="time-picker-predicate" step="30" min="09:00" max="18:00">
  <div data-xh-part="root">
    <label data-xh-part="label">面谈时刻</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <!-- min / max 圈住 09 到 18，午休两格作者自己不写；格里的文案也自己写 -->
        <div data-xh-part="column" unit="hour">
          <div data-xh-part="item" value="09">9 点</div>
          <div data-xh-part="item" value="10">10 点</div>
          <div data-xh-part="item" value="11">11 点</div>
          <div data-xh-part="item" value="14">14 点</div>
          <div data-xh-part="item" value="15">15 点</div>
          <div data-xh-part="item" value="16">16 点</div>
          <div data-xh-part="item" value="17">17 点</div>
          <div data-xh-part="item" value="18">18 点</div>
        </div>
        <div data-xh-part="column" unit="minute">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="30"></div>
        </div>
      </div>
    </div>
  </div>
</xh-time-picker>

<span style="font-size: 13px">当前值：<span id="time-picker-predicate-value">09:00</span></span>

<script type="module">
  // 午休不接待
  const closed = [12, 13];

  const picker = document.getElementById("time-picker-predicate");
  const readout = document.getElementById("time-picker-predicate-value");

  // 落进午休的小时往后挪到最近一个可约的小时
  function snap(next) {
    if (next === "") return next;
    let hour = Number(next.slice(0, 2));
    while (closed.includes(hour)) hour += 1;
    return `${String(hour).padStart(2, "0")}${next.slice(2)}`;
  }

  // 值由宿主持有：吸附之后写回元素才生效
  function apply(next) {
    picker.value = next;
    readout.textContent = next || "（空）";
  }

  apply("09:00");
  picker.addEventListener("value-change", (event) => apply(snap(event.detail.value)));
</script>
```

### 三轴

variant 决定描边与底色的绘制方式、tone 决定使用哪族颜色、size 切换几何档；三者只落在 root，浮层中的格子一并随之变化

```vue
<script setup lang="ts">
import type { ControlVariant, Size, Tone } from "@xihan-ui/core";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";

const variants: ControlVariant[] = ["outline", "subtle", "ghost"];
const tones: Tone[] = ["brand", "success", "danger"];
const sizes: Size[] = ["sm", "md", "lg"];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <div
      v-for="(row, i) in [variants, tones, sizes]"
      :key="i"
      style="display: flex; flex-wrap: wrap; gap: 16px"
    >
      <XhTimePickerRoot
        v-for="v in row"
        :key="v"
        :variant="i === 0 ? (v as ControlVariant) : undefined"
        :tone="i === 1 ? (v as Tone) : undefined"
        :size="i === 2 ? (v as Size) : undefined"
        default-value="09:30"
      >
        <XhTimePickerLabel>{{ v }}</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
          </XhTimePickerSegmentGroup>
          <XhTimePickerClearTrigger />
        </XhTimePickerControl>
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            <XhTimePickerColumn v-slot="{ options }" unit="hour">
              <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
            </XhTimePickerColumn>
            <XhTimePickerColumn v-slot="{ options }" unit="minute">
              <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
            </XhTimePickerColumn>
          </XhTimePickerContent>
        </XhTimePickerPositioner>
      </XhTimePickerRoot>
    </div>
  </div>
</template>
```

```html
<div id="time-picker-axes" style="display: flex; flex-direction: column; gap: 20px"></div>

<!-- 结构先收在模板里：列里的格子要在元素接线前就位，所以铺满了才入页 -->
<template id="time-picker-axes-shell">
  <xh-time-picker default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label"></label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="column" unit="hour"></div>
          <div data-xh-part="column" unit="minute"></div>
        </div>
      </div>
    </div>
  </xh-time-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-picker-axes");
  const shell = document.getElementById("time-picker-axes-shell");

  // 往一列里铺 count 格，值是两位补零的显示串
  function fill(column, count) {
    for (let i = 0; i < count; i++) {
      const item = document.createElement("div");
      item.dataset.xhPart = "item";
      item.setAttribute("value", String(i).padStart(2, "0"));
      column.append(item);
    }
  }

  // 一行只换一根轴，标题写的就是那一档的取值
  const rows = [
    { axis: "variant", values: ["outline", "subtle", "ghost"] },
    { axis: "tone", values: ["brand", "success", "danger"] },
    { axis: "size", values: ["sm", "md", "lg"] },
  ];

  for (const row of rows) {
    const line = document.createElement("div");
    line.style.display = "flex";
    line.style.flexWrap = "wrap";
    line.style.gap = "16px";
    for (const value of row.values) {
      const node = shell.content.cloneNode(true);
      node.querySelector("xh-time-picker").setAttribute(row.axis, value);
      node.querySelector('[data-xh-part="label"]').textContent = value;
      fill(node.querySelector('[unit="hour"]'), 24);
      fill(node.querySelector('[unit="minute"]'), 60);
      line.append(node);
    }
    stage.append(line);
  }
</script>
```

### 可选的触发按钮

点击输入行本来就会展开，该按钮不是必需的；需要它是因为它才带 aria-haspopup / aria-expanded

```vue
<script setup lang="ts">
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("09:30");
</script>

<template>
  <XhTimePickerRoot v-model:value="value">
    <XhTimePickerLabel>会议开始</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerClearTrigger />
      <!-- 写上它多一个明写的入口；不写也照样能展开——点输入行即可，
           键盘则在段上按 Alt+ArrowDown -->
      <XhTimePickerTrigger aria-label="展开时间列" />
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
```

```html
<xh-time-picker id="time-picker-trigger" default-value="09:30">
  <div data-xh-part="root">
    <label data-xh-part="label">会议开始</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
      <!-- 写上它多一个明写的入口；不写也照样能展开——点输入行即可，
           键盘则在段上按 Alt+ArrowDown -->
      <button data-xh-part="trigger" aria-label="展开时间列"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" unit="hour">
          <div data-xh-part="item" value="00"></div>
          <div data-xh-part="item" value="01"></div>
          <div data-xh-part="item" value="02"></div>
          <div data-xh-part="item" value="03"></div>
          <div data-xh-part="item" value="04"></div>
          <div data-xh-part="item" value="05"></div>
          <div data-xh-part="item" value="06"></div>
          <div data-xh-part="item" value="07"></div>
          <div data-xh-part="item" value="08"></div>
          <div data-xh-part="item" value="09"></div>
          <div data-xh-part="item" value="10"></div>
          <div data-xh-part="item" value="11"></div>
          <div data-xh-part="item" value="12"></div>
          <div data-xh-part="item" value="13"></div>
          <div data-xh-part="item" value="14"></div>
          <div data-xh-part="item" value="15"></div>
          <div data-xh-part="item" value="16"></div>
          <div data-xh-part="item" value="17"></div>
          <div data-xh-part="item" value="18"></div>
          <div data-xh-part="item" value="19"></div>
          <div data-xh-part="item" value="20"></div>
          <div data-xh-part="item" value="21"></div>
          <div data-xh-part="item" value="22"></div>
          <div data-xh-part="item" value="23"></div>
        </div>
        <div data-xh-part="column" unit="minute"></div>
      </div>
    </div>
  </div>
</xh-time-picker>

<span style="font-size: 13px">当前值：<span id="time-picker-trigger-value">09:30</span></span>

<script type="module">
  const picker = document.getElementById("time-picker-trigger");
  const readout = document.getElementById("time-picker-trigger-value");

  // 分列六十格，铺一遍就够
  const minutes = picker.querySelector('[unit="minute"]');
  for (let i = 0; i < 60; i += 1) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", String(i).padStart(2, "0"));
    minutes.append(item);
  }

  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });
</script>
```

### 快捷选项

presets 在列旁边多排一列，点击一条即整份写入值并收起；时刻在组件外计算后再传入

```vue
<script setup lang="ts">
import { timePickerPresetNow } from "@xihan-ui/headless";
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerPresetGroup,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref("");

// 时刻算一次就固定下来：connect 每帧都会跑一遍，把「此刻」放进渲染期会每帧算出新值
const presets = computed(() => [
  { label: "此刻", value: timePickerPresetNow() },
  { label: "上午 9 点", value: "09:00" },
  { label: "午休", value: "12:00" },
  { label: "下班", value: "18:00" },
]);
</script>

<template>
  <XhTimePickerRoot v-model:value="value" :presets="presets" :step="15">
    <XhTimePickerLabel>提交时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <!-- 不写默认插槽就按 presets 数据自动铺；这一列自己吃方向键，不与时分那两列抢 -->
        <XhTimePickerPresetGroup />
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
```

```html
<div id="time-picker-presets"></div>
<span style="font-size: 13px">
  当前值：<span id="time-picker-presets-value">（空）</span>
</span>

<!-- 结构先收在模板里：列里的格子与快捷选项要在元素接线前就位，所以铺满了才入页 -->
<template id="time-picker-presets-shell">
  <xh-time-picker step="15">
    <div data-xh-part="root">
      <label data-xh-part="label">提交时刻</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="preset-group"></div>
          <div data-xh-part="column" unit="hour"></div>
          <div data-xh-part="column" unit="minute"></div>
        </div>
      </div>
    </div>
  </xh-time-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-picker-presets");
  const readout = document.getElementById("time-picker-presets-value");
  const node = document
    .getElementById("time-picker-presets-shell")
    .content.cloneNode(true);

  // 往一列里铺格子，值是两位补零的显示串
  function fill(column, count, step) {
    for (let i = 0; i < count; i += step) {
      const item = document.createElement("div");
      item.dataset.xhPart = "item";
      item.setAttribute("value", String(i).padStart(2, "0"));
      column.append(item);
    }
  }

  // 示例台不能 import 包，这里把 timePickerPresetNow 做的事等价地写一遍
  function now() {
    const d = new Date();
    return `${`${d.getHours()}`.padStart(2, "0")}:${`${d.getMinutes()}`.padStart(2, "0")}`;
  }

  // 时刻算一次就固定下来，组件只认已经算好的字面值
  const presets = [
    { label: "此刻", value: now() },
    { label: "上午 9 点", value: "09:00" },
    { label: "午休", value: "12:00" },
    { label: "下班", value: "18:00" },
  ];

  fill(node.querySelector('[unit="hour"]'), 24, 1);
  fill(node.querySelector('[unit="minute"]'), 60, 15);

  // 条目由作者铺，身份写在 value 属性上；元素只负责把行为打上去
  node.querySelector('[data-xh-part="preset-group"]').replaceChildren(
    ...presets.map((preset) => {
      const item = document.createElement("div");
      item.dataset.xhPart = "preset";
      item.setAttribute("value", preset.value);
      item.textContent = preset.label;
      return item;
    }),
  );

  const picker = node.querySelector("xh-time-picker");
  picker.presets = presets;
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });

  stage.append(node);
</script>
```

## 设计指引

### 何时使用

- 可选时间是离散的（每 15 分钟一档）。
- 需要限制可选时段（营业时间、可预约时段）。

### 何时不用

- 任意时间都可以、用户直接键入时，使用[时间字段](./time-field)。

### 特性

- `step` 分列设定各列的步长。
- `max` 直接把界外的格从列中裁掉；分钟列还会随已选的小时再裁一次。
- `isTimeUnavailable` 逐格判断可选性。
- 浮层内可以放置“当前时刻”与确认按钮。
- 触发器打开空值时焦点直接落到第一项；从输入段打开时继续保留键入焦点。
- 快捷选项与时/分/秒列都从当前值恢复持久选中，并在逻辑末端显示对号。
- 悬停、键盘高亮与可见焦点使用中性实体底，与选中对号可以同时存在。数字格在左右保留等宽标记轨，选中和 RTL 都不会把数字推离中心。
- 输入框走 Field Chrome 描边式；浮层为 floating 实体面（border-default + floating 海拔）；时分秒与快捷列各自接自绘条。
- 浮层按实际弹出方向短距离淡入淡出，不缩放文字与数字；减弱动效和增强对比度沿用主题设置。
- 空值时显示时钟入口；有值且渲染了清空按钮时，由清空按钮原位接替时钟图标。
- 聚焦边界与当前段位使用短过渡，不以瞬时跳色表达焦点。

### 组合

- 与[日期选择器](./date-picker)配合组成日期时间选择。

### 最佳实践

- 把不可选的时段裁掉而不是置灰，列更短、查找更快。
- 打开时把浮层滚动到当前值。
- 标准输入行应同时包含清空按钮与时钟图标触发器；二者按值互斥显示。参与表单时同时渲染隐藏输入。
- 自定义格内文案保持简短；选中对号由皮肤统一绘制，不在插槽内重复添加。

### 反模式

- 步长设为 1 分钟：一列六十格，滚动过长。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-picker>` |
| Vue 组件 | `XhTimePickerClearTrigger` `XhTimePickerColumn` `XhTimePickerContent` `XhTimePickerControl` `XhTimePickerHiddenInput` `XhTimePickerItem` `XhTimePickerLabel` `XhTimePickerPositioner` `XhTimePickerPreset` `XhTimePickerPresetGroup` `XhTimePickerRoot` `XhTimePickerSegment` `XhTimePickerSegmentGroup` `XhTimePickerTrigger` |
| 组合式函数 | `useTimePicker` |
| 状态机 | `timePickerMachine` |
| 皮肤 | `@xihan-ui/styles/time-picker.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值，ISO 时间串。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `min` | `string` |  | 下界（含）。裁掉浮层中落在界外的可选值，并把已填的越界值标注出来（不改写它）。 |
| `max` | `string` |  | 上界（含）。同上。 |
| `locale` | `string` |  | BCP 47 语言标记。决定上午 / 下午的文字，以及未显式提供 hourCycle 时的小时制。 |
| `hourCycle` | `TimeHourCycle` |  | 小时制。未提供时按 locale 推断，locale 也没有时使用 24。 |
| `granularity` | `TimeGranularity` |  | 值精确到哪一段，默认 minute。它同时决定分段输入显示几段、浮层中排几列。 |
| `step` | `number` |  | 分列的步进（分钟），默认 1。只影响浮层中的可选值，不限制手动输入的分钟数。 |
| `presets` | `TimePickerPreset[]` |  | 快捷选项（「当前时刻」「上午 9 点」等）。提供后浮层中多出一列，点击即整份写入值并收起。 时刻需计算后传入：连接层每帧求值，把当前时刻放进渲染期会每帧得出一个新结果。 无法解析或落在 min / max 之外的选项自动不可按下；带秒的时刻按 granularity 归一后再比较与写入。 |
| `disabled` | `boolean` |  | 禁用：分段输入整组退出 Tab 序列、触发器使用原生 disabled，隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、列表照常浏览，但值不可修改也不可清空。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `required` | `boolean` |  | 必填标注（写入每段的 aria-required）。 |
| `name` | `string` |  | 表单字段名；提供后隐藏输入才带 name，值随表单一并提交。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色使用方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，输入行与浮层中的格子一并换档。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `isTimeUnavailable` | `(value: string, unit: TimePickerColumnUnit) => boolean` |  | 逐值可选性。接收两位补零的值与所属的列：同一个 '30' 在分钟列与秒列含义不同。 与 min / max 裁掉的值同等处理：判定为真的格子仍可聚焦，只是不可选中。 连续区间用 min / max 表达即可，该项留给每隔 15 分钟才可预约这类离散规则。 |
| `translations` | `Partial<TimePickerTranslations>` |  | 段位读屏名的覆盖；未提供时使用内置英文语义名。 |
| `onValueChange` | `(details: TimePickerValueChangeDetails) => void` |  |  |
| `onOpenChange` | `(details: TimePickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### TimePickerPreset

`presets` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` | 是 | 显示文案，同时是该项的可及名。 |
| `disabled` | `boolean` |  | 禁用该项：方向键仍可停留，但按下不写值。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TimePickerValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `open-change` | `TimePickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTimePickerColumn` | `default` | `TimePickerColumnSlotProps` |  |
| `XhTimePickerPreset` | `default` | — | 条目内容；未写时使用数据中的 label。 |
| `XhTimePickerPresetGroup` | `default` | `TimePickerPresetsSlotProps` | 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 |
| `XhTimePickerRoot` | `default` | `TimePickerRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhTimePickerColumn` | `unit` | `TimePickerColumnUnit` | 是 |  |
| `XhTimePickerColumn` | `children` | `SlotChildren<TimePickerColumnSlotProps>` |  |  |
| `XhTimePickerItem` | `value` | `string` | 是 | 两位补零的显示串（'09' / '30'）；上下午列写 '00' / '01'。 |
| `XhTimePickerPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhTimePickerPreset` | `value` | `string` | 是 | 该条目的身份，与 presets 数据中的 value 逐字对应。 |
| `XhTimePickerPresetGroup` | `children` | `SlotChildren<TimePickerPresetsSlotProps>` |  | 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 |
| `XhTimePickerRoot` | `children` | `SlotChildren<TimePickerRootSlotProps>` |  |  |
| `XhTimePickerSegment` | `segment` | `TimeSegmentType` | 是 | 段的身份由作者声明。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `preset` | 'checked' \| 'unchecked' |
| `column` | 'open' \| 'closed' |
| `item` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `OPTION.FOCUS` · `ITEM.SELECT` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `canEdit` · `closesOnPreset` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string` | ISO 时间串；任一必填段为空时为空串。 |
| `empty` | `boolean` | 值为空串（尚未填全）。 |
| `outOfRange` | `boolean` | 已填全但落在 min / max 之外。只是标注，不改写值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `hourCycle` | `TimeHourCycle` | 实际生效的小时制（prop 未提供时由 locale 推断的值）。 |
| `granularity` | `TimeGranularity` |  |
| `step` | `number` | 实际生效的分列步进。 |
| `segments` | `TimeSegmentType[]` | 当前参与显示的段，文档序。未列入的段由 connect 写上 hidden 收起。 |
| `focusedSegment` | `TimeSegmentType \| null` | 焦点所在段；焦点在分段输入外时为 null。 |
| `columns` | `TimePickerColumn[]` | 当前应排列的列及每列的可选值（已按 step 与 min / max 裁剪）。作者据此渲染浮层。 |
| `focusedColumn` | `TimePickerColumnUnit \| null` |  |
| `focusedItem` | `string \| null` |  |
| `presets` | `readonly TimePickerPresetState[]` | 快捷选项逐条的状态，数据顺序。未提供 presets 时为空数组。 |
| `canClear` | `boolean` | 清空按钮当前是否可按。 |
| `getSegmentText` | `(props: TimePickerSegmentProps) => string` | 某一段应显示的文字（空段是占位串）。各适配器都用它填充文本，保证同构。 |
| `getItemText` | `(props: TimePickerItemProps) => string` | 某一格应显示的文字。数字列即格子自身的值，上下午列按 locale 给出「上午 / 下午」。 各适配器都用它填充文本，保证同构。 |
| `isItemSelected` | `(props: TimePickerItemProps) => boolean` |  |
| `isItemDisabled` | `(props: TimePickerItemProps) => boolean` | 落在 min / max 之外（或整个控件禁用）：仍在列表中，但不可选、方向键跳过。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentGroupProps` | `() => T['element']` | 段位与分隔符的外壳：占满盒内剩余宽度，把尾部按钮推到框内末端。 |
| `getSegmentProps` | `(props: TimePickerSegmentProps) => T['element']` | 分段输入：一段一个节点，与 TimeField 的段同构（role=spinbutton + roving tabindex）。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getPresetGroupProps` | `() => T['element']` | 快捷选项列（role=listbox）；未提供 presets 时带 hidden。 |
| `getPresetProps` | `(props: TimePickerPresetProps) => T['element']` | 一条快捷选项（role=option）：点击把整份时间写入值并收起浮层。 |
| `getColumnProps` | `(props: TimePickerColumnProps) => T['element']` |  |
| `getItemProps` | `(props: TimePickerItemProps) => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowDown` / `ArrowUp` | focus in trigger, closed, not disabled | 展开浮层，焦点落到时列（已选的时仍可选就停在它上面，否则停在首格） |
| `Enter` / `Space` | focus in trigger, not disabled | 按钮的默认激活即展开/收起（不额外拦键，否则会一开一关） |
| `ArrowDown` | open, focus in 某一列 | 列内下移一格，到尾回绕；被 min/max 裁掉的格自动跳过 |
| `ArrowUp` | open, focus in 某一列 | 列内上移一格，到头回绕；被 min/max 裁掉的格自动跳过 |
| `Home` | open, focus in 某一列 | 焦点移到本列首格 |
| `End` | open, focus in 某一列 | 焦点移到本列末格 |
| `ArrowRight` | open | 换到下一列并落在该列的锚点上；已在末列则不动，不回绕 |
| `ArrowLeft` | open | 换到上一列并落在该列的锚点上；已在首列则不动，不回绕 |
| `Enter` / `Space` | open, 焦点停在可选的格上, not disabled/readOnly | 把这一格写进对应的段；浮层不收起（其余列还要接着挑） |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | open, focus in 快捷选项列 | 在快捷选项之间移动焦点，到头回绕；时分秒那几列的处理器在这一列内不参与 |
| `Enter` / `Space` | open, focus in 某条快捷选项, not disabled/readOnly | 把这条快捷选项整份写进值并收起浮层 |
| `Escape` | open | 收起浮层并把焦点归还触发器，值不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层且不拦按键，焦点按 Tab 序列自然离开，不抢回触发器 |
| `ArrowUp` | focus in 某一段, not disabled/readOnly | 本段加一格，到头回绕；空段落到该段下界 |
| `ArrowDown` | focus in 某一段, not disabled/readOnly | 本段减一格，到头回绕；空段落到该段上界 |
| `ArrowRight` | focus in 某一段, not disabled | 焦点移到下一段；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in 某一段, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in 某一段, not disabled | 焦点移到首段 |
| `End` | focus in 某一段, not disabled | 焦点移到末段 |
| `0-9` | focus in 数字段, not disabled/readOnly | 把数字并进本段；本段再吃不下第二位时自动跳到下一段 |
| `Backspace` / `Delete` | focus in 某一段, not disabled/readOnly | 清掉本段；小时被清时上下午段仍保留原来的上午/下午 |
| `a` / `p` | focus in 上下午段, 12 小时制, not disabled/readOnly | a 取上午、p 取下午（不区分大小写） |
| `Alt+ArrowDown` | focus in 某一段, closed, not disabled | 展开浮层并把焦点移入；触发按钮是可选部件，键盘入口不能只挂在它上面 |
| `Enter` | focus in 某一段, open | 收起浮层。段位里敲出来的值不触发「选完即收」（那时人还在打字），这是那条路的收口手势 |
| `Enter` / `Space` | held on trigger（not disabled）、clear-trigger（可清）、preset 或 item（open, not disabled/readOnly, 该条可按） | 按住期间该部件投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，浮层收起时一并撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'group' |
| `segment` | `aria-disabled` | 'true' \| 'false' |
| `segment` | `aria-invalid` | 'true' \| 'false' |
| `segment` | `aria-label` | prop('translations')?.[segment] |
| `segment` | `aria-readonly` | 'true' \| 'false' |
| `segment` | `aria-required` | 'true' \| 'false' |
| `segment` | `aria-valuemax` | range.max |
| `segment` | `aria-valuemin` | range.min |
| `segment` | `aria-valuenow` | segmentNumber(draft, segment, hourCycle) |
| `segment` | `aria-valuetext` | timeSegmentText(draft, segment, { hourCycle, locale }) |
| `segment` | `role` | 'spinbutton' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-labelledby` | `label` 部件的 id |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `preset-group` | `aria-disabled` | 'true' \| 'false' |
| `preset-group` | `aria-label` | props.translations.presets |
| `preset-group` | `aria-multiselectable` | 'false' |
| `preset-group` | `aria-orientation` | 'vertical' |
| `preset-group` | `role` | 'listbox' |
| `preset` | `aria-disabled` | 'true' \| 'false' |
| `preset` | `aria-selected` | 'true' \| 'false' |
| `preset` | `role` | 'option' |
| `column` | `aria-disabled` | 'true' \| 'false' |
| `column` | `aria-label` | prop('translations')?.[unit] |
| `column` | `aria-multiselectable` | 'false' |
| `column` | `aria-orientation` | 'vertical' |
| `column` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |

## 样式参考

### 皮肤

`@xihan-ui/styles/time-picker.css` 使用 `[data-scope="time-picker"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-out-of-range` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-focus` | ''（条件成立时才出现） |
| `segment` | `data-invalid` | ''（条件成立时才出现） |
| `segment` | `data-placeholder` | ''（条件成立时才出现） |
| `segment` | `data-readonly` | ''（条件成立时才出现） |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'field-inset' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `clear-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `preset` | `data-disabled` | ''（条件成立时才出现） |
| `preset` | `data-pressed` | ''（条件成立时才出现） |
| `preset` | `data-state` | 'checked' \| 'unchecked' |
| `preset` | `data-xh-collection-context` | 'overlay' |
| `preset` | `data-xh-collection-item` | '' |
| `preset` | `data-xh-collection-size` | props.size |
| `column` | `data-disabled` | ''（条件成立时才出现） |
| `column` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-time-picker-action-bg` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | time-picker 的 clear-trigger、trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-time-picker-action-bg-active` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | time-picker 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-time-picker-action-bg-hover` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open`<br>`xh-ink-surface` | `--xh-_action-variant-bg-hover` | time-picker 的 clear-trigger、trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-time-picker-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` | time-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-time-picker-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open` | `--xh-fg-default` | time-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-time-picker-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` | time-picker 的 clear-trigger、trigger 部件 font-size 覆盖槽。 |
| `--xh-time-picker-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-inset` | time-picker 的 clear-trigger、trigger 部件 border-radius 覆盖槽。 |
| `--xh-time-picker-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | time-picker 的 clear-trigger、trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-time-picker-column-divider` | `column`<br>`preset-group` | `border-inline-end`<br>`border-inline-start` | `default` | `--xh-material-frosted-separator` | time-picker 的 column、preset-group 部件 border-inline-end、border-inline-start 覆盖槽。 |
| `--xh-time-picker-column-gap` | `column` | `gap` | `default` | `0` | time-picker 的 column 部件 gap 覆盖槽。 |
| `--xh-time-picker-column-h` | `column` | `block-size` | `default` | `--xh-viewport-h-sm` | time-picker 的 column 部件 block-size 覆盖槽。 |
| `--xh-time-picker-column-min-w` | `column` | `min-inline-size` | `default` | `--xh-overlay-column-min-w` | time-picker 的 column 部件 min-inline-size 覆盖槽。 |
| `--xh-time-picker-column-px` | `column` | `padding-inline` | `default` | `0` | time-picker 的 column 部件 padding-inline 覆盖槽。 |
| `--xh-time-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | time-picker 的 content 部件 background 覆盖槽。 |
| `--xh-time-picker-content-border` | `content` | `border` | `default` | `--xh-border-default` | time-picker 的 content 部件 border 覆盖槽。 |
| `--xh-time-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | time-picker 的 content 部件 color 覆盖槽。 |
| `--xh-time-picker-content-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-lg` | time-picker 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-time-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | time-picker 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-time-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | time-picker 的 content 部件 padding-block 覆盖槽。 |
| `--xh-time-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | time-picker 的 content 部件 border-radius 覆盖槽。 |
| `--xh-time-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` | time-picker 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-time-picker-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | time-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-picker-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | time-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-picker-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | time-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-picker-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | time-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-picker-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | time-picker 的 control 部件 border 覆盖槽。 |
| `--xh-time-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | time-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | time-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-picker-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | time-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-picker-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | time-picker 的 control 部件 color 覆盖槽。 |
| `--xh-time-picker-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_time-picker-gap` | time-picker 的 control 部件 gap 覆盖槽。 |
| `--xh-time-picker-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_time-picker-control-h` | time-picker 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-time-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | time-picker 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-time-picker-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_time-picker-control-px` | time-picker 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-time-picker-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | time-picker 的 control 部件 border-radius 覆盖槽。 |
| `--xh-time-picker-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | time-picker 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-time-picker-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` | time-picker 的 root 部件 inline-size、min-inline-size 覆盖槽。 |
| `--xh-time-picker-font-size` | `control` | `font-size` | `default` | `--xh-_time-picker-font-size` | time-picker 的 control 部件 font-size 覆盖槽。 |
| `--xh-time-picker-gap` | `root` | `gap` | `default` | `--xh-space-1` | time-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-time-picker-icon-size` | `control`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | time-picker 的 control、positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-time-picker-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | time-picker 的 item 部件 background-color 覆盖槽。 |
| `--xh-time-picker-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | time-picker 的 item 部件 background-color 覆盖槽。 |
| `--xh-time-picker-item-check-fg` | `item` | `background-color` | `default` | `--xh-_time-picker-check-fg` | time-picker 的 item 部件 background-color 覆盖槽。 |
| `--xh-time-picker-item-check-size` | `item` | `block-size`<br>`inline-size`<br>`padding-inline` | `default` | `--xh-glyph-size-sm` | time-picker 的 item 部件 block-size、inline-size、padding-inline 覆盖槽。 |
| `--xh-time-picker-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` | time-picker 的 item 部件 color 覆盖槽。 |
| `--xh-time-picker-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-time-picker-item-fg` | time-picker 的 item 部件 color 覆盖槽。 |
| `--xh-time-picker-item-font-size` | `item` | `font-size` | `default` | `--xh-_time-picker-font-size` | time-picker 的 item 部件 font-size 覆盖槽。 |
| `--xh-time-picker-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-regular` | time-picker 的 item 部件 font-weight 覆盖槽。 |
| `--xh-time-picker-item-h` | `item` | `block-size` | `default` | `--xh-overlay-column-item-h` | time-picker 的 item 部件 block-size 覆盖槽。 |
| `--xh-time-picker-item-px` | `item` | `padding-inline` | `default` | `--xh-space-0_5` | time-picker 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-time-picker-item-py` | `item` | `padding-block` | `default` | `0` | time-picker 的 item 部件 padding-block 覆盖槽。 |
| `--xh-time-picker-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | time-picker 的 item 部件 border-radius 覆盖槽。 |
| `--xh-time-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | time-picker 的 label 部件 color 覆盖槽。 |
| `--xh-time-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | time-picker 的 label 部件 color 覆盖槽。 |
| `--xh-time-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | time-picker 的 label 部件 font-size 覆盖槽。 |
| `--xh-time-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | time-picker 的 label 部件 font-weight 覆盖槽。 |
| `--xh-time-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | time-picker 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-time-picker-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` | time-picker 的 segment-group 部件 color 覆盖槽。 |
| `--xh-time-picker-placeholder-fg` | `segment` | `color` | `placeholder` | `--xh-fg-subtle` | time-picker 的 segment 部件 color 覆盖槽。 |
| `--xh-time-picker-preset-bg-hover` | `preset` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | time-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-time-picker-preset-bg-pressed` | `preset` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | time-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-time-picker-preset-check-fg` | `preset` | `background-color` | `default` | `--xh-_time-picker-check-fg` | time-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-time-picker-preset-check-size` | `preset` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-glyph-size-sm` | time-picker 的 preset 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-time-picker-preset-fg` | `preset` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` | time-picker 的 preset 部件 color 覆盖槽。 |
| `--xh-time-picker-preset-fg-checked` | `preset` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-time-picker-preset-fg` | time-picker 的 preset 部件 color 覆盖槽。 |
| `--xh-time-picker-preset-fg-disabled` | `preset` | `background-color`<br>`color` | `default`<br>`disabled` | `--xh-fg-disabled` | time-picker 的 preset 部件 background-color、color 覆盖槽。 |
| `--xh-time-picker-preset-group-gap` | `preset-group` | `gap` | `default` | `--xh-list-option-gap` | time-picker 的 preset-group 部件 gap 覆盖槽。 |
| `--xh-time-picker-preset-group-h` | `preset-group` | `max-block-size` | `default` | `--xh-viewport-h-sm` | time-picker 的 preset-group 部件 max-block-size 覆盖槽。 |
| `--xh-time-picker-preset-group-px` | `preset-group` | `padding-inline` | `default` | `--xh-space-1` | time-picker 的 preset-group 部件 padding-inline 覆盖槽。 |
| `--xh-time-picker-preset-px` | `preset` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-space-3` | time-picker 的 preset 部件 inset-inline-end、padding-inline、padding-inline-end 覆盖槽。 |
| `--xh-time-picker-preset-py` | `preset` | `padding-block` | `default` | `--xh-space-1` | time-picker 的 preset 部件 padding-block 覆盖槽。 |
| `--xh-time-picker-preset-radius` | `preset` | `border-radius` | `default` | `--xh-shape-control` | time-picker 的 preset 部件 border-radius 覆盖槽。 |
| `--xh-time-picker-segment-bg-focus` | `segment` | `background` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])` | `--xh-_time-picker-segment-bg` | time-picker 的 segment 部件 background 覆盖槽。 |
| `--xh-time-picker-segment-bg-hover` | `segment` | `background` | `disabled`<br>`focus`<br>`hover`<br>`not([data-focus], [data-disabled])` | `--xh-bg-subtle` | time-picker 的 segment 部件 background 覆盖槽。 |
| `--xh-time-picker-segment-bg-invalid-focus` | `segment` | `background` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-bg-subtle` | time-picker 的 segment 部件 background 覆盖槽。 |
| `--xh-time-picker-segment-fg-focus` | `segment` | `color` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])`<br>`placeholder` | `--xh-_time-picker-segment-fg` | time-picker 的 segment 部件 color 覆盖槽。 |
| `--xh-time-picker-segment-fg-invalid` | `segment` | `color` | `invalid` | `--xh-fg-danger` | time-picker 的 segment 部件 color 覆盖槽。 |
| `--xh-time-picker-segment-fg-invalid-focus` | `segment` | `color` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-fg-danger` | time-picker 的 segment 部件 color 覆盖槽。 |
| `--xh-time-picker-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-0_5` | time-picker 的 segment 部件 padding-inline 覆盖槽。 |
| `--xh-time-picker-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` | time-picker 的 segment 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现（锚定列表）（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` · `color` · `opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
