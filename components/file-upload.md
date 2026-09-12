来源：https://ui.docs.xihanfun.com/components/file-upload

# FileUpload `文件上传`

选择文件、拖放文件，并把已选与已传的文件列出来。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/file-upload" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/file-upload.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/file-upload" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/file-upload" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/file-upload.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

投放区自己就是一个大按钮，隐藏输入是必备部件，缺了它选不了文件

```vue
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot v-slot="{ acceptedFiles }">
      <XhFileUploadLabel>附件</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>把文件拖到这里</span>
        <span>或者用下面的按钮挑一个</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadList>
        <!-- key 取 File 本身：同名同大小是两份不同的文件，拿文件名当 key 会撞 -->
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemPreview />
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadList>
    </XhFileUploadRoot>
  </div>
</template>
```

```html
<xh-file-upload id="file-upload-basic">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">附件</label>
    <div data-xh-part="dropzone">
      <span>把文件拖到这里</span>
      <span>或者用下面的按钮挑一个</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择文件</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
  </div>
</xh-file-upload>

<script type="module">
  const upload = document.getElementById("file-upload-basic");
  const group = upload.querySelector('[data-xh-part="list"]');

  // 条目节点由作者渲染，元素随后按文档序把文件名、大小与删除按钮接上去
  upload.addEventListener("files-change", (event) => {
    group.replaceChildren(
      ...event.detail.files.map(() => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-preview"></span>' +
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          '<button data-xh-part="item-delete-trigger"></button>';
        return item;
      })
    );
  });
</script>
```

## 示例

### 限制与拒收

accept / maxFiles / maxFileSize 越界的当场被拒，file-reject 逐个报出理由

```vue
<script setup lang="ts">
import {
  XhFileUploadClearTrigger,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const rejected = ref("");

const reasonText: Record<string, string> = {
  "type": "类型不符",
  "size-too-large": "太大",
  "size-too-small": "太小",
  "too-many-files": "放不下",
};

// 一个文件可能同时命中多条理由
function onReject(details: { files: { file: File; reasons: string[] }[] }) {
  rejected.value = details.files
    .map(
      it => `${it.file.name}（${it.reasons.map(r => reasonText[r] ?? r).join("、")}）`,
    )
    .join("；");
}

// 单条删除按钮的可及名字带上文件名，读屏才分得出删的是哪一条
const translations = {
  deleteItem: (file: File) => `删除 ${file.name}`,
  clearTrigger: "清空全部",
};
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhFileUploadRoot
      v-slot="{ acceptedFiles }"
      accept="image/*"
      :max-files="3"
      :max-file-size="512 * 1024"
      :translations="translations"
      @file-reject="onReject"
    >
      <XhFileUploadLabel>图片</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>只收图片，最多 3 张</span>
        <span>单张不超过 512 KB</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择图片</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadList>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemPreview />
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadList>
      <!-- 列表为空时清空按钮照常在位可聚焦，只打 data-empty 由皮肤压淡 -->
      <XhFileUploadClearTrigger>清空</XhFileUploadClearTrigger>
    </XhFileUploadRoot>
    <span v-if="rejected">被拒：{{ rejected }}</span>
  </div>
</template>
```

```html
<xh-file-upload
  id="file-upload-limits"
  accept="image/*"
  max-files="3"
  max-file-size="524288"
>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">图片</label>
    <div data-xh-part="dropzone">
      <span>只收图片，最多 3 张</span>
      <span>单张不超过 512 KB</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择图片</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
    <!-- 列表为空时清空按钮照常在位可聚焦，只打 data-empty 由皮肤压淡 -->
    <button data-xh-part="clear-trigger">清空</button>
  </div>
</xh-file-upload>

<span id="file-upload-limits-rejected"></span>

<script type="module">
  const upload = document.getElementById("file-upload-limits");
  const group = upload.querySelector('[data-xh-part="list"]');
  const rejected = document.getElementById("file-upload-limits-rejected");

  // 单条删除按钮的可及名字带上文件名，读屏才分得出删的是哪一条
  upload.translations = {
    deleteFile: (file) => `删除 ${file.name}`,
    clearTrigger: "清空全部",
  };

  const reasonText = {
    "type": "类型不符",
    "size-too-large": "太大",
    "size-too-small": "太小",
    "too-many-files": "放不下",
  };

  // 一个文件可能同时命中多条理由
  upload.addEventListener("file-reject", (event) => {
    rejected.textContent = `被拒：${event.detail.files
      .map(
        (it) =>
          `${it.file.name}（${it.reasons
            .map((reason) => reasonText[reason] ?? reason)
            .join("、")}）`
      )
      .join("；")}`;
  });

  // 条目节点由作者渲染，元素随后按文档序接上去
  upload.addEventListener("files-change", (event) => {
    group.replaceChildren(
      ...event.detail.files.map(() => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-preview"></span>' +
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          '<button data-xh-part="item-delete-trigger"></button>';
        return item;
      })
    );
  });
</script>
```

### 受控

传了 files 就由宿主说了算，组件自己不再落值，只发 files-change 报告意图

```vue
<script setup lang="ts">
import {
  XhButton,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const files = ref<File[]>([]);

// 变化之后的完整列表，不是增量
function onFilesChange(details: { files: File[] }) {
  files.value = details.files;
}
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhFileUploadRoot
      v-slot="{ acceptedFiles }"
      :files="files"
      :max-files="5"
      @files-change="onFilesChange"
    >
      <XhFileUploadLabel>受控列表</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>选进来的文件由外部数组保管</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadList>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadList>
    </XhFileUploadRoot>

    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton size="sm" :disabled="!files.length" @click="files = []">
        从外面清空
      </XhButton>
      <span>宿主持有 {{ files.length }} 个文件</span>
    </div>
  </div>
</template>
```

```html
<xh-file-upload id="file-upload-controlled" max-files="5">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">受控列表</label>
    <div data-xh-part="dropzone">
      <span>选进来的文件由外部数组保管</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择文件</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
  </div>
</xh-file-upload>

<div style="display: flex; align-items: center; gap: 12px">
  <xh-button size="sm" disabled>
    <button data-xh-part="root" id="file-upload-controlled-clear">
      从外面清空
    </button>
  </xh-button>
  <span id="file-upload-controlled-count">宿主持有 0 个文件</span>
</div>

<script type="module">
  const upload = document.getElementById("file-upload-controlled");
  const group = upload.querySelector('[data-xh-part="list"]');
  const clear = document.getElementById("file-upload-controlled-clear");
  const count = document.getElementById("file-upload-controlled-count");

  // 列表住在宿主这边，组件只读它
  upload.files = [];

  function render(files) {
    group.replaceChildren(
      ...files.map(() => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          '<button data-xh-part="item-delete-trigger"></button>';
        return item;
      })
    );
    count.textContent = `宿主持有 ${files.length} 个文件`;
    clear.closest("xh-button").disabled = files.length === 0;
  }

  // 变化之后的完整列表，不是增量
  upload.addEventListener("files-change", (event) => {
    upload.files = event.detail.files;
    render(event.detail.files);
  });

  clear.addEventListener("click", () => {
    upload.files = [];
    render([]);
  });
</script>
```

