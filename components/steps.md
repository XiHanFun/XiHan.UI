来源：https://ui.docs.xihanfun.com/components/steps

# Steps `步骤条`

把一件事拆成有先后的几步，并标出走到哪一步了。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/steps" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/steps.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/steps" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/steps" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/steps.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 value 即为非受控；方向键只搬焦点，按 Enter 或空格才切步，进退方法由 root 的插槽交出来

```vue
<script setup lang="ts">
import {
  XhButton,
  XhStepsContent,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = [
  { title: "填写地址", description: "收货人与联系方式" },
  { title: "选择支付", description: "支付方式与优惠" },
  { title: "确认订单", description: "核对金额" },
];
</script>

<template>
  <XhStepsRoot
    v-slot="{ value, count, complete, goToPrevStep, goToNextStep }"
    :count="steps.length"
    style="inline-size: 100%"
  >
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <!-- 圆点里的字符是作者内容：皮肤只按 data-state 管描边与填充 -->
          <XhStepsIndicator>{{ value > i ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">面板 1：填写收货地址。</XhStepsContent>
    <XhStepsContent :value="1">面板 2：选择支付方式。</XhStepsContent>
    <XhStepsContent :value="2">面板 3：核对金额并提交。</XhStepsContent>
    <!-- value 等于 count 的这块是完成页：走完最后一步之后的那一格 -->
    <XhStepsContent :value="steps.length">全部完成：订单已提交。</XhStepsContent>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" :disabled="value === 0" @click="goToPrevStep()">
        上一步
      </XhButton>
      <XhButton variant="solid" :disabled="complete" @click="goToNextStep()">
        下一步
      </XhButton>
      <span>{{ complete ? "当前：全部完成" : `当前：第 ${value + 1} / ${count} 步` }}</span>
    </div>
  </XhStepsRoot>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <!-- 不写 value：步序住在组件里，宿主只跟着它回显 -->
  <xh-steps id="steps-basic" count="3">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <div data-xh-part="item" value="0">
          <button data-xh-part="trigger">
            <!-- 圆点里的字符是作者内容：皮肤只按 data-state 管描边与填充 -->
            <span data-xh-part="indicator">1</span>
            <span data-xh-part="title">填写地址</span>
            <span data-xh-part="description">收货人与联系方式</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="1">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">2</span>
            <span data-xh-part="title">选择支付</span>
            <span data-xh-part="description">支付方式与优惠</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="2">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">3</span>
            <span data-xh-part="title">确认订单</span>
            <span data-xh-part="description">核对金额</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
      </div>

      <div data-xh-part="content" value="0">面板 1：填写收货地址。</div>
      <div data-xh-part="content" value="1">面板 2：选择支付方式。</div>
      <div data-xh-part="content" value="2">面板 3：核对金额并提交。</div>
    </div>
  </xh-steps>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="steps-basic-prev" variant="outline">
      <button data-xh-part="root">上一步</button>
    </xh-button>
    <xh-button id="steps-basic-next" variant="solid">
      <button data-xh-part="root">下一步</button>
    </xh-button>
    <span>当前：第 <span id="steps-basic-value">1</span> / 3 步</span>
  </div>
</div>

<script type="module">
  const steps = document.getElementById("steps-basic");
  const readout = document.getElementById("steps-basic-value");
  const prev = document.getElementById("steps-basic-prev");
  const next = document.getElementById("steps-basic-next");
  const triggers = [...steps.querySelectorAll('[data-xh-part="trigger"]')];
  const indicators = [...steps.querySelectorAll('[data-xh-part="indicator"]')];

  // 步序不在这里持有，只从 value-change 抄一份用来画圆点与开合按钮
  let step = 0;

  function paint(current) {
    step = current;
    readout.textContent = String(current + 1);
    prev.disabled = current === 0;
    next.disabled = current === triggers.length - 1;
    indicators.forEach((indicator, index) => {
      indicator.textContent = current > index ? "" : String(index + 1);
    });
  }

  // 外部按钮转交给对应那一步的标签，与用户自己点它走的是同一条路
  prev.addEventListener("click", () => triggers[step - 1]?.click());
  next.addEventListener("click", () => triggers[step + 1]?.click());

  steps.addEventListener("value-change", (event) => paint(event.detail.value));
  paint(0);
</script>
```

