<!--
  - Tencent is pleased to support the open source community by making BK-LOG 蓝鲸日志平台 available.
  - Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
  - BK-LOG 蓝鲸日志平台 is licensed under the MIT License.
  -
  - License for BK-LOG 蓝鲸日志平台:
  - -------------------------------------------------------------------
  -
  - Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
  - documentation files (the "Software"), to deal in the Software without restriction, including without limitation
  - the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
  - and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  - The above copyright notice and this permission notice shall be included in all copies or substantial
  - portions of the Software.
  -
  - THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
  - LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  - NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  - WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  - SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
  -->

<template>
  <div id="app" v-bkloading="{ isLoading: pageLoading }">
    <head-nav
      v-show="!asIframe && !pageLoading"
      @reloadRouter="routerKey += 1"
      @welcome="welcomePageData = $event"
      @auth="authPageInfo = $event"
    ></head-nav>
    <div :class="['log-search-container', asIframe && 'as-iframe']" v-if="!pageLoading">
      <auth-page v-if="authPageInfo" :info="authPageInfo"></auth-page>
      <welcome-page v-else-if="welcomePageData" :data="welcomePageData"></welcome-page>
      <router-view v-else :key="routerKey"></router-view>
    </div>
    <auth-dialog></auth-dialog>
    <LoginModal v-if="loginData" :login-data="loginData" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import headNav from '@/components/nav/head-nav';
import LoginModal from '@/components/LoginModal';
import WelcomePage from '@/components/common/welcome-page';
import AuthPage from '@/components/common/auth-page';
import AuthDialog from '@/components/common/auth-dialog';
import jsCookie from 'js-cookie';

export default {
  name: 'app',
  components: {
    headNav,
    LoginModal,
    AuthPage,
    AuthDialog,
    WelcomePage,
  },
  data() {
    return {
      loginData: null,
      authPageInfo: null,
      welcomePageData: null,
      routerKey: 0,
    };
  },
  computed: {
    ...mapGetters({
      pageLoading: 'pageLoading',
      asIframe: 'asIframe',
    }),
  },
  created() {
    const platform = window.navigator.platform.toLowerCase();
    if (platform.indexOf('win') === 0) {
      document.body.style['font-family'] = 'Microsoft Yahei, pingFang-SC-Regular, Helvetica, Aria, sans-serif';
    } else {
      document.body.style['font-family'] = 'pingFang-SC-Regular, Microsoft Yahei, Helvetica, Aria, sans-serif';
    }
    this.$store.commit('updateRunVersion', window.runVersion || '');

    // 是否转换日期类型字段格式
    const isFormatDate = jsCookie.get('operation');
    if (isFormatDate === 'false') {
      this.$store.commit('updateIsFormatDate', false);
    }

    // 弹窗登录
    window.bus.$on('show-login-modal', (loginData) => {
      this.loginData = loginData;
    });
    window.bus.$on('close-login-modal', () => {
      this.loginData = null;
      setTimeout(() => {
        window.location.reload();
      }, 0);
    });
  },
  mounted() {
    this.$store.dispatch('getBkBizList');
  },
};
</script>

