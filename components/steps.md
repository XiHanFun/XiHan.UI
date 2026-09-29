来源：https://ui.docs.xihanfun.com/components/steps

# Steps 步骤条

用于展示多步骤流程的进度。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/steps" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/steps.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/steps" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/steps" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/steps.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

展示流程进度与当前步骤内容

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
  { title: "填写地址", description: "收货人与联系方式" },
  { title: "选择支付", description: "支付方式与优惠" },
  { title: "确认订单", description: "核对金额" },
];
</script>

<template>
  <XhStepsRoot v-slot="{ value }" :count="steps.length" :default-value="1">
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ value > i ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">填写收货人与联系方式。</XhStepsContent>
    <XhStepsContent :value="1">选择支付方式并确认优惠信息。</XhStepsContent>
    <XhStepsContent :value="2">核对订单金额后提交。</XhStepsContent>
    <XhStepsContent :value="steps.length">订单已提交。</XhStepsContent>
  </XhStepsRoot>
</template>
```

```html
<xh-steps id="steps-basic" count="3" default-value="1">
  <div data-xh-part="root">
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

    <div data-xh-part="content" value="0">填写收货人与联系方式。</div>
    <div data-xh-part="content" value="1">选择支付方式并确认优惠信息。</div>
    <div data-xh-part="content" value="2">核对订单金额后提交。</div>
    <div data-xh-part="content" value="3">订单已提交。</div>
  </div>
</xh-steps>

<script type="module">
  const host = document.getElementById("steps-basic");
  const indicators = [...host.querySelectorAll('[data-xh-part="indicator"]')];

  function paint(current) {
    indicators.forEach((indicator, index) => {
      indicator.textContent = current > index ? "" : String(index + 1);
    });
  }

  host.addEventListener("value-change", (event) => paint(event.detail.value));
  paint(1);
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="steps"`：**`root`** · **`list`** · **`item`** · **`trigger`** · `indicator` · `title` · `description` · `separator` · `content`

## 示例

### 线性模式

只能返回已完成的步骤

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
  { title: "实名认证", description: "身份信息已验证" },
  { title: "绑定银行卡", description: "填写本人银行卡" },
  { title: "签署协议", description: "完成后解锁" },
];
</script>

<template>
  <XhStepsRoot v-slot="{ value }" :count="steps.length" :default-value="1" linear>
    <XhStepsList>
      <XhStepsItem v-for="(step, i) in steps" :key="step.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ value > i ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ step.title }}</XhStepsTitle>
          <XhStepsDescription>{{ step.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">核对身份信息。</XhStepsContent>
    <XhStepsContent :value="1">填写本人银行卡。</XhStepsContent>
    <XhStepsContent :value="2">阅读并签署服务协议。</XhStepsContent>
    <XhStepsContent :value="steps.length">认证已完成。</XhStepsContent>
  </XhStepsRoot>
</template>
```

```html
<xh-steps id="steps-linear" count="3" default-value="1" linear>
  <div data-xh-part="root">
    <div data-xh-part="list">
      <div data-xh-part="item" value="0">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">实名认证</span>
          <span data-xh-part="description">身份信息已验证</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="1">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">2</span>
          <span data-xh-part="title">绑定银行卡</span>
          <span data-xh-part="description">填写本人银行卡</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="2">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">3</span>
          <span data-xh-part="title">签署协议</span>
          <span data-xh-part="description">完成后解锁</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
    </div>

    <div data-xh-part="content" value="0">核对身份信息。</div>
    <div data-xh-part="content" value="1">填写本人银行卡。</div>
    <div data-xh-part="content" value="2">阅读并签署服务协议。</div>
    <div data-xh-part="content" value="3">认证已完成。</div>
  </div>
</xh-steps>

<script type="module">
  const host = document.getElementById("steps-linear");
  const indicators = [...host.querySelectorAll('[data-xh-part="indicator"]')];

  host.addEventListener("value-change", (event) => {
    indicators.forEach((indicator, index) => {
      indicator.textContent = event.detail.value > index ? "" : String(index + 1);
    });
  });
</script>
```

### 垂直布局

展示纵向流程与步骤内容

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
    v-slot="{ value }"
    :count="steps.length"
    :default-value="1"
    orientation="vertical"
  >
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ value > i ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">查看构建产物。</XhStepsContent>
    <XhStepsContent :value="1">检查测试报告。</XhStepsContent>
    <XhStepsContent :value="2">确认发布记录。</XhStepsContent>
    <XhStepsContent :value="steps.length">流水线已完成。</XhStepsContent>
  </XhStepsRoot>