## 示例

### 受控

传了 value 就由宿主说了算，组件自己不再改步序；切步意图从 value-change 出来，写回才真的切

```vue
<script setup lang="ts">
import {
  XhButton,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const steps = ["提交申请", "主管审批", "财务复核", "归档"];
const current = ref(1);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhStepsRoot v-model:value="current" :count="steps.length">
      <XhStepsList>
        <XhStepsItem v-for="(s, i) in steps" :key="s" :value="i">
          <XhStepsTrigger>
            <XhStepsIndicator>{{ current > i ? "" : i + 1 }}</XhStepsIndicator>
            <XhStepsTitle>{{ s }}</XhStepsTitle>
          </XhStepsTrigger>
          <XhStepsSeparator />
        </XhStepsItem>
      </XhStepsList>
    </XhStepsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" @click="current = 0">回到第一步</XhButton>
      <XhButton variant="outline" @click="current = steps.length">直接完成</XhButton>
      <span>当前 value：{{ current }}</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-steps id="steps-controlled" value="1" count="4">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <div data-xh-part="item" value="0">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator"></span>
            <span data-xh-part="title">提交申请</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="1">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">2</span>
            <span data-xh-part="title">主管审批</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="2">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">3</span>
            <span data-xh-part="title">财务复核</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="3">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">4</span>
            <span data-xh-part="title">归档</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
      </div>
    </div>
  </xh-steps>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="steps-controlled-first" variant="outline">
      <button data-xh-part="root">回到第一步</button>
    </xh-button>
    <xh-button id="steps-controlled-complete" variant="outline">
      <button data-xh-part="root">直接完成</button>
    </xh-button>
    <span>当前 value：<span id="steps-controlled-value">1</span></span>
  </div>
</div>

<script type="module">
  // 步序只在这里写，圆点里的对勾与序号跟着它走
  const steps = document.getElementById("steps-controlled");
  const readout = document.getElementById("steps-controlled-value");
  const first = document.getElementById("steps-controlled-first");
  const complete = document.getElementById("steps-controlled-complete");
  const indicators = [...steps.querySelectorAll('[data-xh-part="indicator"]')];

  function setValue(next) {
    steps.value = next;
    readout.textContent = String(next);
    indicators.forEach((indicator, index) => {
      indicator.textContent = next > index ? "" : String(index + 1);
    });
  }

  steps.addEventListener("value-change", (event) => setValue(event.detail.value));
  first.addEventListener("click", () => setValue(0));
  complete.addEventListener("click", () => setValue(4));
</script>
```

### 线性模式

linear 下还没走到的步一律禁用，只能回头看走过的；它只拦界面上的乱跳，逐步前进照常