<style lang="scss">
  @import './scss/reset.scss';
  @import './scss/app.scss';
  @import './scss/animation.scss';
  @import './scss/mixins/clearfix.scss';
  @import './scss/mixins/scroller.scss';

  #app {
    min-width: 1280px;
    height: 100%;
    min-height: 730px;
    background: #f4f7fa;
  }

  .button-text {
    color: #3a84ff;
    cursor: pointer;

    &:hover {
      color: #699df4;
    }

    &:active {
      color: #2761dd;
    }

    &.is-disabled {
      color: #c4c6cc;
      cursor: not-allowed;
    }
  }

  .text-overflow-hidden {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .button-text {
    color: #3a84ff;
    cursor: pointer;

    &:hover {
      color: #699df4;
    }

    &:active {
      color: #2761dd;
    }

    &.is-disabled {
      color: #c4c6cc;
      cursor: not-allowed;
    }
  }

  .log-search-container {
    position: relative;
    width: 100%;
    height: calc(100% - 50px);
    overflow-y: hidden;

    &.as-iframe {
      height: 100%;
    }
  }

  /*无权限时 v-cursor 样式*/
  .cursor-element {
    width: 12px;
    height: 16px;
    background: url('./images/cursor-lock.svg') no-repeat;
  }
  // 检索里一些公用的样式
  .tab-button {
    float: left;

    @include clearfix;

    .tab-button-item {
      // display: table-column;
      margin-left: -1px;
      padding: 0 15px;
      border: 1px solid #c4c6cc;
      border-left-color: transparent;
      font-size: 0;
      color: #63656e;
      cursor: pointer;

      &:first-child {
        margin-left: 0;
        border-left-color: #c4c6cc;
        border-radius: 2px 0 0 2px;
      }

      &:last-child {
        border-radius: 0 2px 2px 0;
      }

      &.active {
        border: 1px solid #3a84ff;
        color: #3a84ff;
        background: #e1ecff;
        z-index: 10;
      }
    }

    .tab-button-text {
      display: inline-block;
      width: 100%;
      line-height: 32px;
      font-size: 12px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  // hack 组件样式
  .bk-dialog.bk-info-box .bk-dialog-header-inner {
    white-space: normal !important;
  }

  .bk-date-picker-dropdown .bk-picker-confirm-time {
    color: #3a84ff;
  }

  .tippy-tooltip .tippy-content {
    padding: 0;
    word-break: break-all;
  }

  .bk-form-control.is-error .bk-form-input {
    border-color: #ff5656;
  }
  // 导航
  .hack-king-navigation.bk-navigation {
    width: 100% !important;
    height: 100% !important;
    .container-header {
      display: none !important;
    }
    .bk-navigation-wrapper {
      height: 100%;
      .navigation-container {
        max-width: calc(100% - 60px) !important;
        z-index: 100;
        .container-content {
          height: 100% !important;
          max-height: 100% !important;
          padding: 0;
          .navigation-content {
            height: 100%;
          }
        }
      }
      .bk-navigation-menu-group {
        &:first-child {
          .group-name-wrap {
            padding-top: 12px;
          }
        }
        .group-name-wrap .group-name {
          margin-right: 0;
        }
      }
      .navigation-menu-item-icon.bk-icon {
        min-width: 28px;
      }
    }
    .nav-slider-list {
      height: calc(100% - 56px) !important;
    }
  }
  // 表格单元 v-bk-overflow-tips
  .bk-table .bk-table-body-wrapper .table-ceil-container {
    width: 100%;

    > span {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  // hack vue-json-pretty
  .json-view-wrapper .vjs-value {
    word-break: break-all;
  }
  // hack be-select将下拉宽度全部交给slot以控制宽度和事件传播
  .custom-no-padding-option.bk-option > .bk-option-content {
    padding: 0;

    > .option-slot-container {
      padding: 9px 16px;
      min-height: 32px;
      line-height: 14px;

      &.no-authority {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #c4c6cc;
        cursor: not-allowed;

        .text {
          width: calc(100% - 56px);
        }

        .apply-text {
          flex-shrink: 0;
          display: none;
          color: #3a84ff;
          cursor: pointer;
        }

        &:hover .apply-text {
          display: flex;
        }
      }
    }
  }
  // 采集项管理、索引集管理通用样式
  .access-manage-container {
    padding: 20px 24px;
    .bk-tab-section {
      display: none;
    }
    .tab-content {
      height: calc(100% - 43px);
      overflow: auto;
      @include scroller($backgroundColor: #C4C6CC, $width: 8px);
      padding: 20px;
      background-color: #FFF;
      border: 1px solid #DCDEE5;
      border-top: none;
      .main-title {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 700;
        color: #63656e;
        line-height: 20px;
        padding: 0 0 8px 0;
        border-bottom: 1px solid #DCDEE5;
        margin-bottom: 20px;
      }
      .refresh-button {
        display: flex;
        align-items: center;
        font-size: 12px;
        font-weight: normal;
        color: #3a84ff;
        margin-left: 8px;
        cursor: pointer;
        &:hover {
          color: #699DF4;
        }
        .bk-icon {
          font-size: 13px;
          margin-right: 4px;
        }
      }
      .charts-container {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        .chart-container {
          position: relative;
          width: calc((100% - 16px) / 2);
          padding: 0 16px;
          border: 1px solid #f0f1f5;
          border-radius: 3px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 50px;
            .title {
              font-size: 12px;
              font-weight: bold;
              color: #63656e;
              line-height: 16px;
            }
            .date-picker {
              display: flex;
              align-items: center;
            }
          }
          .chart-canvas-container {
            position: relative;
            height: 230px;
            &.big-chart {
              height: 280px;
            }
          }
          .king-exception {
            position: absolute;
            top: 80px;
            left: 0;
          }
        }
      }
    }
  }
</style>