</template>
```

```html
<xh-steps id="steps-vertical" count="3" default-value="1" orientation="vertical">
  <div data-xh-part="root">
    <div data-xh-part="list">
      <div data-xh-part="item" value="0">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
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

    <div data-xh-part="content" value="0">查看构建产物。</div>
    <div data-xh-part="content" value="1">检查测试报告。</div>
    <div data-xh-part="content" value="2">确认发布记录。</div>
    <div data-xh-part="content" value="3">流水线已完成。</div>
  </div>
</xh-steps>

<script type="module">
  const host = document.getElementById("steps-vertical");
  const indicators = [...host.querySelectorAll('[data-xh-part="indicator"]')];

  host.addEventListener("value-change", (event) => {
    indicators.forEach((indicator, index) => {
      indicator.textContent = event.detail.value > index ? "" : String(index + 1);
    });
  });
</script>
```

### 出错的步骤

用 tones 为被驳回的步骤标注 danger 语气，状态照常按步序计算

```vue
<script setup lang="ts">
import { XIcon } from "@xihan-ui/icons";
import {
  XhIcon,
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
  { title: "提交材料", description: "已通过" },
  { title: "资质审核", description: "材料不齐，被打回" },
  { title: "签署合同", description: "等待中" },
];

const errorAt = 1;
</script>

<template>
  <XhStepsRoot v-slot="{ value }" :count="steps.length" :default-value="1" :tones="{ [errorAt]: 'danger' }">
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>
            <XhIcon v-if="i === errorAt" :icon="XIcon" />
            <template v-else>{{ value > i ? "" : i + 1 }}</template>
          </XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>

    <XhStepsContent :value="0">材料已提交。</XhStepsContent>
    <XhStepsContent :value="1">请补充营业执照副本。</XhStepsContent>
    <XhStepsContent :value="2">等待签署合同。</XhStepsContent>
    <XhStepsContent :value="steps.length">流程已完成。</XhStepsContent>
  </XhStepsRoot>
</template>
```

```html
<xh-steps id="steps-error" count="3" default-value="1">
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
      <div data-xh-part="item" value="1">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">
            <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </span>
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

    <div data-xh-part="content" value="0">材料已提交。</div>
    <div data-xh-part="content" value="1">请补充营业执照副本。</div>
    <div data-xh-part="content" value="2">等待签署合同。</div>
    <div data-xh-part="content" value="3">流程已完成。</div>
  </div>
</xh-steps>

<script type="module">
  const host = document.getElementById("steps-error");
  const errorAt = 1;
  const indicators = [...host.querySelectorAll('[data-xh-part="indicator"]')];

  host.tones = { [errorAt]: "danger" };
  host.addEventListener("value-change", (event) => {
    indicators.forEach((indicator, index) => {
      if (index !== errorAt) {
        indicator.textContent = event.detail.value > index ? "" : String(index + 1);
      }
    });
  });
</script>
```

### 只读展示

只呈现进度：步骤不可点、不可聚焦，也不置灰

```vue
<script setup lang="ts">
import {
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
  { title: "已下单", description: "09-26 10:12" },
  { title: "已发货", description: "09-26 16:40" },
  { title: "运输中", description: "预计明日送达" },
  { title: "已签收", description: "" },
];
</script>

