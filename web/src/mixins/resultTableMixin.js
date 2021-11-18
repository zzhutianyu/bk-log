/*
 * Tencent is pleased to support the open source community by making BK-LOG 蓝鲸日志平台 available.
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 * BK-LOG 蓝鲸日志平台 is licensed under the MIT License.
 *
 * License for BK-LOG 蓝鲸日志平台:
 * --------------------------------------------------------------------
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
 */

import { mapState } from 'vuex';
import { formatDate } from '@/common/util';
import tableRowDeepViewMixin from '@/mixins/tableRowDeepViewMixin';
import EventPopover from '@/views/retrieve2/result-comp/EventPopover.vue';
import TextHighlight from 'vue-text-highlight';
import OperatorTools from '@/views/retrieve2/result-table-panel/original-log/OperatorTools';
import RetrieveLoader from '@/skeleton/retrieve-loader';
import TableColumn from '@/views/retrieve2/result-comp/TableColumn';
import ExpandView from '@/views/retrieve2/result-table-panel/original-log/ExpandView.vue';

export default {
  components: {
    EventPopover,
    TextHighlight,
    OperatorTools,
    RetrieveLoader,
    TableColumn,
    ExpandView,
  },
  mixins: [tableRowDeepViewMixin],
  props: {
    tableList: {
      type: Array,
      required: true,
    },
    originTableList: {
      type: Array,
      required: true,
    },
    totalFields: {
      type: Array,
      required: true,
    },
    visibleFields: {
      type: Array,
      required: true,
    },
    isWrap: {
      type: Boolean,
      default: false,
    },
    retrieveParams: {
      type: Object,
      required: true,
    },
    showRealtimeLog: {
      type: Boolean,
      required: true,
    },
    showContextLog: {
      type: Boolean,
      required: true,
    },
    showWebConsole: {
      type: Boolean,
      required: true,
    },
    bkMonitorUrl: {
      type: Boolean,
      required: true,
    },
    tableLoading: {
      type: Boolean,
      required: true,
    },
    isPageOver: {
      type: Boolean,
      required: false,
    },
    timeField: {
      type: String,
      default: '',
    },
    handleClickTools: Function,
  },
  data() {
    return {
      formatDate,
      curHoverIndex: -1, // 当前鼠标hover行的索引
      cacheExpandStr: [],
    };
  },
  computed: {
    ...mapState('globals', ['fieldTypeMap']),
    showMonitorWeb() {
      return this.bkMonitorUrl;
    },
    showHandleOption() {
      const { showRealtimeLog, showContextLog, showWebConsole, showMonitorWeb, visibleFields } = this;
      if (visibleFields.length !== 0) {
        const columnObj = JSON.parse(localStorage.getItem('table_column_width_obj'));
        const { params: { indexId }, query: { bizId } } = this.$route;
        let widthObj = {};

        for (const bizKey in columnObj) {
          if (bizKey === bizId) {
            for (const fieldKey in columnObj[bizId].fields) {
              fieldKey === indexId && (widthObj =  columnObj[bizId].fields[indexId]);
            }
          }
        }

        visibleFields.forEach((el, index) => {
          el.width = widthObj[index] === undefined ? 'default' : widthObj[index];
        });
      }
      return (showRealtimeLog
      || showContextLog
      || showWebConsole
      || showMonitorWeb) && this.tableList.length;
    },
  },
  watch: {
    retrieveParams: {
      deep: true,
      handler() {
        this.cacheExpandStr = [];
      },
    },
    '$route.params.indexId'() { // 切换索引集重置状态
      this.cacheExpandStr = [];
    },
  },
  methods: {
    handleShowWhole(index) {
      this.cacheExpandStr.push(index);
    },
    getMarkList(content) {
      return content.match(/(?<=<mark>).*?(?=<\/mark>)/g) || [];
    },
    formatterStr(content) {
      // 匹配高亮标签
      let value = content;

      const markVal = content.match(/(?<=<mark>).*?(?=<\/mark>)/g) || [];
      if (markVal) {
        this.markList = markVal;
        value = String(value).replace(/<mark>/g, '')
          .replace(/<\/mark>/g, '');
      }

      return value;
    },
    // 展开表格行JSON
    tableRowClick(row, option, column) {
      if (column.className && column.className.includes('original-str')) return;
      const ele = this.$refs.resultTable;
      ele.toggleRowExpansion(row);
      this.curHoverIndex = -1;
    },
    handleMouseEnter(index) {
      this.curHoverIndex = index;
    },
    handleMouseLeave() {
      this.curHoverIndex = -1;
    },
    handleHeaderDragend(newWidth, oldWidth, { index }) {
      const { params: { indexId }, query: { bizId } } = this.$route;
      if (index === undefined || bizId === undefined || indexId === undefined) {
        return;
      }
      const widthObj = {};
      widthObj[index] = newWidth;
      index === this.visibleFields.length - 1 && (widthObj[index] = 'default');

      let columnObj = JSON.parse(localStorage.getItem('table_column_width_obj'));
      if (columnObj === null) {
        columnObj = {};
        columnObj[bizId] = this.initSubsetObj(bizId, indexId);
      }
      const isIncludebizId = Object.keys(columnObj).some(el => el === bizId);
      isIncludebizId === false && (columnObj[bizId] = this.initSubsetObj(bizId, indexId));

      for (const key in columnObj) {
        if (key === bizId) {
          if (columnObj[bizId].fields[indexId] === undefined) {
            columnObj[bizId].fields[indexId] = {};
            columnObj[bizId].indexsetIds.push(indexId);
          }
          columnObj[bizId].fields[indexId] = Object.assign(columnObj[bizId].fields[indexId], widthObj);
        }
      }

      localStorage.setItem('table_column_width_obj', JSON.stringify(columnObj));
    },
    initSubsetObj(bizId, indexId) {
      const subsetObj = {};
      subsetObj.bizId = bizId;
      subsetObj.indexsetIds = [indexId];
      subsetObj.fields = {};
      subsetObj.fields[indexId] = {};
      return subsetObj;
    },
    // eslint-disable-next-line no-unused-vars
    renderHeaderAliasName(h, { column, $index }) {
      const field = this.visibleFields[$index - 1];
      if (field) {
        const fieldName = this.showFieldAlias ? this.fieldAliasMap[field.field_name] : field.field_name;
        const fieldType = field.field_type;
        const fieldIcon = this.getFieldIcon(field.field_type) || 'log-icon icon-unkown';
        const content = this.fieldTypeMap[fieldType] ? this.fieldTypeMap[fieldType].name : undefined;

        return h('div', {
          class: 'render-header',
        }, [
          h('span', {
            class: `field-type-icon ${fieldIcon}`,
            directives: [
              {
                name: 'bk-tooltips',
                value: content,
              },
            ],
          }),
          h('span', fieldName),
        ]);
      }
    },
    handleIconClick(type, content, field, row) {
      let value = field.field_type === 'date' ? row[field.field_name] : content;
      value = String(value).replace(/<mark>/g, '')
        .replace(/<\/mark>/g, '');
      if (type === 'search') { // 将表格单元添加到过滤条件
        this.$emit('addFilterCondition', field.field_name, 'eq', value);
      } else if (type === 'copy') { // 复制单元格内容
        try {
          const input = document.createElement('input');
          input.setAttribute('value', value);
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          this.messageSuccess(this.$t('复制成功'));
        } catch (e) {
          console.warn(e);
        }
      } else if (['is', 'is not'].includes(type)) {
        this.$emit('addFilterCondition', field.field_name, type, value.toString());
      }
    },
    getFieldIcon(fieldType) {
      const iconMap = {
        number: 'log-icon icon-number',
        keyword: 'log-icon log-icon icon-string',
        text: 'log-icon icon-text',
        date: 'bk-icon icon-clock',
      };
      if (fieldType === 'long' || fieldType === 'integer') {
        return iconMap.number;
      }
      return iconMap[fieldType];
    },
    handleMenuClick(option) {
      switch (option.operation) {
        case 'is':
        case 'is not':
          // eslint-disable-next-line no-case-declarations
          const { fieldName, operation, value } = option;
          this.$emit('addFilterCondition', fieldName, operation, value.toString());
          break;
        case 'copy':
          try {
            const input = document.createElement('input');
            input.setAttribute('value', option.value);
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.messageSuccess(this.$t('复制成功'));
          } catch (e) {
            console.warn(e);
          }
          break;
        case 'display':
          this.$emit('fieldsUpdated', option.displayFieldNames);
          break;
        default:
          break;
      }
    },
  },
};
