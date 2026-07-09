# 活动审核流程完善方案

## 现状问题

1. **activity-review.html** - 驳回时 reason 没有持久化到活动数据
2. **activity-detail.html** - 缺少"已驳回"状态显示 + 缺少审核记录 tab
3. **activity-list.html** - 筛选器和状态徽章都缺少"已驳回"状态

---

## 已完成 ✅

### 1. activity-review.html - 审核备注（可选文本框）

**修改内容：**
- 驳回原因文本框改为统一的**备注信息（选填）**文本框
- 通过/驳回两种操作都显示备注文本框
- 备注信息存入 `reviewHistory[].reason` 字段

**涉及改动：**
- `rejectReasonGroup` → `reviewRemarkGroup`
- 通过/驳回时都 `classList.remove('hidden')` 显示备注文本框
- 关闭弹窗时清空 `reviewRemark`
- 确认审核时将备注存入 `reviewHistory`

---

## 待完成

### 2. activity-list.html - 支持已驳回状态

**修改点 A：状态筛选下拉（第76-83行）**
```html
<option value="rejected">已驳回</option>  <!-- 新增 -->
```

**修改点 B：状态徽章 map（第281-289行）**
```javascript
const statusMap = {
    draft: '...',
    pending: '...',
    published: '...',
    ended: '...',
    offline: '...',
    rejected: '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">已驳回</span>'  // 新增
};
```

### 3. activity-detail.html - 审核记录 tab

**修改点 A：状态徽章 map（第239-248行）**
```javascript
const statusMap = {
    draft: '...',
    pending: '...',
    published: '...',
    ended: '...',
    offline: '...',
    rejected: '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">已驳回</span>'  // 新增
};
```

**修改点 B：新增"审核记录" tab（第86-90行）**
```html
<button type="button" onclick="switchTab('review')" id="tab-review" class="tab-btn px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900">审核记录</button>
```

**修改点 C：审核记录面板（第164行附近）**
```html
<div id="panel-review" class="tab-panel hidden">
    <div id="reviewHistoryList" class="space-y-4">
        <!-- 动态渲染审核记录 -->
    </div>
</div>
```

**修改点 D：加载审核记录数据（第251行 loadActivityDetail 末尾）**
```javascript
// 渲染审核记录
renderReviewHistory(activity.reviewHistory || []);
```

**修改点 E：新增 renderReviewHistory 函数**
```javascript
function renderReviewHistory(history) {
    const container = document.getElementById('reviewHistoryList');
    if (!history || history.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400">暂无审核记录</p>';
        return;
    }
    container.innerHTML = history.map(record => `
        <div class="border border-[#E2E8F0] rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
                <span class="px-2 py-1 text-xs rounded-full ${record.action === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    ${record.action === 'approved' ? '审核通过' : '已驳回'}
                </span>
                <span class="text-xs text-gray-400">${record.time}</span>
            </div>
            ${record.reason ? `<p class="text-sm text-gray-600">${record.action === 'approved' ? '备注' : '驳回说明'}：${record.reason}</p>` : ''}
            <p class="text-xs text-gray-400 mt-2">审核人：${record.reviewer}</p>
        </div>
    `).join('');
}
```

## 涉及文件

- [activity-review.html](activity-review.html) ✅ - 审核备注功能
- [activity-list.html](activity-list.html) - 支持已驳回状态筛选和显示
- [activity-detail.html](activity-detail.html) - 状态徽章 + 审核记录 tab

---

## 报名名单导入功能

### 需求背景

内勤/HR 经常需要批量导入报名名单（如邀请 VIP、内定学员、合作方名单等），手动逐条录入效率低。需要在 **报名管理（activity-registration.html）** 提供批量导入入口。

### 需求要点

1. **入口位置**：报名管理页顶部操作栏，"导出数据"左侧加一个"导入名单"主按钮（accent-blue 实心）。
2. **支持格式**：`.xlsx` / `.xls` / `.csv`，单个文件 ≤ 5MB，单次最多 500 条。
3. **三步式流程**（单弹窗内步骤切换）：
   - **Step 1 上传文件**：拖拽 / 点选上传，显示文件名、文件大小，提供"下载导入模板"链接。
   - **Step 2 预览与配置**：
     - 解析后展示前 10 条数据预览（表格）；
     - 必填列缺失时高亮提示（姓名、手机号）；
     - 选择**目标活动**（下拉，默认"未分配"）；
     - 选择**默认审核状态**：① 直接通过（导入即 approved）② 设为待审核（导入即 pending，需后续审核）；
     - **查重规则**勾选：手机号相同视为同一人，默认开启。
   - **Step 3 导入结果**：展示「成功 N 条 / 重复跳过 M 条 / 失败 K 条」统计 + 失败明细表（行号 + 原因）。
4. **导入来源标记**：在 `note` 字段追加"导入于 YYYY-MM-DD"，方便追溯。
5. **空数据 / 模板错误**：若文件无有效行，提示"未解析到有效数据，请检查模板格式"。
6. **导入完成**：弹窗关闭，列表自动刷新，Toast 提示"成功导入 N 条"。

### 模板字段（Excel/CSV）

| 字段 | 是否必填 | 示例 |
| --- | --- | --- |
| 姓名 | 必填 | 张三 |
| 手机号 | 必填 | 13800001111 |
| 企业名称 | 选填 | XX 科技有限公司 |
| 职位 | 选填 | 产品经理 |
| 邮箱 | 选填 | zhangsan@example.com |

> 说明：导入时不做格式强校验（号码位数、邮箱格式），但失败明细中会标注"疑似无效"。

### UI 草图

```
┌─ 导入名单 ─────────────────────────────┐
│  ●  上传    ○  预览    ○  结果        │  步骤指示器
├────────────────────────────────────────┤
│  ┌────────────────────────────────┐    │
│  │  ⬆  拖拽文件到此 / 点击上传       │    │  Step 1
│  │  支持 xlsx / xls / csv  ≤ 5MB     │    │
│  └────────────────────────────────┘    │
│  📎 下载导入模板                         │
│              [取消]  [下一步]              │
└────────────────────────────────────────┘
```

### 涉及文件

- [activity-registration.html](activity-registration.html) — 顶部新增"导入名单"按钮 + 导入弹窗（步骤 1/2/3） + 模拟解析/查重/结果统计逻辑

---

## 报名搜索支持企业名称

### 需求背景

报名审核的搜索框当前仅匹配「报名人、手机号」，无法定位同一企业下的多人报名（如 "北京科技" 出现 2 名员工但分属不同姓名），需要扩展为同时匹配「企业名称」。

### 需求要点

1. **匹配字段**：报名人姓名 / 手机号 / 企业名称（三者任一包含即命中）。
2. **大小写**：企业名称一律按小写匹配（兼容中英文）。
3. **占位符更新**：`搜索报名人、手机号...` → `搜索报名人、手机号、企业...`。
4. **覆盖两端**：
   - Web 端：[activity-registration.html](activity-registration.html) `getFilteredRegistrations()`
   - H5 端（运营侧）：[h5-operator-activity/registrations.html](h5-operator-activity/registrations.html) `getFilteredList()`

### 涉及文件

- [activity-registration.html](activity-registration.html) — Web 端报名管理
- [h5-operator-activity/registrations.html](h5-operator-activity/registrations.html) — H5 运营侧报名管理