### 禁用

disabled 把投放区、触发器与隐藏输入一并关停，拖拽进来也不再收

```vue
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadLabel,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot disabled>
      <XhFileUploadLabel>附件</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>当前不接受上传</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
    </XhFileUploadRoot>
  </div>
</template>
```

```html
<xh-file-upload disabled>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">附件</label>
    <div data-xh-part="dropzone">
      <span>当前不接受上传</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择文件</button>
    </div>
    <input data-xh-part="hidden-input" />
  </div>
</xh-file-upload>
```

### 预置列表

defaultFiles 给出挂载时就在的那几份，之后列表照旧由组件自己保管，删除与清空都照常

```vue
<script setup lang="ts">
import {
  XhFileUploadClearTrigger,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";

// 预置项就是普通的 File，与用户挑进来的那些没有区别
const initialFiles = [
  new File(["甲方与乙方就本次合作达成如下条款……"], "合同正文.txt", { type: "text/plain" }),
  new File(["# 交付说明\n\n分三批交付。"], "交付说明.md", { type: "text/markdown" }),
];
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot v-slot="{ acceptedFiles }" :default-files="initialFiles" :max-files="4">
      <XhFileUploadLabel>随件资料</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>已经带了两份进来</span>
        <span>再拖几份也收，最多 4 份</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>继续添加</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadList>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemPreview />
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadList>
      <XhFileUploadClearTrigger>清空</XhFileUploadClearTrigger>
    </XhFileUploadRoot>
  </div>
</template>
```

```html
<div id="file-upload-default" style="width: 100%; max-width: 480px"></div>

<script type="module">
  // 预置项就是普通的 File，与用户挑进来的那些没有区别
  const initialFiles = [
    new File(["甲方与乙方就本次合作达成如下条款……"], "合同正文.txt", {
      type: "text/plain",
    }),
    new File(["# 交付说明\n\n分三批交付。"], "交付说明.md", {
      type: "text/markdown",
    }),
  ];

  // defaultFiles 是挂载那一刻的初值：元素一进文档就把机器建起来，
  // 所以先把元素造好、设完这份初值，再挂到页面上
  const upload = document.createElement("xh-file-upload");
  upload.setAttribute("max-files", "4");
  upload.innerHTML = `
    <div data-xh-part="root">
      <label data-xh-part="label">随件资料</label>
      <div data-xh-part="dropzone">
        <span>已经带了两份进来</span>
        <span>再拖几份也收，最多 4 份</span>
      </div>
      <div>
        <button data-xh-part="trigger">继续添加</button>
      </div>
      <input data-xh-part="hidden-input" />
      <div data-xh-part="list"></div>
      <button data-xh-part="clear-trigger">清空</button>
    </div>`;
  upload.defaultFiles = initialFiles;
  document.getElementById("file-upload-default").append(upload);

  const group = upload.querySelector('[data-xh-part="list"]');

  // 条目节点由作者按当前列表铺，文件名与大小由元素代填
  function render(files) {
    group.replaceChildren(
      ...files.map(() => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-preview"></span>' +
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          '<button data-xh-part="item-delete-trigger"></button>';
        return item;
      })
    );
  }

  upload.addEventListener("files-change", (event) => {
    render(event.detail.files);
  });

  render(upload.acceptedFiles);
</script>
```

### 选整个目录

directory 让隐藏输入改收目录，选中目录下的文件一次性全进来，数量上限要跟着放开

```vue
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";

const noLimit = Number.POSITIVE_INFINITY;
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot v-slot="{ acceptedFiles, empty }" directory :max-files="noLimit">
      <XhFileUploadLabel>整个目录</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>挑一个目录，里面的文件全收</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择目录</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <span v-if="!empty">共 {{ acceptedFiles.length }} 个文件</span>
      <XhFileUploadList style="max-block-size: 220px; overflow: auto">
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadList>
    </XhFileUploadRoot>
  </div>
</template>
```

```html
<xh-file-upload id="file-upload-directory" directory max-files="Infinity">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">整个目录</label>
    <div data-xh-part="dropzone">
      <span>挑一个目录，里面的文件全收</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择目录</button>
    </div>
    <input data-xh-part="hidden-input" />
    <span id="file-upload-directory-count"></span>
    <div
      data-xh-part="list"
      style="max-block-size: 220px; overflow: auto"
    ></div>
  </div>
</xh-file-upload>

<script type="module">
  const upload = document.getElementById("file-upload-directory");
  const group = upload.querySelector('[data-xh-part="list"]');
  const count = document.getElementById("file-upload-directory-count");

  // 条目节点由作者渲染，元素随后按文档序接上去
  upload.addEventListener("files-change", (event) => {
    const files = event.detail.files;
    count.textContent = files.length ? `共 ${files.length} 个文件` : "";
    group.replaceChildren(
      ...files.map(() => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          '<button data-xh-part="item-delete-trigger"></button>';
        return item;
      })
    );
  });
</script>
```

### 缩略图墙

item-preview 是个空方框，作者往里塞什么都行；塞进去的图会被裁成方格，一行摆几张由外层网格定

```vue
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount } from "vue";

const wall = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
};

const card = {
  "flexDirection": "column",
  "alignItems": "stretch",
  "--xh-file-upload-preview-size": "96px",
};

// 一个文件一条地址，取过就留着，卸载时统一交还
const urls = new Map<File, string>();

function previewUrl(file: File) {
  const cached = urls.get(file);
  if (cached) {
    return cached;
  }
  const url = URL.createObjectURL(file);
  urls.set(file, url);
  return url;
}

onBeforeUnmount(() => {
  urls.forEach(url => URL.revokeObjectURL(url));
  urls.clear();
});
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot v-slot="{ acceptedFiles }" accept="image/*" :max-files="6">
      <XhFileUploadLabel>相册</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>把图片拖进来，最多 6 张</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择图片</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadList :style="wall">
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file" :style="card">
          <XhFileUploadItemPreview>
            <img :src="previewUrl(file)" alt="">
          </XhFileUploadItemPreview>
          <XhFileUploadItemName />
          <XhFileUploadItemDeleteTrigger>移除</XhFileUploadItemDeleteTrigger>
        </XhFileUploadItem>
      </XhFileUploadList>
    </XhFileUploadRoot>
  </div>
</template>
```