```vue
<script setup lang="ts">
import {
  XhButton,
  XhStepsContent,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = ["实名认证", "绑定银行卡", "签署协议"];
</script>

<template>
  <XhStepsRoot
    v-slot="{ value, complete, goToPrevStep, goToNextStep }"
    :count="steps.length"
    linear
    style="inline-size: 100%"
  >
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ value > i ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s }}</XhStepsTitle>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">面板 1：上传证件照。</XhStepsContent>
    <XhStepsContent :value="1">面板 2：填写卡号。</XhStepsContent>
    <XhStepsContent :value="2">面板 3：勾选并签署。</XhStepsContent>
    <XhStepsContent :value="steps.length">全部完成。</XhStepsContent>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" :disabled="value === 0" @click="goToPrevStep()">
        上一步
      </XhButton>
      <XhButton variant="solid" :disabled="complete" @click="goToNextStep()">
        下一步
      </XhButton>
    </div>
  </XhStepsRoot>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-steps id="steps-linear" value="0" count="3" linear>
    <div data-xh-part="root">
      <div data-xh-part="list">
        <div data-xh-part="item" value="0">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">1</span>
            <span data-xh-part="title">实名认证</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="1">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">2</span>
            <span data-xh-part="title">绑定银行卡</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="2">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">3</span>
            <span data-xh-part="title">签署协议</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
      </div>

      <div data-xh-part="content" value="0">面板 1：上传证件照。</div>
      <div data-xh-part="content" value="1">面板 2：填写卡号。</div>
      <div data-xh-part="content" value="2">面板 3：勾选并签署。</div>
      <div data-xh-part="content" value="3">全部完成。</div>
    </div>
  </xh-steps>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="steps-linear-prev" variant="outline">
      <button data-xh-part="root">上一步</button>
    </xh-button>
    <xh-button id="steps-linear-next" variant="solid">
      <button data-xh-part="root">下一步</button>
    </xh-button>
    <span id="steps-linear-value">当前：第 1 / 3 步</span>
  </div>
</div>

<script type="module">
  const steps = document.getElementById("steps-linear");
  const readout = document.getElementById("steps-linear-value");
  const prev = document.getElementById("steps-linear-prev");
  const next = document.getElementById("steps-linear-next");
  const indicators = [...steps.querySelectorAll('[data-xh-part="indicator"]')];

  const COUNT = 3;
  let step = 0;

  // 两颗按钮直接写步序：linear 拦的是标签上的乱跳，逐步前进不受它管
  function setValue(current) {
    step = current;
    steps.value = current;
    prev.disabled = current === 0;
    next.disabled = current === COUNT;
    readout.textContent =
      current === COUNT ? "当前：全部完成" : `当前：第 ${current + 1} / ${COUNT} 步`;
    indicators.forEach((indicator, index) => {
      indicator.textContent = current > index ? "" : String(index + 1);
    });
  }

  prev.addEventListener("click", () => setValue(step - 1));
  next.addEventListener("click", () => setValue(step + 1));

  // 点已经走过的标签能回头看，还没解锁的那些按不动
  steps.addEventListener("value-change", (event) => setValue(event.detail.value));
  setValue(0);
</script>
```

### 竖排

orientation="vertical" 把步骤列与面板并排摆，方向键随之改收上下键

```vue
<script setup lang="ts">
import {
  XhStepsContent,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = [
  { title: "打包", description: "生成产物" },
  { title: "测试", description: "跑单元测试" },
  { title: "发布", description: "推到镜像仓库" },
];
</script>

<template>
  <XhStepsRoot
    :count="steps.length"
    :default-value="1"
    orientation="vertical"
    style="inline-size: 100%"
  >
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">面板 1：打包日志。</XhStepsContent>
    <XhStepsContent :value="1">面板 2：测试报告。</XhStepsContent>
    <XhStepsContent :value="2">面板 3：发布记录。</XhStepsContent>
    <XhStepsContent :value="steps.length">流水线跑完了。</XhStepsContent>
  </XhStepsRoot>
</template>
```

```html
<xh-steps count="3" default-value="1" orientation="vertical">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="list">
      <div data-xh-part="item" value="0">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">1</span>
          <span data-xh-part="title">打包</span>
          <span data-xh-part="description">生成产物</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="1">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">2</span>
          <span data-xh-part="title">测试</span>
          <span data-xh-part="description">跑单元测试</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="2">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">3</span>
          <span data-xh-part="title">发布</span>
          <span data-xh-part="description">推到镜像仓库</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
    </div>

    <div data-xh-part="content" value="0">面板 1：打包日志。</div>
    <div data-xh-part="content" value="1">面板 2：测试报告。</div>
    <div data-xh-part="content" value="2">面板 3：发布记录。</div>
    <!-- value 等于 count 的这块是完成页：走完最后一步之后的那一格 -->
    <div data-xh-part="content" value="3">流水线跑完了。</div>
  </div>
</xh-steps>
```

### 语气

tone 决定已完成与当前这两步的标记、连接线用哪族颜色；示例预置到第 2 步，第 1 步已走完

