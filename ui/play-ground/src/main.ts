import { createApp } from "vue";
import App from "./App.vue";
import XihanUI from "xihan-ui";
import router from "./router";

const app = createApp(App);
app.use(XihanUI);
app.use(router);
app.mount("#app");