```html
<xh-file-upload id="file-upload-wall" accept="image/*" max-files="6">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">相册</label>
    <div data-xh-part="dropzone">
      <span>把图片拖进来，最多 6 张</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择图片</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div
      data-xh-part="list"
      style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))"
    ></div>
  </div>
</xh-file-upload>

<script type="module">
  const upload = document.getElementById("file-upload-wall");
  const group = upload.querySelector('[data-xh-part="list"]');
  const card =
    "flex-direction: column; align-items: stretch; --xh-file-upload-preview-size: 96px";

  // 一批地址用完就交还，重铺时统一换成新的
  let urls = [];

  upload.addEventListener("files-change", (event) => {
    urls.forEach((url) => URL.revokeObjectURL(url));
    urls = event.detail.files.map((file) => URL.createObjectURL(file));
    group.replaceChildren(
      ...urls.map((url) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.style.cssText = card;
        item.innerHTML =
          `<span data-xh-part="item-preview"><img src="${url}" alt="" /></span>` +
          '<span data-xh-part="item-name"></span>' +
          '<button data-xh-part="item-delete-trigger">移除</button>';
        return item;
      })
    );
  });
</script>
```

### 宿主自定的准入

组件只管 accept 与大小数量这几条通用规则，别的规矩由宿主在受控列表里再筛一道：这里同名文件只留最先来的那份

```vue
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const files = ref<File[]>([]);
const dropped = ref("");
const lastAccepted = ref("");

// 组件报来的是变化之后的完整列表，宿主按自己的规矩决定最终留下哪些
function onFilesChange(details: { files: File[] }) {
  const seen = new Set<string>();
  const kept: File[] = [];
  const names: string[] = [];
  for (const file of details.files) {
    if (seen.has(file.name)) {
      names.push(file.name);
      continue;
    }
    seen.add(file.name);
    kept.push(file);
  }
  files.value = kept;
  dropped.value = names.join("、");
}

// 这一批组件收下了谁
function onFileAccept(details: { files: File[] }) {
  lastAccepted.value = details.files.map(file => file.name).join("、");
}
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhFileUploadRoot
      v-slot="{ acceptedFiles }"
      :files="files"
      :max-files="6"
      @files-change="onFilesChange"
      @file-accept="onFileAccept"
    >
      <XhFileUploadLabel>去重后的附件</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>同名文件只留最先来的那份</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadList>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadList>
    </XhFileUploadRoot>

    <span v-if="lastAccepted">这一批收下：{{ lastAccepted }}</span>
    <span v-if="dropped">同名挡下：{{ dropped }}</span>
  </div>
</template>
```

```html
<xh-file-upload id="file-upload-rule" max-files="6">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <label data-xh-part="label">去重后的附件</label>
    <div data-xh-part="dropzone">
      <span>同名文件只留最先来的那份</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择文件</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
  </div>
</xh-file-upload>

<span id="file-upload-rule-accepted"></span>
<span id="file-upload-rule-dropped"></span>

<script type="module">
  const upload = document.getElementById("file-upload-rule");
  const group = upload.querySelector('[data-xh-part="list"]');
  const accepted = document.getElementById("file-upload-rule-accepted");
  const dropped = document.getElementById("file-upload-rule-dropped");

  upload.files = [];

  function render(files) {
    group.replaceChildren(
      ...files.map(() => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          '<button data-xh-part="item-delete-trigger"></button>';
        return item;
      })
    );
  }

  // 组件报来的是变化之后的完整列表，宿主按自己的规矩决定最终留下哪些
  upload.addEventListener("files-change", (event) => {
    const seen = new Set();
    const kept = [];
    const names = [];
    for (const file of event.detail.files) {
      if (seen.has(file.name)) {
        names.push(file.name);
        continue;
      }
      seen.add(file.name);
      kept.push(file);
    }
    upload.files = kept;
    dropped.textContent = names.length ? `同名挡下：${names.join("、")}` : "";
    render(kept);
  });

  // 这一批组件收下了谁
  upload.addEventListener("file-accept", (event) => {
    accepted.textContent = `这一批收下：${event.detail.files
      .map((file) => file.name)
      .join("、")}`;
  });
</script>
```

### 上传生命周期

给一个 upload 实现组件就是上传器：收下即开传（auto-upload 可关成手动），进度、成败与返回地址都在每条的传输快照里，失败一键重试

```vue
<script setup lang="ts">
import type { FileUploadRequest, FileUploadResult } from "@xihan-ui/vue";
import {
  XhButton,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
  XhProgress,
} from "@xihan-ui/vue";

// 演示用的假传输：一秒走完，文件名带「坏」字的在半路失败；真实实现把 signal 接给请求库即可
function upload(request: FileUploadRequest): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const timer = setInterval(() => {
      if (request.signal.aborted) {
        clearInterval(timer);
        reject(new Error("aborted"));
        return;
      }
      progress += 20;
      request.onProgress(progress);
      if (progress >= 60 && request.file.name.includes("坏")) {
        clearInterval(timer);
        reject(new Error("网络中断"));
        return;
      }
      if (progress >= 100) {
        clearInterval(timer);
        resolve({ url: `https://cdn.example.com/${request.file.name}` });
      }
    }, 200);
    request.signal.addEventListener("abort", () => clearInterval(timer));
  });
}
</script>

<template>
  <XhFileUploadRoot
    v-slot="{ acceptedFiles, uploadOf, startUpload }"
    :max-files="Infinity"
    :upload="upload"
    style="max-inline-size: 420px"
  >
    <XhFileUploadLabel>附件</XhFileUploadLabel>
    <XhFileUploadDropzone>拖进来或点击选择，收下即开传</XhFileUploadDropzone>
    <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
    <XhFileUploadHiddenInput />
    <XhFileUploadList>
      <XhFileUploadItem v-for="file in acceptedFiles" :key="file.name" :file="file">
        <XhFileUploadItemName />
        <template v-if="uploadOf(file)">
          <XhProgress
            v-if="uploadOf(file)!.status === 'uploading'"
            :value="uploadOf(file)!.progress"
            style="flex: 1"
          />
          <span v-else-if="uploadOf(file)!.status === 'done'">
            已传到 {{ uploadOf(file)!.url }}
          </span>
          <template v-else-if="uploadOf(file)!.status === 'error'">
            <span style="color: var(--xh-fg-danger)">失败</span>
            <XhButton size="sm" variant="outline" @click="startUpload(file)">重试</XhButton>
          </template>
        </template>
        <XhFileUploadItemDeleteTrigger />
      </XhFileUploadItem>
    </XhFileUploadList>
  </XhFileUploadRoot>
  <p>试试选一个文件名带「坏」字的文件，看失败与重试。</p>