```vue
<script setup lang="ts">
import {
  XhStepsContent,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const steps = [
  { title: "填写地址", description: "收货人与联系方式" },
  { title: "选择支付", description: "支付方式与优惠" },
  { title: "确认订单", description: "核对金额" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div v-for="t in tones" :key="t">
      <div style="margin-block-end: 8px; font-size: 12px">{{ t }}</div>
      <XhStepsRoot
        :tone="t"
        :count="steps.length"
        :default-value="1"
        style="inline-size: 100%"
      >
        <XhStepsList>
          <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
            <XhStepsTrigger>
              <XhStepsIndicator>{{ i === 0 ? "" : i + 1 }}</XhStepsIndicator>
              <XhStepsTitle>{{ s.title }}</XhStepsTitle>
              <XhStepsDescription>{{ s.description }}</XhStepsDescription>
            </XhStepsTrigger>
            <XhStepsSeparator />
          </XhStepsItem>
        </XhStepsList>

        <XhStepsContent v-for="(s, i) in steps" :key="s.title" :value="i">
          面板 {{ i + 1 }}：{{ s.title }}
        </XhStepsContent>
        <XhStepsContent :value="steps.length">全部完成。</XhStepsContent>
      </XhStepsRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">brand</div>
    <xh-steps tone="brand" count="3" default-value="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">neutral</div>
    <xh-steps tone="neutral" count="3" default-value="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">success</div>
    <xh-steps tone="success" count="3" default-value="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">warning</div>
    <xh-steps tone="warning" count="3" default-value="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">danger</div>
    <xh-steps tone="danger" count="3" default-value="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">info</div>
    <xh-steps tone="info" count="3" default-value="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
</div>
```

### 尺寸

size 换序号圆点的直径与标题、说明的字号，不传 size 即默认档

```vue
<script setup lang="ts">
import {
  XhStepsContent,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
const steps = [
  { title: "填写地址", description: "收货人与联系方式" },
  { title: "选择支付", description: "支付方式与优惠" },
  { title: "确认订单", description: "核对金额" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div v-for="s in sizes" :key="s.label">
      <div style="margin-block-end: 8px; font-size: 12px">{{ s.label }}</div>
      <XhStepsRoot
        :size="s.size"
        :count="steps.length"
        :default-value="1"
        style="inline-size: 100%"
      >
        <XhStepsList>
          <XhStepsItem v-for="(item, i) in steps" :key="item.title" :value="i">
            <XhStepsTrigger>
              <XhStepsIndicator>{{ i === 0 ? "" : i + 1 }}</XhStepsIndicator>
              <XhStepsTitle>{{ item.title }}</XhStepsTitle>
              <XhStepsDescription>{{ item.description }}</XhStepsDescription>
            </XhStepsTrigger>
            <XhStepsSeparator />
          </XhStepsItem>
        </XhStepsList>

        <XhStepsContent v-for="(item, i) in steps" :key="item.title" :value="i">
          面板 {{ i + 1 }}：{{ item.title }}
        </XhStepsContent>
        <XhStepsContent :value="steps.length">全部完成。</XhStepsContent>
      </XhStepsRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">小</div>
    <xh-steps size="sm" count="3" default-value="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
  <!-- 中间一档不写 size -->
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">默认</div>
    <xh-steps count="3" default-value="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">大</div>
    <xh-steps size="lg" count="3" default-value="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
</div>
```

### 点击切步与禁用某步

点标签直接切到那一步；单步标了 disabled 就点不动，方向键也跳过它

