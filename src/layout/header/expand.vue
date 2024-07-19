<script lang="ts">
import Lang from "@/components/base/lang";
import SvgIcon from "@/components/base/svg-icon";
import app from "@/constants/app";
import baseService from "@/service/baseService";
import { getToken } from "@/utils/cache";
import ui from "@/utils/ui";
import { checkPermission } from "@/utils/utils";
import { useFullscreen, useWebSocket } from "@vueuse/core";
import { ElNotification } from "element-plus";
import { computed, defineComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import SettingSidebar from "../setting/index.vue";
import userLogo from "@/assets/images/user.png";
import "@/assets/css/header.less";

interface IExpand {
  userName?: string;
}

/**
 * 顶部右侧扩展区域
 */
export default defineComponent({
  name: "Expand",
  components: { SettingSidebar, SvgIcon, Lang },
  props: {
    userName: String
  },
  setup(props: IExpand) {
    const { t } = useI18n();
    const router = useRouter();
    const store = useStore();
    const { isFullscreen, toggle } = useFullscreen();
    const messageCount = ref(0);
    const errorNotificationCount = ref(0);

    watch(
      () => store.state.appIsLogin,
      (vl) => {
        if (vl) {
          getUnReadMessageCount();
          // ws();
        }
      }
    );

    const ws = () => {
      const { data } = useWebSocket(app.websocket + "?token=" + getToken(), {
        autoReconnect: true,
        heartbeat: {
          interval: 15000
        },
        onConnected() {
          console.log("websocket connected");
        },
        onError() {
          errorNotificationCount.value++;
          if (errorNotificationCount.value < 2) {
            ElNotification({
              type: "error",
              title: t("notice.disconnect"),
              message: t("notice.disconnectMessage")
            });
            console.error("websocket connect error");
          }
        }
      });
      watch(
        () => data.value,
        (vl) => {
          const result = JSON.parse(vl);
          // 如果是有新文本通知，则提示有新通知
          if (result.type === 0) {
            messageCount.value++;
            ElNotification({
              title: t("notice.new"),
              message: result.msg,
              type: "info",
              duration: 5000
            });
          }
        }
      );
    };

    const getUnReadMessageCount = () => {
      baseService.get("/sys/notice/mynotice/unread").then((res) => {
        messageCount.value = res.data;
      });
    };

    const onClickUserMenus = (path: string) => {
      if (path === "/login") {
        ui.confirm(t("prompt.info", { handle: t("logout") }), t("prompt.title"), {
          confirmButtonText: t("confirm"),
          cancelButtonText: t("cancel"),
          type: "warning"
        })
          .then(() => {
            baseService.post("/logout").finally(() => {
              router.push(path);
            });
          })
          .catch(() => {
            //
          });
      } else {
        router.push(path);
      }
    };
    const onClickMessage = () => {
      router.push("/notice/notice-user");
    };
    const messagePermission = computed(() => checkPermission(store.state.permissions, "sys:notice:all"));
    return {
      props,
      store,
      isFullscreen,
      messageCount,
      messagePermission,
      userLogo,
      onClickUserMenus,
      onClickMessage,
      toggle,
      t
    };
  }
});
</script>
<template>
  <div class="rr-header-right-items">
    <div @click="toggle">
      <span>
        <svg-icon :name="isFullscreen ? 'tuichuquanping' : 'fullscreen2'"></svg-icon>
      </span>
    </div>
    <div v-if="messagePermission">
      <el-badge :value="messageCount > 0 ? messageCount : null" type="danger" :max="99" @click="onClickMessage">
        <i class="el-icon-bell icon"></i>
      </el-badge>
    </div>
    <div>
      <lang></lang>
    </div>
    <div style="display: flex; justify-content: center; align-items: center">
      <img :src="userLogo" :alt="props.userName" style="width: 30px; height: 30px; border-radius: 50%; margin-top: 3px; margin-right: 5px" />
      <el-dropdown @command="onClickUserMenus">
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="el-icon-lock" command="/user/password">
              {{ t("ui.user.links.editPassword") }}
            </el-dropdown-item>
            <el-dropdown-item icon="el-icon-switch-button" divided command="/login">
              {{ t("ui.user.links.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
        <span class="el-dropdown-link">
          {{ props.userName }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
      </el-dropdown>
    </div>
    <setting-sidebar></setting-sidebar>
  </div>
</template>