</template>
```

```html
<xh-file-upload id="file-upload-manual" max-files="9">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <label data-xh-part="label">附件</label>
    <div data-xh-part="dropzone">拖进来或点击选择，收下即开传</div>
    <button data-xh-part="trigger">选择文件</button>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
  </div>
</xh-file-upload>
<p>试试选一个文件名带「坏」字的文件，看失败与重试。</p>

<script type="module">
  const upload = document.getElementById("file-upload-manual");
  const group = upload.querySelector('[data-xh-part="list"]');

  // 每份文件的传输快照：进度由 upload 实现一路汇报，成败由元素的两个事件给
  const snapshots = new Map();
  // 每份文件那一行的状态位，按文件取，进度走动时只改这一块
  const slots = new Map();

  // 演示用的假传输：一秒走完，文件名带「坏」字的在半路失败；真实实现把 signal 接给请求库即可
  function fakeUpload(request) {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const timer = setInterval(() => {
        if (request.signal.aborted) {
          clearInterval(timer);
          reject(new Error("aborted"));
          return;
        }
        progress += 20;
        request.onProgress(progress);
        snapshots.set(request.file, { status: "uploading", progress });
        paint(request.file);
        if (progress >= 60 && request.file.name.includes("坏")) {
          clearInterval(timer);
          reject(new Error("网络中断"));
          return;
        }
        if (progress >= 100) {
          clearInterval(timer);
          resolve({ url: `https://cdn.example.com/${request.file.name}` });
        }
      }, 200);
      request.signal.addEventListener("abort", () => clearInterval(timer));
    });
  }

  upload.upload = fakeUpload;

  // 失败的那一份换成同内容的新 File 放回原位：列表一变，收下即开传的那条路重新走一遍
  function retry(file) {
    const fresh = new File([file], file.name, { type: file.type });
    snapshots.delete(file);
    upload.setFiles(upload.acceptedFiles.map((f) => (f === file ? fresh : f)));
  }

  function paint(file) {
    const slot = slots.get(file);
    if (!slot) return;
    const snapshot = snapshots.get(file);
    if (!snapshot) {
      slot.replaceChildren();
      return;
    }

    if (snapshot.status === "uploading") {
      let bar = slot.querySelector("xh-progress");
      if (!bar) {
        bar = document.createElement("xh-progress");
        bar.style.cssText = "display: block; flex: 1";
        bar.innerHTML =
          '<div data-xh-part="root"><div data-xh-part="track"><div data-xh-part="range"></div></div></div>';
        slot.replaceChildren(bar);
      }
      bar.setAttribute("value", String(snapshot.progress));
      return;
    }

    if (snapshot.status === "done") {
      const text = document.createElement("span");
      text.textContent = `已传到 ${snapshot.url}`;
      slot.replaceChildren(text);
      return;
    }

    const failed = document.createElement("span");
    failed.style.color = "var(--xh-fg-danger)";
    failed.textContent = "失败";
    const button = document.createElement("xh-button");
    button.setAttribute("size", "sm");
    button.setAttribute("variant", "outline");
    button.innerHTML = '<button data-xh-part="root">重试</button>';
    button.addEventListener("click", () => retry(file));
    slot.replaceChildren(failed, button);
  }

  // 条目节点由作者按当前列表铺，文件名由元素代填；状态位留成空壳，由 paint 填
  function render(files) {
    slots.clear();
    group.replaceChildren(
      ...files.map((file) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";

        const name = document.createElement("span");
        name.dataset.xhPart = "item-name";

        const slot = document.createElement("span");
        slot.style.cssText =
          "display: flex; flex: 1; min-inline-size: 0; align-items: center; gap: 8px";

        const remove = document.createElement("button");
        remove.dataset.xhPart = "item-delete-trigger";

        item.append(name, slot, remove);
        slots.set(file, slot);
        return item;
      })
    );
    for (const file of files) paint(file);
  }

  upload.addEventListener("files-change", (event) => {
    // 已经不在列表里的快照跟着清掉
    for (const file of [...snapshots.keys()]) {
      if (!event.detail.files.includes(file)) snapshots.delete(file);
    }
    render(event.detail.files);
  });

  upload.addEventListener("upload-complete", (event) => {
    snapshots.set(event.detail.file, { status: "done", url: event.detail.url });
    paint(event.detail.file);
  });

  upload.addEventListener("upload-error", (event) => {
    snapshots.set(event.detail.file, { status: "error" });
    paint(event.detail.file);
  });
</script>
```

### 列表项上的下载

条目里放什么由作者定：一条普通的 a[download] 就是下载口；想自己接管就换成按钮，在处理器里怎么取都行

```vue
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount } from "vue";

// 一个文件一条地址，取过就留着，卸载时统一交还
const urls = new Map<File, string>();

function urlOf(file: File) {
  const cached = urls.get(file);
  if (cached) {
    return cached;
  }
  const url = URL.createObjectURL(file);
  urls.set(file, url);
  return url;
}

// 自己接管下载：这里换了个存盘名，换成签名地址或先取回 blob 也是同一个位置
function saveCopy(file: File) {
  const link = document.createElement("a");
  link.href = urlOf(file);
  link.download = `副本-${file.name}`;
  link.click();
}

onBeforeUnmount(() => {
  urls.forEach(url => URL.revokeObjectURL(url));
  urls.clear();
});

const action = {
  flex: "none",
  fontSize: "12px",
  color: "var(--xh-fg-brand)",
  cursor: "pointer",
};
</script>

<template>
  <div style="width: 100%; max-width: 520px">
    <XhFileUploadRoot v-slot="{ acceptedFiles }" :max-files="5">
      <XhFileUploadLabel>资料</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>放几份文件进来，每条后面就带上下载口</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadList>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <a :style="action" :href="urlOf(file)" :download="file.name">下载</a>
          <button :style="action" type="button" @click="saveCopy(file)">
            存为副本
          </button>
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadList>
    </XhFileUploadRoot>
  </div>
</template>
```

```html
<xh-file-upload id="file-upload-download" max-files="5">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 520px">
    <label data-xh-part="label">资料</label>
    <div data-xh-part="dropzone">
      <span>放几份文件进来，每条后面就带上下载口</span>
    </div>
    <div>
      <button data-xh-part="trigger">选择文件</button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
  </div>
</xh-file-upload>