```vue
<script setup lang="ts">
import {
  XhStepsContent,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const steps = [
  { title: "选择商品", disabled: false },
  { title: "确认订单", disabled: false },
  { title: "在线支付", disabled: true },
  { title: "等待发货", disabled: false },
];
const current = ref(0);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhStepsRoot v-model:value="current" :count="steps.length">
      <XhStepsList>
        <XhStepsItem
          v-for="(s, i) in steps"
          :key="s.title"
          :value="i"
          :disabled="s.disabled"
        >
          <XhStepsTrigger>
            <XhStepsIndicator>{{ current > i ? "" : i + 1 }}</XhStepsIndicator>
            <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          </XhStepsTrigger>
          <XhStepsSeparator />
        </XhStepsItem>
      </XhStepsList>

      <XhStepsContent v-for="(s, i) in steps" :key="s.title" :value="i">
        面板 {{ i + 1 }}：{{ s.title }}
      </XhStepsContent>
      <XhStepsContent :value="steps.length">全部完成。</XhStepsContent>
    </XhStepsRoot>

    <span>当前 value：{{ current }}（第三步禁用，点它没有反应）</span>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-steps id="steps-click" value="0" count="4">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <div data-xh-part="item" value="0">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">1</span>
            <span data-xh-part="title">选择商品</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="1">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">2</span>
            <span data-xh-part="title">确认订单</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="2" aria-disabled="true">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">3</span>
            <span data-xh-part="title">在线支付</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="3">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">4</span>
            <span data-xh-part="title">等待发货</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
      </div>

      <div data-xh-part="content" value="0">面板 1：选择商品</div>
      <div data-xh-part="content" value="1">面板 2：确认订单</div>
      <div data-xh-part="content" value="2">面板 3：在线支付</div>
      <div data-xh-part="content" value="3">面板 4：等待发货</div>
      <div data-xh-part="content" value="4">全部完成。</div>
    </div>
  </xh-steps>

  <span>当前 value：<span id="steps-click-value">0</span>（第三步禁用，点它没有反应）</span>
</div>

<script type="module">
  // 步序只在这里写，圆点里的对勾与序号跟着它走
  const steps = document.getElementById("steps-click");
  const readout = document.getElementById("steps-click-value");
  const indicators = [...steps.querySelectorAll('[data-xh-part="indicator"]')];

  steps.addEventListener("value-change", (event) => {
    const next = event.detail.value;
    steps.value = next;
    readout.textContent = String(next);
    indicators.forEach((indicator, index) => {
      indicator.textContent = next > index ? "" : String(index + 1);
    });
  });
</script>
```

### 出错的那一步

步序只认下标，「这一步出错了」是宿主自己的数据：在那一步的 item 上换掉标记与颜色令牌

```vue
<script setup lang="ts">
import {
  XhButton,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const steps = [
  { title: "提交材料", description: "已通过" },
  { title: "资质审核", description: "材料不齐，被打回" },
  { title: "签署合同", description: "等待中" },
];

// 出错的那一步
const errorAt = 1;

// 当前档与已走过档一起换成危险色，写在 item 上，序号、标题与连接线都从这里继承
const errorTokens = {
  "--xh-steps-indicator-border-current": "var(--xh-fg-danger)",
  "--xh-steps-indicator-fg-current": "var(--xh-fg-danger)",
  "--xh-steps-indicator-border-completed": "var(--xh-fg-danger)",
  "--xh-steps-indicator-bg-completed": "var(--xh-fg-danger)",
  "--xh-steps-title-fg-active": "var(--xh-fg-danger)",
  "--xh-steps-separator-bg-completed": "var(--xh-fg-danger)",
};

const current = ref(1);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhStepsRoot v-model:value="current" :count="steps.length">
      <XhStepsList>
        <XhStepsItem
          v-for="(s, i) in steps"
          :key="s.title"
          :value="i"
          :style="i === errorAt ? errorTokens : undefined"
        >
          <XhStepsTrigger>
            <XhStepsIndicator>
              {{ i === errorAt ? "!" : current > i ? "" : i + 1 }}
            </XhStepsIndicator>
            <XhStepsTitle>{{ s.title }}</XhStepsTitle>
            <XhStepsDescription>{{ s.description }}</XhStepsDescription>
          </XhStepsTrigger>
          <XhStepsSeparator />
        </XhStepsItem>
      </XhStepsList>
    </XhStepsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton size="sm" variant="outline" @click="current = 2">
        走到第三步
      </XhButton>
      <XhButton size="sm" variant="outline" @click="current = 1">
        退回第二步
      </XhButton>
      <span>第二步无论是当前步还是已走过，都停在危险色上</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-steps id="steps-error" value="1" count="3">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <div data-xh-part="item" value="0">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator"></span>
            <span data-xh-part="title">提交材料</span>
            <span data-xh-part="description">已通过</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <!-- 当前档与已走过档一起换成危险色，写在 item 上，序号、标题与连接线都从这里继承 -->
        <div
          data-xh-part="item"
          value="1"
          style="
            --xh-steps-indicator-border-current: var(--xh-fg-danger);
            --xh-steps-indicator-fg-current: var(--xh-fg-danger);
            --xh-steps-indicator-border-completed: var(--xh-fg-danger);
            --xh-steps-indicator-bg-completed: var(--xh-fg-danger);
            --xh-steps-title-fg-active: var(--xh-fg-danger);
            --xh-steps-separator-bg-completed: var(--xh-fg-danger);
          "
        >
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">!</span>
            <span data-xh-part="title">资质审核</span>
            <span data-xh-part="description">材料不齐，被打回</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="2">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">3</span>
            <span data-xh-part="title">签署合同</span>
            <span data-xh-part="description">等待中</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
      </div>
    </div>
  </xh-steps>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="steps-error-third" size="sm" variant="outline">
      <button data-xh-part="root">走到第三步</button>
    </xh-button>
    <xh-button id="steps-error-second" size="sm" variant="outline">
      <button data-xh-part="root">退回第二步</button>
    </xh-button>
    <span>第二步无论是当前步还是已走过，都停在危险色上</span>
  </div>
</div>

<script type="module">
  // 步序只在这里写；出错那一步的标记固定是感叹号，其余跟着步序走
  const errorAt = 1;
  const steps = document.getElementById("steps-error");
  const third = document.getElementById("steps-error-third");
  const second = document.getElementById("steps-error-second");
  const indicators = [...steps.querySelectorAll('[data-xh-part="indicator"]')];

  function setValue(next) {
    steps.value = next;
    indicators.forEach((indicator, index) => {
      indicator.textContent =
        index === errorAt ? "!" : next > index ? "" : String(index + 1);
    });
  }

  steps.addEventListener("value-change", (event) => setValue(event.detail.value));
  third.addEventListener("click", () => setValue(2));
  second.addEventListener("click", () => setValue(1));
</script>
```