<template>
  <XhStepsRoot :count="steps.length" :value="2" read-only :translations="{ list: '物流进度' }">
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ i < 2 ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription v-if="s.description">{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>
  </XhStepsRoot>
</template>
```

```html
<xh-steps id="steps-read-only" count="4" value="2" read-only>
  <div data-xh-part="root">
    <div data-xh-part="list">
      <div data-xh-part="item" value="0">
        <div data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">已下单</span>
          <span data-xh-part="description">09-26 10:12</span>
        </div>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="1">
        <div data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">已发货</span>
          <span data-xh-part="description">09-26 16:40</span>
        </div>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="2">
        <div data-xh-part="trigger">
          <span data-xh-part="indicator">3</span>
          <span data-xh-part="title">运输中</span>
          <span data-xh-part="description">预计明日送达</span>
        </div>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="3">
        <div data-xh-part="trigger">
          <span data-xh-part="indicator">4</span>
          <span data-xh-part="title">已签收</span>
        </div>
        <div data-xh-part="separator"></div>
      </div>
    </div>
  </div>
</xh-steps>

<script type="module">
  // 列表的可及名是对象，只走 property
  document.getElementById("steps-read-only").translations = { list: "物流进度" };
</script>
```

### 点状形态

步数多或横向空间紧时，圆点收成不盛内容的小点，只标位置

```vue
<script setup lang="ts">
import {
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = ["提交申请", "资料初审", "现场核验", "复审公示", "发放证照"];
</script>

<template>
  <XhStepsRoot variant="dot" :count="steps.length" :default-value="2">
    <XhStepsList>
      <XhStepsItem v-for="(title, i) in steps" :key="title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator />
          <XhStepsTitle>{{ title }}</XhStepsTitle>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>
  </XhStepsRoot>
</template>
```

```html
<xh-steps variant="dot" count="5" default-value="2">
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
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">资料初审</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="2">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">现场核验</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="3">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">复审公示</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="4">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">发放证照</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
    </div>
  </div>
</xh-steps>
```

### 当前步进度

用 percent 在当前步的圆点外画一圈进度环，报出这一步自己完成了多少

```vue
<script setup lang="ts">
import {
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
  { title: "选择文件", description: "共 12 个" },
  { title: "上传", description: "已传 7 个" },
  { title: "校验", description: "等待中" },
];
</script>

<template>
  <XhStepsRoot v-slot="{ value }" :count="steps.length" :default-value="1" :percent="60">
    <XhStepsList>
      <XhStepsItem v-for="(s, i) in steps" :key="s.title" :value="i">
        <XhStepsTrigger>
          <XhStepsIndicator>{{ value > i ? "" : i + 1 }}</XhStepsIndicator>
          <XhStepsTitle>{{ s.title }}</XhStepsTitle>
          <XhStepsDescription>{{ s.description }}</XhStepsDescription>
        </XhStepsTrigger>
        <XhStepsSeparator />
      </XhStepsItem>
    </XhStepsList>
  </XhStepsRoot>
</template>
```

```html
<xh-steps id="steps-progress" count="3" default-value="1" percent="60">
  <div data-xh-part="root">
    <div data-xh-part="list">
      <div data-xh-part="item" value="0">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">选择文件</span>
          <span data-xh-part="description">共 12 个</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="1">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">2</span>
          <span data-xh-part="title">上传</span>
          <span data-xh-part="description">已传 7 个</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="2">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">3</span>
          <span data-xh-part="title">校验</span>
          <span data-xh-part="description">等待中</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
    </div>
  </div>
</xh-steps>

<script type="module">
  const host = document.getElementById("steps-progress");
  const indicators = [...host.querySelectorAll('[data-xh-part="indicator"]')];

  host.addEventListener("value-change", (event) => {
    indicators.forEach((indicator, index) => {
      indicator.textContent = event.detail.value > index ? "" : String(index + 1);
    });
  });
</script>
```

## 设计指引

### 何时使用

- 多步表单、开通流程或安装向导。
- 流程步骤固定且顺序明确。

### 何时不用

- 可自由切换的并列内容，使用[标签页](./tabs)。
- 已发生的事件记录，使用[时间线](./timeline)。

### 特性

- 支持水平与垂直布局。
- 已完成、当前、未完成三种状态清晰区分；被退回或需要留意的步骤用 `tones`（或 collection 的 `tone`）标记语气，与状态互不相关。
- 当前步骤使用实心强调标记，已完成步骤使用中性面加品牌对号。
- `variant="dot"` 把序号圆点收成不盛内容的小圆点，只标位置，适合步数多或横向空间紧的流程：没走到的空心圈、走过的实心点、当前步实心点外加一圈环，三态靠形状区分。圆点直径走空间尺（sm / md / lg = 8 / 10 / 12px），不随密度换档；点状的 `indicator` 留空，不放序号与图标。
- `percent`（0–100）报出当前这一步自己的完成比例：当前步的序号圆点外离一道缝画一圈进度环，从 12 点顺时针走（不随书写方向镜像），已完成那段取强调色、其余取连接线的底色；环落在触发器的内衬里，不挤版面；比例变化时弧平滑走到新值，首帧直接落位。读屏：可操作时比例作为当前步触发器的描述读出（tab 的子节点对读屏是纯展示的，圆点里放不了进度条）；只读展示下当前步的圆点是一个 `progressbar`。文案由 `translations.progressLabel` / `progressValueText` 改。进度环只画在序号圆点上，点状形态与非有限数会报 `steps.option-ignored` 并按没给处理。
- `linear` 限制用户跳到尚未完成的步骤。
- 方向键移动焦点，Enter 或空格切换步骤。
- `readOnly` 是纯展示形态：只呈现进度，步骤不可点、不可聚焦、不发事件，标题与说明不置灰；语义换成有序列表（`list` / `listitem`，当前步 `aria-current="step"`），`trigger` 只负责排版。与 `disabled` 不同，`disabled` 是「本可操作、此刻不行」，会置灰。Vue / React 的 `trigger` 在只读下渲染为 `<div>`；Web Components 由作者把 `trigger` 写成 `<div>`。

### 组合

- 与[表单](./form)组合实现分步填写。
- 使用 `content` 展示当前步骤内容。

### 最佳实践

- 步数建议控制在三到五步；步数多或一行放不下序号圆点时改用 `variant="dot"`。
- 标题描述任务，不使用“第一步”之类的编号文本。
- 点状形态里放不下图标：被退回的步骤除了 `tones` 标语气，还要在说明里写明原因，出错不只靠颜色。

### 反模式

- 不要在流程进行中改变步骤总数。
- 不要用步骤条表示连续百分比进度；`percent` 只说当前这一步走了多少，整段流程的连续进度用[进度条](./progress)。
- 不要用 `disabled` 表达「只展示进度」：它会把每一步置灰，读屏也会念成一排不可用的按钮，改用 `readOnly`。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-steps>` |
| Vue 组件 | `XhStepsContent` `XhStepsDescription` `XhStepsIndicator` `XhStepsItem` `XhStepsList` `XhStepsRoot` `XhStepsSeparator` `XhStepsTitle` `XhStepsTrigger` |
| 组合式函数 | `useSteps` |
| 状态机 | `stepsMachine` |
| 皮肤 | `@xihan-ui/styles/steps.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 当前步序（0 起）。提供即受控：内部不再自行修改，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0。 |
| `collection` | `StepNode[]` |  | 步骤数据，标题、说明、状态与禁用的事实源。提供后 count 未提供时取它的长度。 未提供时回到文本与状态都写在部件上的方式。 |
| `statuses` | `Record<number, StepStatus>` |  | 按下标覆盖单步状态，优先于 collection 与步序计算出的档位。 |
| `tones` | `Record<number, Tone>` |  | 按下标给单步标记语气，优先于 collection；被驳回的步写 danger、需要留意的步写 warning。 写为 item 的 data-tone，该步的标记、标题与连接线都改用这族颜色。 |
| `count` | `number` |  | 总步数，是步序的上界与读屏「第 k 步，共 n 步」的分母。 未提供时按 0 处理：此时 root 带 data-empty，步序被固定在 0。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `linear` | `boolean` |  | 线性模式：只能回到已走过的步。未解锁（index &gt; step）的 trigger 一律禁用。 只拦截跳转，goToNextStep 逐步前进照常可用。 |
| `disabled` | `boolean` |  | 整组不可交互：trigger 全部退出 Tab 序列，指针与键盘都不响应。 |
| `readOnly` | `boolean` |  | 只读展示：步骤只呈现进度，不可点、不可聚焦、不发事件，也不置灰。 语义从 tablist 换成有序列表（list / listitem，当前步 aria-current="step"），trigger 渲染为普通容器、只排版。 步序仍由 value / setValue 驱动。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft / ArrowRight 的前后语义。 |
| `translations` | `Partial<StepsTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `variant` | `StepsVariant` |  | 标记形态，默认 number。dot 把序号圆点收成不盛内容的小圆点：走过的实心、当前步实心外加一圈环、 没走到的空心；indicator 留空，不放序号与图标。 |
| `percent` | `number` |  | 当前这一步自己的完成比例（0–100），越界夹回。当前步的序号圆点外画一圈进度环； 可操作时比例作为触发器的描述读出，只读展示下圆点是一个 progressbar。 只画在序号圆点上：点状形态画不下进度环，给了会报 steps.option-ignored 并按没给处理；非有限数同样报错并按没给处理。 |
| `onValueChange` | `(details: StepsValueChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |

### StepNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` |  | 标题文本。 |
| `description` | `string` |  | 说明文本。 |
| `status` | `StepStatus` |  | 覆盖该步的状态；未提供时由步序计算。 |
| `tone` | `Tone` |  | 该步的语气：被驳回的写 danger、需要留意的写 warning；未提供时跟随整组的 tone。 |
| `disabled` | `boolean` |  | 该步不可点击。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `StepsValueChangeDetails` | 步序变化；detail 为 `{ value: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhStepsRoot` | `default` | `StepsRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhStepsContent` | `value` | `number \| string` | 是 |  |
| `XhStepsItem` | `value` | `number \| string` | 是 | 步骤下标，兼收字符串以支持模板属性字面量。 |
| `XhStepsItem` | `disabled` | `boolean` |  |  |
| `XhStepsRoot` | `children` | `SlotChildren<StepsRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | s.status |
| `trigger` | s.status |
| `indicator` | s.status |
| `title` | getItemState(item).status |
| `description` | getItemState(item).status |
| `separator` | getItemState(item).status |
| `content` | getItemState(item).status |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `STEP.PREV` · `STEP.NEXT` · `TRIGGER.FOCUS` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number` | 当前步序，恒在 [0, count] 内：count 减小后停在越界步也能读到可用的值。 |
| `count` | `number` |  |
| `collection` | `readonly StepNodeMeta[]` | 由 collection 推导的步骤元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `complete` | `boolean` | 全部完成（value 到达 count）。此时没有任何一步是 current，作者据此渲染完成页。 |
| `focusedStep` | `number \| null` | 焦点在组外时为 null。 |
| `readOnly` | `boolean` | 只读展示：适配器据此把 trigger 渲染为普通容器而不是按钮。 |
| `getItemState` | `(props: StepsItemProps) => StepsItemState` |  |
| `setValue` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count]。 不检查 linear：linear 只拦截界面上的跳转，不拦截作者的命令式调用。 |
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
| `getContentProps` | `(props: StepsItemProps) => T['element']` | 面板按 index 与当前步配对；未命中的常驻并带 hidden。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个可停留 trigger（禁用与 linear 未解锁的跳过，尽头不回绕）；步序不变 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个可停留 trigger；步序不变 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, 未禁用且已解锁 | 把当前步切到焦点所在的那一步 |
| `Enter` / `Space` | held in trigger, 未禁用且已解锁、组未禁用 | 按住期间该 trigger 投影 data-pressed，与指针 :active 同一副按压面（行与圆点一起换面）；抬起或失焦撤下，按住途中整组转入禁用也撤下。切步与按压互相独立 |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-label` | translations?.list |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'list' |
| `item` | `aria-current` | 'step' \| undefined |
| `item` | `role` | 'listitem' \| undefined |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-current` | 'step' \| undefined |
| `trigger` | `aria-describedby` | `indicator` 部件的 id \| undefined |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-posinset` | item.index + 1 \| undefined |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `aria-setsize` | normalizeStepCount(prop('count') ?? (collection.lengt… \| undefined |
| `trigger` | `role` | 'tab' |
| `indicator` | `aria-hidden` | 'true' |
| `indicator` | `aria-label` | translations?.progressLabel |
| `indicator` | `aria-valuemax` | '100' |
| `indicator` | `aria-valuemin` | '0' |
| `indicator` | `aria-valuenow` | String(percent) |
| `indicator` | `aria-valuetext` | progressValueText(Math.round(percent)) |
| `indicator` | `role` | 'progressbar' |
| `separator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | undefined \| `trigger` 部件的 id |
| `content` | `role` | undefined \| 'tabpanel' |

## 样式参考

### 皮肤

`@xihan-ui/styles/steps.css` 使用 `[data-scope="steps"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `list` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-orientation` | props.orientation |
| `item` | `data-state` | s.status |
| `item` | `data-tone` | s.tone |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-readonly` | '' |
| `trigger` | `data-state` | s.status |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'row' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `indicator` | `data-instant` | ''（条件成立时才出现） |
| `indicator` | `data-progress` | ''（条件成立时才出现） |
| `indicator` | `data-state` | s.status |
| `indicator` | `data-variant` | props.variant |
| `title` | `data-state` | getItemState(item).status |
| `description` | `data-state` | getItemState(item).status |
| `separator` | `data-orientation` | props.orientation |
| `separator` | `data-state` | getItemState(item).status |
| `content` | `data-state` | getItemState(item).status |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-steps-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | steps 的 content 部件 color 覆盖槽。 |
| `--xh-steps-content-min-inline-size` | `content`<br>`root` | `flex` | `orientation=vertical` | `--xh-measure-prose` | steps 的 content、root 部件 flex 覆盖槽。 |
| `--xh-steps-content-py` | `content` | `padding-block` | `default` | `--xh-stack-gap-md` | steps 的 content 部件 padding-block 覆盖槽。 |
| `--xh-steps-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | steps 的 description 部件 color 覆盖槽。 |
| `--xh-steps-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | steps 的 description 部件 font-size 覆盖槽。 |
| `--xh-steps-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | steps 的 root 部件 gap 覆盖槽。 |
| `--xh-steps-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | steps 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-steps-indicator-bg` | `indicator` | `background` | `default`<br>`variant=dot` | `--xh-bg-subtle`<br>`transparent` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-completed` | `indicator`<br>`trigger` | `background`<br>`border-color` | `not([data-state='incomplete'])`<br>`state=completed`<br>`state=incomplete`<br>`variant=dot` | `--xh-_steps-accent-mark`<br>`--xh-bg-subtle` | steps 的 indicator、trigger 部件 background、border-color 覆盖槽。 |
| `--xh-steps-indicator-bg-completed-hover` | `indicator`<br>`trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`not([data-variant='dot'])`<br>`readonly`<br>`state=completed`<br>`variant=dot` | `--xh-_steps-host-bg-hover` | steps 的 indicator、trigger 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-current` | `indicator`<br>`trigger` | `background`<br>`border-color` | `not([data-state='incomplete'])`<br>`state=current`<br>`state=incomplete`<br>`variant=dot` | `--xh-_steps-accent` | steps 的 indicator、trigger 部件 background、border-color 覆盖槽。 |
| `--xh-steps-indicator-bg-current-pressed` | `indicator`<br>`trigger` | `background`<br>`border-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled], [data-readonly])`<br>`not([data-state='incomplete'])`<br>`not([data-variant='dot'])`<br>`pressed`<br>`readonly`<br>`state=current`<br>`state=incomplete`<br>`variant=dot` | `--xh-_tone-active` | steps 的 indicator、trigger 部件 background、border-color 覆盖槽。 |
| `--xh-steps-indicator-bg-disabled` | `indicator`<br>`item`<br>`trigger` | `background`<br>`border-color` | `disabled`<br>`not([data-state='incomplete'])`<br>`state=incomplete`<br>`variant=dot` | `--xh-bg-muted`<br>`--xh-fg-disabled` | steps 的 indicator、item、trigger 部件 background、border-color 覆盖槽。 |
| `--xh-steps-indicator-bg-hover` | `indicator`<br>`trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly`<br>`state=incomplete` | `--xh-_steps-host-bg-hover` | steps 的 indicator、trigger 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-pressed` | `indicator`<br>`trigger` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`is([data-state='incomplete'], [data-state='completed']:not([data-variant='dot'])`<br>`not([data-disabled], [data-readonly])`<br>`pressed`<br>`readonly`<br>`state=completed`<br>`state=incomplete`<br>`variant=dot` | `--xh-_steps-host-bg-pressed` | steps 的 indicator、trigger 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-toned` | `indicator`<br>`item` | `background` | `state=incomplete`<br>`tone` | `--xh-_tone-subtle` | steps 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-steps-indicator-border` | `indicator` | `border`<br>`border-color` | `default`<br>`variant=dot` | `--xh-fg-muted`<br>`transparent` | steps 的 indicator 部件 border、border-color 覆盖槽。 |
| `--xh-steps-indicator-border-completed` | `indicator` | `border-color` | `state=completed` | `transparent` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-current` | `indicator` | `border-color` | `state=current` | `--xh-_steps-accent` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-disabled` | `indicator`<br>`item` | `border-color` | `disabled`<br>`variant=dot` | `--xh-border-default`<br>`--xh-fg-disabled` | steps 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-toned` | `indicator`<br>`item` | `border-color` | `state=incomplete`<br>`tone` | `--xh-_steps-accent` | steps 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-completed` | `indicator` | `color` | `state=completed` | `--xh-_steps-accent-mark` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-current` | `indicator` | `color` | `state=current` | `--xh-_steps-on-accent` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-disabled` | `indicator`<br>`item` | `color` | `disabled` | `--xh-fg-disabled` | steps 的 indicator、item 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-hover` | `indicator`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly`<br>`state=incomplete` | `--xh-fg-default` | steps 的 indicator、trigger 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-toned` | `indicator`<br>`item` | `color` | `state=incomplete`<br>`tone` | `--xh-_steps-accent-text` | steps 的 indicator、item 部件 color 覆盖槽。 |
| `--xh-steps-indicator-font-size` | `indicator` | `font-size` | `default` | `--xh-_steps-caption-font-size` | steps 的 indicator 部件 font-size 覆盖槽。 |
| `--xh-steps-indicator-mark-size` | `indicator` | `--xh-icon-size` | `default` | `--xh-control-indicator-size` | steps 的 indicator 部件 --xh-icon-size 覆盖槽。 |
| `--xh-steps-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-circle` | steps 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-steps-indicator-ring-bg` | `indicator` | `background` | `default` | `--xh-_steps-accent` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-ring-bg-disabled` | `indicator`<br>`item` | `background` | `disabled` | `--xh-fg-disabled` | steps 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-steps-indicator-ring-track` | `indicator` | `background` | `progress` | `--xh-border-default` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-shadow` | `indicator` | `box-shadow` | `state=current` | `--xh-_steps-highlight` | steps 的 indicator 部件 box-shadow 覆盖槽。 |
| `--xh-steps-indicator-size` | `indicator`<br>`separator` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-_steps-indicator-size` | steps 的 indicator、separator 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-steps-item-gap` | `item` | `gap` | `default` | `--xh-space-2` | steps 的 item 部件 gap 覆盖槽。 |
| `--xh-steps-item-min-inline-size` | `item` | `min-inline-size` | `not(:last-child)`<br>`orientation=horizontal` | `--xh-space-0` | steps 的 item 部件 min-inline-size 覆盖槽。 |
| `--xh-steps-list-gap` | `list` | `gap` | `default` | `--xh-space-0` | steps 的 list 部件 gap 覆盖槽。 |
| `--xh-steps-separator-bg` | `separator` | `background` | `default` | `--xh-border-default` | steps 的 separator 部件 background 覆盖槽。 |
| `--xh-steps-separator-bg-completed` | `separator` | `background` | `default` | `--xh-_steps-accent` | steps 的 separator 部件 background 覆盖槽。 |
| `--xh-steps-separator-min-length` | `separator` | `block-size`<br>`min-inline-size` | `default`<br>`orientation=vertical` | `--xh-space-4`<br>`--xh-space-7` | steps 的 separator 部件 block-size、min-inline-size 覆盖槽。 |
| `--xh-steps-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | steps 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-steps-separator-thickness` | `separator` | `block-size`<br>`inline-size`<br>`margin-inline-start`<br>`min-inline-size` | `default`<br>`orientation=vertical` | `--xh-stroke-thick` | steps 的 separator 部件 block-size、inline-size、margin-inline-start、min-inline-size 覆盖槽。 |
| `--xh-steps-title-fg` | `title` | `color` | `default` | `--xh-fg-muted` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-active` | `title` | `color` | `is([data-state='current'], [data-state='completed'])`<br>`state=completed`<br>`state=current` | `--xh-_steps-accent-text` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-toned` | `item`<br>`title` | `color` | `tone` | `--xh-_steps-accent-text` | steps 的 item、title 部件 color 覆盖槽。 |
| `--xh-steps-title-font-size` | `title` | `font-size` | `default` | `--xh-_steps-title-font-size` | steps 的 title 部件 font-size 覆盖槽。 |
| `--xh-steps-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` | steps 的 title 部件 font-weight 覆盖槽。 |
| `--xh-steps-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | steps 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-steps-trigger-bg-pressed` | `trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | steps 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-steps-trigger-gap` | `trigger` | `column-gap` | `default` | `--xh-control-gap-md` | steps 的 trigger 部件 column-gap 覆盖槽。 |
| `--xh-steps-trigger-p` | `separator`<br>`trigger` | `margin-inline-start`<br>`padding-block`<br>`padding-inline` | `default`<br>`orientation=vertical`<br>`readonly`<br>`xh-action-profile=row` | `--xh-control-px-sm`<br>`--xh-space-1` | steps 的 separator、trigger 部件 margin-inline-start、padding-block、padding-inline 覆盖槽。 |
| `--xh-steps-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | steps 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 指示与换位 · 出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` · `border-color` · `box-shadow` · `clip-path` · `color` · `opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走。