<script type="module">
  const upload = document.getElementById("file-upload-download");
  const group = upload.querySelector('[data-xh-part="list"]');
  const action =
    "flex: none; font-size: 12px; color: var(--xh-fg-brand); cursor: pointer";

  // 一批地址用完就交还，重铺时统一换成新的
  let urls = [];

  // 自己接管下载：这里换了个存盘名，换成签名地址或先取回 blob 也是同一个位置
  function saveCopy(file, url) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `副本-${file.name}`;
    link.click();
  }

  upload.addEventListener("files-change", (event) => {
    urls.forEach((url) => URL.revokeObjectURL(url));
    urls = event.detail.files.map((file) => URL.createObjectURL(file));
    group.replaceChildren(
      ...event.detail.files.map((file, index) => {
        const url = urls[index];
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.innerHTML =
          '<span data-xh-part="item-name"></span>' +
          '<span data-xh-part="item-size-text"></span>' +
          `<a style="${action}" href="${url}" download="${file.name}">下载</a>` +
          `<button style="${action}" type="button">存为副本</button>` +
          '<button data-xh-part="item-delete-trigger"></button>';
        item.querySelector("button").addEventListener("click", () => {
          saveCopy(file, url);
        });
        return item;
      })
    );
  });
</script>
```

### 服务器附件回显

remote-files 装编辑表单里已存在的附件：与本地文件同列渲染（allFiles 远程在前）、占 max-files 名额，删除走 remote-files-change 由宿主落库

```vue
<script setup lang="ts">
import type { FileUploadRemoteFile } from "@xihan-ui/vue";
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 编辑场景：这两条是服务端返回的既有附件，不是本地 File
const remoteFiles = ref<FileUploadRemoteFile[]>([
  { id: "a1", name: "合同扫描件.pdf", size: 382_000, type: "application/pdf", url: "https://cdn.example.com/a1.pdf" },
  { id: "a2", name: "报价单.xlsx", size: 51_200, url: "https://cdn.example.com/a2.xlsx" },
]);
</script>

<template>
  <XhFileUploadRoot
    v-slot="{ allFiles }"
    v-model:remote-files="remoteFiles"
    :max-files="4"
    style="max-inline-size: 420px"
  >
    <XhFileUploadLabel>附件（最多 4 个，已有 {{ remoteFiles.length }} 个在服务器上）</XhFileUploadLabel>
    <XhFileUploadDropzone>拖进来或点击选择</XhFileUploadDropzone>
    <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
    <XhFileUploadHiddenInput />
    <XhFileUploadList>
      <XhFileUploadItem
        v-for="(file, i) in allFiles"
        :key="'id' in file ? file.id : `local-${i}`"
        :file="file"
      >
        <XhFileUploadItemName />
        <XhFileUploadItemSizeText />
        <a v-if="'url' in file && file.url" :href="file.url" target="_blank" rel="noreferrer">查看</a>
        <XhFileUploadItemDeleteTrigger />
      </XhFileUploadItem>
    </XhFileUploadList>
  </XhFileUploadRoot>
  <p>剩余名额与新选文件共享；删除服务器附件只改 remote-files，落库由宿主决定。</p>
</template>
```

```html
<xh-file-upload id="file-upload-remote" max-files="4">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <label data-xh-part="label">附件</label>
    <div data-xh-part="dropzone">拖进来或点击选择</div>
    <button data-xh-part="trigger">选择文件</button>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="list"></div>
  </div>
</xh-file-upload>
<p>剩余名额与新选文件共享；删除服务器附件只改 remote-files，落库由宿主决定。</p>

<script type="module">
  const upload = document.getElementById("file-upload-remote");
  const group = upload.querySelector('[data-xh-part="list"]');
  const label = upload.querySelector('[data-xh-part="label"]');

  // 编辑场景：这两条是服务端返回的既有附件，不是本地 File
  let remoteFiles = [
    {
      id: "a1",
      name: "合同扫描件.pdf",
      size: 382_000,
      type: "application/pdf",
      url: "https://cdn.example.com/a1.pdf",
    },
    {
      id: "a2",
      name: "报价单.xlsx",
      size: 51_200,
      url: "https://cdn.example.com/a2.xlsx",
    },
  ];
  upload.remoteFiles = remoteFiles;

  const action = "flex: none; font-size: 12px; color: var(--xh-fg-brand)";

  // 远程那几条没有本地字节，名字与大小由作者自己写；删除交回元素，走的是同一条删除口
  function remoteRow(file) {
    const item = document.createElement("div");

    const name = document.createElement("span");
    name.textContent = file.name;

    const size = document.createElement("span");
    size.style.cssText = "flex: none; color: var(--xh-fg-subtle); font-size: 12px";
    size.textContent = `${(file.size / 1024).toFixed(1)} KB`;

    const link = document.createElement("a");
    link.style.cssText = action;
    link.href = file.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "查看";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.style.cssText = action;
    remove.textContent = "移除";
    remove.setAttribute("aria-label", `移除 ${file.name}`);
    remove.addEventListener("click", () => upload.deleteFile(file));

    item.style.cssText =
      "display: flex; align-items: center; gap: 8px; padding-block: 4px";
    item.append(name, size, link, remove);
    return item;
  }

  // 本地那几条走角色节点，文件名与大小由元素代填
  function localRow() {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.innerHTML =
      '<span data-xh-part="item-name"></span>' +
      '<span data-xh-part="item-size-text"></span>' +
      '<button data-xh-part="item-delete-trigger"></button>';
    return item;
  }

  // 远程在前、本地在后，两段同挂在一个列表容器里
  function render() {
    label.textContent = `附件（最多 4 个，已有 ${remoteFiles.length} 个在服务器上）`;
    group.replaceChildren(
      ...remoteFiles.map(remoteRow),
      ...upload.acceptedFiles.map(localRow)
    );
  }

  upload.addEventListener("files-change", render);

  // 远程列表是受控的：删除意图由这里落回宿主那份数组，真要落库也在这一处
  upload.addEventListener("remote-files-change", (event) => {
    remoteFiles = event.detail.files;
    upload.remoteFiles = remoteFiles;
    render();
  });

  render();