## 设计指引

### 何时使用

- 多步表单、开通流程、安装向导，步数固定且顺序明确。
- 需要让用户看见"还剩几步"。

### 何时不用

- 各段之间没有先后、可以随便切：那是[标签页](./tabs)。
- 展示已经发生的事件序列：用[时间线](./timeline)。

### 特性

- `count` 是步序的上界，也是读屏"第 k 步，共 n 步"的分母。
- `linear` 只拦界面上的乱跳（未解锁的入口一律禁用），逐步前进的方法照常可用。
- 方向键只搬焦点，按 Enter 或空格才切步。
- "这一步出错了"是宿主自己的数据：在那一步上换掉标记与颜色令牌即可。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-steps>` |
| Vue 组件 | `XhStepsContent` `XhStepsDescription` `XhStepsIndicator` `XhStepsItem` `XhStepsList` `XhStepsRoot` `XhStepsSeparator` `XhStepsTitle` `XhStepsTrigger` |
| 组合式函数 | `useSteps` |
| 状态机 | `stepsMachine` |
| 皮肤 | `@xihan-ui/styles/steps.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="steps"`：**`root`** · **`list`** · **`item`** · **`trigger`** · `indicator` · `title` · `description` · `separator` · `content`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 当前步序（0 起）。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0。 |
| `collection` | `StepNode[]` |  | 步骤数据，标题、说明、状态与禁用的事实源。给了它，count 缺省即取它的长度。 缺省即回到「文本与状态都写在部件上」的老路。 |
| `statuses` | `Record<number, StepStatus>` |  | 按下标覆盖单步状态，优先于 collection 与步序算出来的那档。 error / warning 两档只能从这里或 collection 来。 |
| `count` | `number` |  | 总步数，是步序的上界与读屏"第 k 步，共 n 步"的分母。 缺省按 0 处理：此时 root 带 data-empty，步序被夹死在 0。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `linear` | `boolean` |  | 线性模式：只能回头看走过的步。未解锁（index &gt; step）的 trigger 一律禁用。 只拦跳转，goToNextStep 逐步前进照常可用。 |
| `disabled` | `boolean` |  | 整组不可交互：trigger 全部退出 Tab 序列，指针与键盘都不认。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 |
| `translations` | `Partial<StepsTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: StepsValueChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `StepsValueChangeDetails` | 步序变化；detail 为 `{ value: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhStepsRoot` | `default` | `StepsRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item` | s.status |
| `trigger` | s.status |
| `indicator` | getItemState(item).status |
| `title` | getItemState(item).status |
| `description` | getItemState(item).status |
| `separator` | getItemState(item).status |
| `content` | getItemState(item).status |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `STEP.PREV` · `STEP.NEXT` · `TRIGGER.FOCUS` · `LIST.BLUR`

