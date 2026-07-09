/* ============================================================================
 * 问卷管理 — 共享数据与种子逻辑
 * 被 questionnaire-list.html / questionnaire-create.html / questionnaire-detail.html /
 *    questionnaire-fill.html 引用
 * 用法（页面 inline script 中）：
 *   QM.seedIfEmpty();   // sessionStorage 为空时注入默认 5 份问卷 + 模拟答卷
 *   QM.STORAGE_KEY_Q    // 'questionnaires_data'
 *   QM.STORAGE_KEY_R    // 'questionnaire_responses'
 * ============================================================================ */
(function (global) {
    'use strict';

    const STORAGE_KEY_Q = 'questionnaires_data';
    const STORAGE_KEY_R = 'questionnaire_responses';

    /* ---------- 默认问卷数据（5 条，覆盖各种状态） ---------- */
    const defaultQuestionnaires = [
        {
            id: 'q_demo_001', title: '2024 上海数据开放创新应用大赛 参赛意向调研',
            description: '为更好筹备本届大赛，请您花 2 分钟填写以下信息。',
            cover: '', category: 'tech', categoryName: '科技创新', status: 'collecting',
            fields: [
                { id: 'f_1', type: 'text', label: '姓名', required: true, placeholder: '请输入您的真实姓名', maxLength: 20 },
                { id: 'f_2', type: 'radio', label: '您的角色', required: true, options: [
                    { id: 'o_a', label: '开发者' }, { id: 'o_b', label: '产品经理' }, { id: 'o_c', label: '设计师' }, { id: 'o_d', label: '其他' }
                ]},
                { id: 'f_3', type: 'checkbox', label: '您感兴趣的赛道（多选）', required: true, maxSelected: 3, options: [
                    { id: 'o_a', label: '智慧城市' }, { id: 'o_b', label: '金融科技' }, { id: 'o_c', label: '医疗健康' }, { id: 'o_d', label: '工业制造' }, { id: 'o_e', label: '教育文化' }
                ]},
                { id: 'f_4', type: 'textarea', label: '对本届大赛的建议', required: false, maxLength: 500 },
                { id: 'f_5', type: 'file', label: '上传个人简历 / 作品集（可选）', required: false, accept: '.pdf,.png,.jpg,.zip', maxSizeMB: 20, maxFiles: 1 }
            ],
            settings: { anonymous: false, allowMultiple: false, collectUserInfo: true, deadline: '2026-09-30 23:59', thankYouMessage: '感谢您的参与！' },
            createdBy: '张明远', createdAt: '2026-07-09T10:30:00+08:00', updatedAt: '2026-07-09T10:30:00+08:00',
            publishedAt: '2026-07-09T11:00:00+08:00', responseCount: 5
        },
        {
            id: 'q_demo_002', title: '员工培训需求调研',
            description: '了解大家对培训内容、形式、频率的真实想法，帮我们做得更好。',
            cover: '', category: 'education', categoryName: '教育培训', status: 'collecting',
            fields: [
                { id: 'f_1', type: 'radio', label: '您希望的培训频率', required: true, options: [
                    { id: 'o_a', label: '每周一次' }, { id: 'o_b', label: '每月一次' }, { id: 'o_c', label: '每季度一次' }, { id: 'o_d', label: '不一定' }
                ]},
                { id: 'f_2', type: 'checkbox', label: '您感兴趣的培训方向', required: true, options: [
                    { id: 'o_a', label: '专业技能' }, { id: 'o_b', label: '管理能力' }, { id: 'o_c', label: '通用素养' }, { id: 'o_d', label: '行业前沿' }
                ]},
                { id: 'f_3', type: 'textarea', label: '其他建议', required: false, maxLength: 300 }
            ],
            settings: { anonymous: true, allowMultiple: false, collectUserInfo: false, deadline: '2026-08-31 23:59', thankYouMessage: '已收到，谢谢！' },
            createdBy: '李晓华', createdAt: '2026-07-05T09:00:00+08:00', updatedAt: '2026-07-05T09:00:00+08:00',
            publishedAt: '2026-07-05T10:00:00+08:00', responseCount: 6
        },
        {
            id: 'q_demo_003', title: '2025 春节团建活动报名',
            description: '为了让大家度过一个难忘的春节，请填写以下信息。',
            cover: '', category: 'culture', categoryName: '文化活动', status: 'draft',
            fields: [
                { id: 'f_1', type: 'text', label: '姓名', required: true, maxLength: 20 },
                { id: 'f_2', type: 'radio', label: '参加意向', required: true, options: [
                    { id: 'o_a', label: '一定参加' }, { id: 'o_b', label: '可能参加' }, { id: 'o_c', label: '不参加' }
                ]}
            ],
            settings: { anonymous: false, allowMultiple: false, collectUserInfo: true, deadline: '', thankYouMessage: '感谢您的反馈。' },
            createdBy: '王建国', createdAt: '2026-07-08T15:00:00+08:00', updatedAt: '2026-07-08T15:00:00+08:00',
            publishedAt: null, responseCount: 0
        },
        {
            id: 'q_demo_004', title: '团建活动满意度反馈',
            description: '感谢您参加此次团建，请花费 1 分钟告诉我们您的真实感受。',
            cover: '', category: 'culture', categoryName: '文化活动', status: 'ended',
            fields: [
                { id: 'f_1', type: 'radio', label: '整体满意度', required: true, options: [
                    { id: 'o_a', label: '非常满意' }, { id: 'o_b', label: '满意' }, { id: 'o_c', label: '一般' }, { id: 'o_d', label: '不满意' }
                ]},
                { id: 'f_2', type: 'textarea', label: '改进建议', required: false, maxLength: 500 }
            ],
            settings: { anonymous: true, allowMultiple: false, collectUserInfo: false, deadline: '2026-06-30 23:59', thankYouMessage: '' },
            createdBy: '陈思远', createdAt: '2026-06-01T10:00:00+08:00', updatedAt: '2026-06-30T10:00:00+08:00',
            publishedAt: '2026-06-01T10:00:00+08:00', responseCount: 4
        },
        {
            id: 'q_demo_005', title: '网络安全宣传周反馈',
            description: '已结束 — 收集大家对网络安全周活动的反馈。',
            cover: '', category: 'tech', categoryName: '科技创新', status: 'stopped',
            fields: [
                { id: 'f_1', type: 'text', label: '所在部门', required: true, maxLength: 30 },
                { id: 'f_2', type: 'radio', label: '是否参与线下活动', required: true, options: [
                    { id: 'o_a', label: '是' }, { id: 'o_b', label: '否' }
                ]}
            ],
            settings: { anonymous: false, allowMultiple: false, collectUserInfo: true, deadline: '', thankYouMessage: '' },
            createdBy: '张明远', createdAt: '2026-04-01T09:00:00+08:00', updatedAt: '2026-04-20T09:00:00+08:00',
            publishedAt: '2026-04-01T10:00:00+08:00', responseCount: 0
        }
    ];

    /* ---------- 模拟答卷数据集（按问卷 id 决定生成数量） ---------- */
    const RESPONSE_COUNTS = {
        'q_demo_001': 5,
        'q_demo_002': 6,
        'q_demo_003': 0,
        'q_demo_004': 4,
        'q_demo_005': 0
    };

    const NAMES = ['李晓华', '王磊', '陈思远', '赵敏', '周明杰', '吴泽', '刘洋'];
    const COMMENTS = ['很满意，期待下次！', '建议增加更多互动环节。', '整体不错，有些细节可以优化。', '挺好的活动。', '非常棒！', '收获很多，希望继续举办。', '内容丰富，体验良好。'];
    const DEVICES = ['Chrome / Windows', 'Safari / macOS', 'Chrome / Android', 'Edge / Windows', '微信内置 / iOS'];

    function pad(n) { return String(n).padStart(2, '0'); }
    function randomDateOffset(daysAgo) {
        const d = new Date(Date.now() - daysAgo * 86400000);
        d.setHours(9 + (daysAgo % 8), (daysAgo * 13) % 60, 0, 0);
        return d.toISOString();
    }
    function last4Phone(seed) { return '138****' + String(1000 + (seed % 9000)).padStart(4, '0'); }

    function generateAnswers(q, idx) {
        const a = {};
        (q.fields || []).forEach(f => {
            if (f.type === 'text') {
                a[f.id] = NAMES[idx % NAMES.length];
            } else if (f.type === 'textarea') {
                a[f.id] = COMMENTS[(idx + q.id.length) % COMMENTS.length];
            } else if (f.type === 'radio' || f.type === 'select') {
                const opts = f.options || [];
                if (opts.length > 0) a[f.id] = opts[(idx + q.id.length) % opts.length].id;
            } else if (f.type === 'checkbox') {
                const opts = f.options || [];
                const seen = new Set();
                const sel = [];
                let j = 0;
                // 至少选 1 项，最多不超过 maxSelected 或总项数
                const cap = Math.min(opts.length, f.maxSelected || opts.length);
                while (sel.length < cap && j < opts.length * 2) {
                    const k = (idx + j) % opts.length;
                    if (!seen.has(k)) { seen.add(k); sel.push(opts[k].id); }
                    j++;
                }
                a[f.id] = sel;
            } else if (f.type === 'file') {
                // 仅第一条数据有附件（增强 demo 真实性）
                if (idx === 0) {
                    const names = ['liuxh_resume.pdf', 'portfolio.zip', 'avatar.png', 'work.docx'];
                    a[f.id] = [{ name: names[idx % names.length], size: 245000 + idx * 30000 }];
                } else {
                    a[f.id] = [];
                }
            }
        });
        return a;
    }

    function generateOneResponse(q, idx) {
        const withUser = q.settings && q.settings.collectUserInfo && !q.settings.anonymous;
        return {
            id: 'r_' + q.id + '_' + pad(idx),
            questionnaireId: q.id,
            submittedAt: randomDateOffset(idx),
            durationSec: 60 + (idx * 23) % 180,
            user: withUser ? {
                name: NAMES[idx % NAMES.length],
                phone: last4Phone(idx + q.id.length)
            } : null,
            device: DEVICES[idx % DEVICES.length],
            answers: generateAnswers(q, idx),
            status: 'completed'
        };
    }

    function generateMockResponses(qList) {
        const out = [];
        qList.forEach(q => {
            const count = RESPONSE_COUNTS[q.id] || 0;
            for (let i = 0; i < count; i++) out.push(generateOneResponse(q, i));
        });
        return out;
    }

    /* ---------- 种子：sessionStorage 空时注入默认数据 ---------- */
    function seedIfEmpty() {
        let qs = [];
        let rs = [];
        try { qs = JSON.parse(sessionStorage.getItem(STORAGE_KEY_Q) || '[]'); } catch (e) {}
        try { rs = JSON.parse(sessionStorage.getItem(STORAGE_KEY_R) || '[]'); } catch (e) {}

        if (!Array.isArray(qs) || qs.length === 0) {
            try { sessionStorage.setItem(STORAGE_KEY_Q, JSON.stringify(defaultQuestionnaires)); } catch (e) {}
            qs = JSON.parse(JSON.stringify(defaultQuestionnaires));
        }
        if (!Array.isArray(rs) || rs.length === 0) {
            const generated = generateMockResponses(qs);
            try { sessionStorage.setItem(STORAGE_KEY_R, JSON.stringify(generated)); } catch (e) {}
            rs = generated;
        }
        return { qs, rs };
    }

    /* ---------- 暴露全局 ---------- */
    global.QM = {
        STORAGE_KEY_Q: STORAGE_KEY_Q,
        STORAGE_KEY_R: STORAGE_KEY_R,
        defaultQuestionnaires: defaultQuestionnaires,
        seedIfEmpty: seedIfEmpty,
        generateMockResponses: generateMockResponses
    };

})(window);