</script>
```

## 设计指引

### 何时使用

- 任何需要用户提交文件的地方。
- 需要预览、限制类型与大小、或选整个目录。

### 何时不用

- 只是展示已有附件、不允许新增：用[列表](./list)。

### 特性

- `maxFiles` / `maxFileSize` / `minFileSize` 越界的当场被拒，`onFileReject` 逐个报出理由。
- `autoUpload` 决定选完就传还是等提交。
- `remoteFiles` 用来回显服务器上已有的附件，与本次新选的并列在同一个列表里。
- 上传生命周期（完成、失败）各有回调；宿主还可以插入自定的准入判断。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-file-upload>` |
| Vue 组件 | `XhFileUploadClearTrigger` `XhFileUploadDropzone` `XhFileUploadHiddenInput` `XhFileUploadItem` `XhFileUploadItemDeleteTrigger` `XhFileUploadItemName` `XhFileUploadItemPreview` `XhFileUploadItemProgress` `XhFileUploadItemSizeText` `XhFileUploadLabel` `XhFileUploadList` `XhFileUploadRoot` `XhFileUploadTrigger` |
| 组合式函数 | `useFileUpload` |
| 状态机 | `fileUploadMachine` |
| 皮肤 | `@xihan-ui/styles/file-upload.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="file-upload"`：`root` · `label` · `dropzone` · `trigger` · **`hidden-input`** · `list` · `item` · `item-name` · `item-size-text` · `item-preview` · `item-progress` · `item-delete-trigger` · `clear-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `accept` | `string \| string[]` |  | 允许的类型，写法与原生 input 的 accept 一致： 'image/*' 这类通配、'.png' 这类扩展名、'application/pdf' 这类精确 MIME 都收， 逗号分隔的整串或数组两种形态都行（属性只表达得了整串，数组要走 property）。 |
| `maxFiles` | `number` |  | 最多留几个文件，默认 1。给 Infinity 即不限。 |
| `maxFileSize` | `number` |  | 单个文件的字节上限，默认不限。 |
| `minFileSize` | `number` |  | 单个文件的字节下限，默认 0（挡住 0 字节的空文件可以设成 1）。 |
| `disabled` | `boolean` |  |  |
| `invalid` | `boolean` |  | 校验失败标注；只作用于样式与 data-invalid，不阻断收文件。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才参与提交。 |
| `files` | `File[]` |  | 已选文件。给定即受控：cell 直读 prop，写只发 onFilesChange 不落内部值。 |
| `defaultFiles` | `File[]` |  |  |
| `allowDrop` | `boolean` |  | 是否接受拖拽投放，默认 true。关掉后投放区不再拦默认行为，也不再出 data-dragging。 |
| `directory` | `boolean` |  | 选目录而不是选文件（隐藏输入带 webkitdirectory）。 |
| `capture` | `'user' \| 'environment'` |  | 移动端直接调用摄像头/麦克风采集。 |
| `remoteFiles` | `FileUploadRemoteFile[]` |  | 服务器已有附件（编辑表单回显）。给定即受控：cell 直读 prop，删改只发 onRemoteFilesChange 不落内部值。条目计入 maxFiles 总量，与本地文件一起渲染。 |
| `defaultRemoteFiles` | `FileUploadRemoteFile[]` |  |  |
| `upload` | `(request: FileUploadRequest) => Promise<FileUploadResult \| undefined \| void> \| FileUploadResult \| undefined \| void` |  | 每个文件的传输实现。给了它组件才是上传器：收下的文件按 autoUpload 自动开传， 进度、成败与返回地址都记进该文件的传输快照。不给则维持纯选择器。 |
| `autoUpload` | `boolean` |  | 收下即自动开传，默认 true；关掉后由 api.startUpload 逐个开。 |
| `translations` | `Partial<FileUploadTranslations>` |  |  |
| `onFilesChange` | `(details: FileUploadFilesChangeDetails) => void` |  | 列表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onFileAccept` | `(details: FileUploadFileAcceptDetails) => void` |  | 本次收下了哪些。受控与否都发——宿主要据此发起上传。 |
| `onFileReject` | `(details: FileUploadFileRejectDetails) => void` |  | 本次拒了哪些、各自为什么。 |
| `onRemoteFilesChange` | `(details: FileUploadRemoteFilesChangeDetails) => void` |  | 远程附件列表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onUploadComplete` | `(details: FileUploadCompleteDetails) => void` |  | 单个文件传完（upload 的 Promise 兑现）。 |
| `onUploadError` | `(details: FileUploadErrorDetails) => void` |  | 单个文件传败（upload 的 Promise 拒绝）；中止不算失败不发。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `files-change` | `FileUploadFilesChangeDetails` | 列表变化；detail 为 `{ files: File[] }` |
| `remote-files-change` | `FileUploadRemoteFilesChangeDetails` | 远程附件列表变化；detail 为 `{ files: FileUploadRemoteFile[] }` |
| `upload-complete` | `FileUploadCompleteDetails` | 单个文件传完；detail 为 `{ file, url? }` |
| `upload-error` | `FileUploadErrorDetails` | 单个文件传败；detail 为 `{ file, error }` |
| `file-accept` | `FileUploadFileAcceptDetails` | 本次收下了哪些；detail 为 `{ files: File[] }` |
| `file-reject` | `FileUploadFileRejectDetails` | 本次拒了哪些、各自为什么；detail 为 `{ files: { file, reasons }[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFileUploadRoot` | `default` | `FileUploadRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item` | uploadOf(file)?.status |
| `item-progress` | uploadOf(file)?.status |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `dragging`

**事件**：`FILES.SET` · `FILES.ADD` · `FILE.DELETE` · `FILES.CLEAR` · `PICKER.OPEN` · `DRAG.OVER` · `DRAG.LEAVE` · `DROP` · `UPLOAD.START` · `REMOTE.DELETE` · `FORM.RESET`

**判据**：`canChange` · `canDrop`

## connect API

`useFileUpload` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `acceptedFiles` | `File[]` |  |
| `remoteFiles` | `FileUploadRemoteFile[]` | 服务器已有附件。 |
| `allFiles` | `FileUploadFile[]` | 渲染顺序的完整列表：远程在前、本地在后。 |
| `dragging` | `boolean` | 有东西正悬在投放区上方。 |
| `disabled` | `boolean` |  |
| `invalid` | `boolean` |  |
| `empty` | `boolean` | 一个文件都没有。清空按钮据此打 data-empty，空列表据此显示占位。 |
| `maxFiles` | `number` | 生效的数量上限（已按缺省与非法值归一）。 |
| `getFileSizeText` | `(file: FileUploadFile) => string` | 字节数格式化成人读的形式，供作者渲染 item-size-text；远程附件没报大小时为空串。 |
| `uploadOf` | `(file: FileUploadFile) => FileUploadSnapshot \| null` | 该条目的传输快照：远程附件恒为 done；本地文件没配 upload 时为 null， 配了而尚未开传为 idle。 |
| `startUpload` | `(file: File) => void` | 手动开传（autoUpload 关着时）或失败后重试；不在列表里与传输中的调了没效果。 |
| `setFiles` | `(files: File[]) => void` |  |
| `addFiles` | `(files: File[]) => void` |  |
| `deleteFile` | `(file: FileUploadFile) => void` | 本地文件按引用剔除（传输中会中止），远程附件按 id 剔除。 |
| `clear` | `() => void` | 清空整份列表（本地与远程一起）。 |
| `openFilePicker` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getDropzoneProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getHiddenInputProps` | `() => T['input']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemNameProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemSizeTextProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemPreviewProps` | `(props: FileUploadItemProps) => T['element']` |  |
| `getItemProgressProps` | `(props: FileUploadItemProps) => T['element']` | 这一条的传输进度条，纯装饰；进度比例写在私有槽上供皮肤算宽度。 |
| `getItemDeleteTriggerProps` | `(props: FileUploadItemProps) => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside / inside the component | 投放区、选择按钮、每条的删除按钮与清空按钮各占一个 Tab 位；禁用时投放区退出 Tab 序列，几个原生按钮带 disabled 本就不可聚焦 |
| `Enter` / `Space` | focus on dropzone | 打开系统文件选择框。投放区是 div，浏览器不会替它把这两个键合成成一次点击，连接层自己接管（并拦下空格滚屏） |
| `Enter` / `Space` | focus on trigger | 打开系统文件选择框（原生 button 的默认激活） |
| `Enter` / `Space` | focus on item-delete-trigger | 把这一条从列表里删掉（原生 button 的默认激活） |
| `Enter` / `Space` | focus on clear-trigger | 清空整份列表（原生 button 的默认激活）；列表为空时按钮照常在位、可聚焦，激活是空操作 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `dropzone` | `aria-disabled` | 'true' \| 'false' |
| `dropzone` | `aria-label` | label.dropzone |
| `dropzone` | `aria-labelledby` | `label` 部件的 id |
| `dropzone` | `role` | 'button' |
| `list` | `role` | 'list' |
| `item` | `role` | 'listitem' |
| `item-preview` | `aria-hidden` | 'true' |
| `item-progress` | `aria-hidden` | 'true' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(file) |
| `clear-trigger` | `aria-label` | label.clearTrigger |

## 样式

默认皮肤 `@xihan-ui/styles/file-upload.css` 按部件选择：`[data-scope="file-upload"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `dropzone` | `data-disabled` | ''（条件成立时才出现） |
| `dropzone` | `data-dragging` | ''（条件成立时才出现） |
| `dropzone` | `data-invalid` | ''（条件成立时才出现） |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-empty` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-file-name` | file.name |
| `item` | `data-file-size` | undefined \| String(file.size) \| String(file.size) |
| `item` | `data-remote` | ''（条件成立时才出现） |
| `item` | `data-state` | uploadOf(file)?.status |
| `item-name` | `data-disabled` | ''（条件成立时才出现） |
| `item-size-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-size-text` | `data-file-size` | undefined \| String(file.size) \| String(file.size) |
| `item-preview` | `data-disabled` | ''（条件成立时才出现） |
| `item-preview` | `data-file-type` | (isRemote(file) ? file.type ?? '' : file.type) \|\| 'un… |
| `item-progress` | `data-disabled` | ''（条件成立时才出现） |
| `item-progress` | `data-state` | uploadOf(file)?.status |
| `item-delete-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `clear-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `clear-trigger` | `data-empty` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-file-upload-clear-bg-active` | `clear-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | file-upload 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-clear-bg-hover` | `clear-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | file-upload 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-clear-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | file-upload 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-clear-fg-hover` | `clear-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | file-upload 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-clear-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-caption-size` | file-upload 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-file-upload-clear-gap` | `clear-trigger` | `gap` | `default` | `--xh-control-gap-sm` | file-upload 的 clear-trigger 部件 gap 覆盖槽。 |
| `--xh-file-upload-clear-h` | `clear-trigger` | `block-size` | `default` | `--xh-control-h-sm` | file-upload 的 clear-trigger 部件 block-size 覆盖槽。 |
| `--xh-file-upload-clear-px` | `clear-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | file-upload 的 clear-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-file-upload-clear-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-delete-bg-active` | `item-delete-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | file-upload 的 item-delete-trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-delete-bg-hover` | `item-delete-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | file-upload 的 item-delete-trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-delete-fg` | `item-delete-trigger` | `color` | `default` | `--xh-fg-muted` | file-upload 的 item-delete-trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-delete-fg-hover` | `item-delete-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-danger-hover` | file-upload 的 item-delete-trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-delete-radius` | `item-delete-trigger` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 item-delete-trigger 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-delete-size` | `item-delete-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | file-upload 的 item-delete-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-file-upload-dropzone-bg` | `dropzone` | `background` | `default` | `--xh-bg-canvas` | file-upload 的 dropzone 部件 background 覆盖槽。 |
| `--xh-file-upload-dropzone-bg-disabled` | `dropzone` | `background` | `disabled` | `--xh-bg-subtle` | file-upload 的 dropzone 部件 background 覆盖槽。 |
| `--xh-file-upload-dropzone-bg-dragging` | `dropzone` | `background` | `dragging` | `--xh-bg-subtle` | file-upload 的 dropzone 部件 background 覆盖槽。 |
| `--xh-file-upload-dropzone-bg-hover` | `dropzone` | `background` | `disabled`<br>`dragging`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid], [data-dragging])` | `--xh-bg-subtle` | file-upload 的 dropzone 部件 background 覆盖槽。 |
| `--xh-file-upload-dropzone-border` | `dropzone` | `border` | `default` | `--xh-border-control` | file-upload 的 dropzone 部件 border 覆盖槽。 |
| `--xh-file-upload-dropzone-border-dragging` | `dropzone` | `border-color` | `dragging` | `--xh-bg-brand` | file-upload 的 dropzone 部件 border-color 覆盖槽。 |
| `--xh-file-upload-dropzone-border-focus` | `dropzone` | `border-color` | `disabled`<br>`dragging`<br>`focus-visible`<br>`invalid`<br>`not([data-disabled], [data-invalid], [data-dragging])` | `--xh-_tone` | file-upload 的 dropzone 部件 border-color 覆盖槽。 |
| `--xh-file-upload-dropzone-border-hover` | `dropzone` | `border-color` | `disabled`<br>`dragging`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid], [data-dragging])` | `--xh-border-control-hover` | file-upload 的 dropzone 部件 border-color 覆盖槽。 |
| `--xh-file-upload-dropzone-border-invalid` | `dropzone` | `border-color` | `invalid` | `--xh-border-invalid` | file-upload 的 dropzone 部件 border-color 覆盖槽。 |
| `--xh-file-upload-dropzone-fg` | `dropzone` | `color` | `default` | `--xh-fg-muted` | file-upload 的 dropzone 部件 color 覆盖槽。 |
| `--xh-file-upload-dropzone-font-size` | `dropzone` | `font-size` | `default` | `--xh-text-body-size` | file-upload 的 dropzone 部件 font-size 覆盖槽。 |
| `--xh-file-upload-dropzone-gap` | `dropzone` | `gap` | `default` | `--xh-space-2` | file-upload 的 dropzone 部件 gap 覆盖槽。 |
| `--xh-file-upload-dropzone-min-h` | `dropzone` | `min-block-size` | `default` | `8rem` | file-upload 的 dropzone 部件 min-block-size 覆盖槽。 |
| `--xh-file-upload-dropzone-px` | `dropzone` | `padding-inline` | `default` | `--xh-space-4` | file-upload 的 dropzone 部件 padding-inline 覆盖槽。 |
| `--xh-file-upload-dropzone-py` | `dropzone` | `padding-block` | `default` | `--xh-space-5` | file-upload 的 dropzone 部件 padding-block 覆盖槽。 |
| `--xh-file-upload-dropzone-radius` | `dropzone` | `border-radius` | `default` | `--xh-shape-surface` | file-upload 的 dropzone 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-gap` | `root` | `gap` | `default` | `--xh-space-3` | file-upload 的 root 部件 gap 覆盖槽。 |
| `--xh-file-upload-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | file-upload 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-file-upload-item-bg` | `item` | `background` | `default` | `--xh-bg-surface` | file-upload 的 item 部件 background 覆盖槽。 |
| `--xh-file-upload-item-border` | `item` | `border` | `default` | `--xh-border-subtle` | file-upload 的 item 部件 border 覆盖槽。 |
| `--xh-file-upload-item-border-error` | `item` | `border-color` | `state=error` | `--xh-border-invalid` | file-upload 的 item 部件 border-color 覆盖槽。 |
| `--xh-file-upload-item-fg` | `item` | `color` | `default` | `--xh-fg-default` | file-upload 的 item 部件 color 覆盖槽。 |
| `--xh-file-upload-item-fg-done` | `item` | `background-color` | `state=done` | `--xh-fg-success` | file-upload 的 item 部件 background-color 覆盖槽。 |
| `--xh-file-upload-item-fg-error` | `item` | `color` | `state=error` | `--xh-fg-danger` | file-upload 的 item 部件 color 覆盖槽。 |
| `--xh-file-upload-item-font-size` | `item` | `font-size` | `default` | `--xh-text-body-size` | file-upload 的 item 部件 font-size 覆盖槽。 |
| `--xh-file-upload-item-gap` | `list` | `gap` | `default` | `--xh-space-2` | file-upload 的 list 部件 gap 覆盖槽。 |
| `--xh-file-upload-item-inner-gap` | `item` | `gap` | `default` | `--xh-control-gap-md` | file-upload 的 item 部件 gap 覆盖槽。 |
| `--xh-file-upload-item-name-min-w` | `item-name` | `min-inline-size` | `default` | `--xh-control-min-w` | file-upload 的 item-name 部件 min-inline-size 覆盖槽。 |
| `--xh-file-upload-item-progress-fill` | `item-progress` | `background` | `state=uploading` | `--xh-bg-brand` | file-upload 的 item-progress 部件 background 覆盖槽。 |
| `--xh-file-upload-item-progress-h` | `item-progress` | `block-size` | `default` | `--xh-stroke-thick` | file-upload 的 item-progress 部件 block-size 覆盖槽。 |
| `--xh-file-upload-item-progress-radius` | `item-progress` | `border-radius` | `default` | `--xh-shape-pill` | file-upload 的 item-progress 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-item-progress-track` | `item-progress` | `background` | `default` | `--xh-bg-subtle` | file-upload 的 item-progress 部件 background 覆盖槽。 |
| `--xh-file-upload-item-progress-w` | `item-progress` | `inline-size` | `default` | `--xh-control-h-md` | file-upload 的 item-progress 部件 inline-size 覆盖槽。 |
| `--xh-file-upload-item-px` | `item` | `padding-inline` | `default` | `--xh-space-3` | file-upload 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-file-upload-item-py` | `item` | `padding-block` | `default` | `--xh-space-2` | file-upload 的 item 部件 padding-block 覆盖槽。 |
| `--xh-file-upload-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 item 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | file-upload 的 label 部件 color 覆盖槽。 |
| `--xh-file-upload-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | file-upload 的 label 部件 color 覆盖槽。 |
| `--xh-file-upload-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | file-upload 的 label 部件 font-size 覆盖槽。 |
| `--xh-file-upload-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | file-upload 的 label 部件 font-weight 覆盖槽。 |
| `--xh-file-upload-list-max-h` | `list` | `max-block-size` | `default` | `--xh-viewport-h-md` | file-upload 的 list 部件 max-block-size 覆盖槽。 |
| `--xh-file-upload-preview-bg` | `item-preview` | `background` | `default` | `--xh-bg-subtle` | file-upload 的 item-preview 部件 background 覆盖槽。 |
| `--xh-file-upload-preview-fg` | `item-preview` | `color` | `default` | `--xh-fg-muted` | file-upload 的 item-preview 部件 color 覆盖槽。 |
| `--xh-file-upload-preview-fg-image` | `item-preview` | `color` | `file-type=image/` | `--xh-fg-brand` | file-upload 的 item-preview 部件 color 覆盖槽。 |
| `--xh-file-upload-preview-radius` | `item-preview` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 item-preview 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-preview-size` | `item-preview` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-md` | file-upload 的 item-preview 部件 block-size、inline-size 覆盖槽。 |
| `--xh-file-upload-size-fg` | `item-size-text` | `color` | `default` | `--xh-fg-subtle` | file-upload 的 item-size-text 部件 color 覆盖槽。 |
| `--xh-file-upload-size-font-size` | `item-size-text` | `font-size` | `default` | `--xh-text-caption-size` | file-upload 的 item-size-text 部件 font-size 覆盖槽。 |
| `--xh-file-upload-trigger-bg` | `trigger` | `background` | `default` | `--xh-bg-surface` | file-upload 的 trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-trigger-bg-active` | `trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | file-upload 的 trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-trigger-bg-hover` | `trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | file-upload 的 trigger 部件 background 覆盖槽。 |
| `--xh-file-upload-trigger-border` | `trigger` | `border` | `default` | `--xh-border-control` | file-upload 的 trigger 部件 border 覆盖槽。 |
| `--xh-file-upload-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | file-upload 的 trigger 部件 color 覆盖槽。 |
| `--xh-file-upload-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-body-size` | file-upload 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-file-upload-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-md` | file-upload 的 trigger 部件 gap 覆盖槽。 |
| `--xh-file-upload-trigger-h` | `trigger` | `block-size` | `default` | `--xh-control-h-md` | file-upload 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-file-upload-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-control-px-md` | file-upload 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-file-upload-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | file-upload 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-file-upload-trigger-shadow-hover` | `trigger` | `box-shadow` | `hover`<br>`not(:disabled)` | `--xh-elevation-raised` | file-upload 的 trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `background-color` · `border-color` · `box-shadow` · `inline-size` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；缩略图墙用[图片](./image)与[图片预览](./image-viewer)。

## 最佳实践

- 在界面上写清楚允许的类型与大小上限，别等用户选完才拒。
- 拒收要说明是哪个文件、为什么。

## 反模式

- 只拦前端不拦后端。
- 上传中不给进度也不能取消。