## connect API

`useSteps` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number` | 当前步序，恒在 [0, count] 内：count 变小后停在越界步也读得到一个可用的值。 |
| `count` | `number` |  |
| `collection` | `readonly StepNodeMeta[]` | collection 推出的步骤元信息，按数据顺序排列；没给 collection 即空数组。 |
| `complete` | `boolean` | 全部走完（value 走到 count）。此时没有任何一步是 current，作者据此渲染完成页。 |
| `focusedStep` | `number \| null` | 焦点在组外时为 null。 |
| `getItemState` | `(props: StepsItemProps) => StepsItemState` |  |
| `setValue` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count]。 不认 linear：linear 只拦界面上的乱跳，不拦作者的命令式调用。 |
| `goToNextStep` | `() => void` |  |
| `goToPrevStep` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: StepsItemProps) => T['element']` |  |
| `getTriggerProps` | `(props: StepsItemProps) => T['button']` |  |
| `getIndicatorProps` | `(props: StepsItemProps) => T['element']` |  |
| `getTitleProps` | `(props: StepsItemProps) => T['element']` |  |
| `getDescriptionProps` | `(props: StepsItemProps) => T['element']` |  |
| `getSeparatorProps` | `(props: StepsItemProps) => T['element']` |  |
| `getContentProps` | `(props: StepsItemProps) => T['element']` | 面板按 index 与当前步配对；未命中的常挂并带 hidden。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个可停留 trigger（禁用与 linear 未解锁的跳过，尽头不回绕）；步序不变 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个可停留 trigger；步序不变 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, 未禁用且已解锁 | 把当前步切到焦点所在的那一步 |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-label` | props.translations.list |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'tablist' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-current` | 'step' \| undefined |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-posinset` | item.index + 1 \| undefined |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `aria-setsize` | normalizeStepCount(prop('count') ?? (collection.lengt… \| undefined |
| `trigger` | `role` | 'tab' |
| `indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'tabpanel' |

## 样式

默认皮肤 `@xihan-ui/styles/steps.css` 按部件选择：`[data-scope="steps"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-orientation` | props.orientation |
| `item` | `data-state` | s.status |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | s.status |
| `indicator` | `data-state` | getItemState(item).status |
| `title` | `data-state` | getItemState(item).status |
| `description` | `data-state` | getItemState(item).status |
| `separator` | `data-orientation` | props.orientation |
| `separator` | `data-state` | getItemState(item).status |
| `content` | `data-state` | getItemState(item).status |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-steps-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | steps 的 content 部件 color 覆盖槽。 |
| `--xh-steps-content-min-inline-size` | `content`<br>`root` | `flex` | `orientation=vertical` | `--xh-measure-prose` | steps 的 content、root 部件 flex 覆盖槽。 |
| `--xh-steps-content-py` | `content` | `padding-block` | `default` | `--xh-stack-gap-md` | steps 的 content 部件 padding-block 覆盖槽。 |
| `--xh-steps-description-fg` | `description` | `color` | `default` | `--xh-fg-subtle` | steps 的 description 部件 color 覆盖槽。 |
| `--xh-steps-description-font-size` | `description` | `font-size` | `default` | `--xh-_steps-caption-font-size` | steps 的 description 部件 font-size 覆盖槽。 |
| `--xh-steps-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | steps 的 root 部件 gap 覆盖槽。 |
| `--xh-steps-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | steps 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-steps-indicator-bg` | `indicator` | `background` | `default` | `transparent` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-completed` | `indicator` | `background` | `state=completed` | `--xh-_steps-accent` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-border` | `indicator` | `border` | `default` | `--xh-border-control` | steps 的 indicator 部件 border 覆盖槽。 |
| `--xh-steps-indicator-border-completed` | `indicator` | `border-color` | `state=completed` | `--xh-_steps-accent` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-current` | `indicator` | `border-color` | `state=current` | `--xh-_steps-accent` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-disabled` | `indicator`<br>`item` | `border-color` | `disabled` | `--xh-border-subtle` | steps 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-error` | `indicator` | `border-color` | `state=error` | `--xh-fg-danger` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-warning` | `indicator` | `border-color` | `state=warning` | `--xh-fg-warning` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-completed` | `indicator` | `color` | `state=completed` | `--xh-_steps-on-accent` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-current` | `indicator` | `color` | `state=current` | `--xh-_steps-accent-text` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-disabled` | `indicator`<br>`item` | `color` | `disabled` | `--xh-fg-disabled` | steps 的 indicator、item 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-error` | `indicator` | `color` | `state=error` | `--xh-fg-danger` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-warning` | `indicator` | `color` | `state=warning` | `--xh-fg-warning` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-font-size` | `indicator` | `font-size` | `default` | `--xh-_steps-caption-font-size` | steps 的 indicator 部件 font-size 覆盖槽。 |
| `--xh-steps-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | steps 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-steps-indicator-shadow` | `indicator` | `box-shadow` | `state=completed` | `--xh-_steps-highlight` | steps 的 indicator 部件 box-shadow 覆盖槽。 |
| `--xh-steps-indicator-size` | `indicator`<br>`separator` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-_steps-indicator-size` | steps 的 indicator、separator 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-steps-item-gap` | `item` | `gap` | `default` | `--xh-space-2` | steps 的 item 部件 gap 覆盖槽。 |
| `--xh-steps-item-min-inline-size` | `item` | `min-inline-size` | `not(:last-child)`<br>`orientation=horizontal` | `--xh-layout-col-min-xs` | steps 的 item 部件 min-inline-size 覆盖槽。 |
| `--xh-steps-list-gap` | `list` | `gap` | `default` | `--xh-space-2` | steps 的 list 部件 gap 覆盖槽。 |
| `--xh-steps-separator-bg` | `separator` | `background` | `default` | `--xh-border-default` | steps 的 separator 部件 background 覆盖槽。 |
| `--xh-steps-separator-bg-completed` | `separator` | `background` | `state=completed` | `--xh-_steps-accent` | steps 的 separator 部件 background 覆盖槽。 |
| `--xh-steps-separator-min-length` | `separator` | `block-size`<br>`min-inline-size` | `default`<br>`orientation=vertical` | `--xh-space-4` | steps 的 separator 部件 block-size、min-inline-size 覆盖槽。 |
| `--xh-steps-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | steps 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-steps-separator-thickness` | `separator` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-stroke-thick` | steps 的 separator 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-steps-title-fg` | `title` | `color` | `default` | `--xh-fg-muted` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-active` | `title` | `color` | `is([data-state='current'], [data-state='completed'])`<br>`state=completed`<br>`state=current` | `--xh-fg-default` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-error` | `title` | `color` | `state=error` | `--xh-fg-danger` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-warning` | `title` | `color` | `state=warning` | `--xh-fg-warning` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-font-size` | `title` | `font-size` | `default` | `--xh-_steps-title-font-size` | steps 的 title 部件 font-size 覆盖槽。 |
| `--xh-steps-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` | steps 的 title 部件 font-weight 覆盖槽。 |
| `--xh-steps-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle-hover` | steps 的 trigger 部件 background 覆盖槽。 |
| `--xh-steps-trigger-gap` | `trigger` | `column-gap` | `default` | `--xh-control-gap-md` | steps 的 trigger 部件 column-gap 覆盖槽。 |
| `--xh-steps-trigger-p` | `separator`<br>`trigger` | `margin-inline-start`<br>`padding-block`<br>`padding-inline` | `default`<br>`orientation=vertical` | `--xh-control-px-sm`<br>`--xh-space-1` | steps 的 separator、trigger 部件 margin-inline-start、padding-block、padding-inline 覆盖槽。 |
| `--xh-steps-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | steps 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` · `box-shadow` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[表单](./form)配合做分步表单；每步的内容放进 `content` 部件。

## 最佳实践

- 步数控制在三到五步，多了就把相邻两步合并。
- 每步的标题写用户要做的事，不写"第一步"。

## 反模式

- 步数会变：用户刚看到"共 3 步"，走到一半变成 5 步。
- 用它表达进度百分比：那是[进度条](./progress)。
