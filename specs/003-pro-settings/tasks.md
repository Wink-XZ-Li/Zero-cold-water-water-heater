# Tasks: ST1 Pro 专业参数（瀑布浴等）

**Input**: Design documents from `/specs/003-pro-settings/`

**Prerequisites**: plan.md（✅）、spec.md（✅）、research.md（✅）、data-model.md（✅）、contracts/（✅）、quickstart.md（✅）

**Tests**: 未要求自动化单测；验收以涂鸦 IDE/虚拟设备联调 `turbo` + Ardot `55:864`/`55:954`/`55:1044` 信息结构对照为准

**Organization**: 按 User Story（US1–US2）分组

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可并行（不同文件、无未完成依赖）
- **[Story]**：对应规格用户故事（US1–US2）
- 描述须含确切文件路径

---

## Phase 1: Setup（共享基建）

**Purpose**: 设计节点与目录/文案骨架

- [x] T001 [P] 在 `docs/design/figma-nodes.md` 确认/补全 003 节点：瀑布浴+能耗入口 `55:864`/`55:954`、报告壳 `55:1044`；注明视觉用 001 token
- [x] T002 [P] 创建目录骨架：`src/components/waterfall-bath-entry/`、`src/components/energy-report-entry/`、`src/pages/energy-report/`（可先空 `index.tsx` + `index.module.less` + 页面 `index.config.ts`）
- [x] T003 [P] 扩展 `src/i18n/strings.ts`：瀑布浴标题/副文案、能耗报告入口/页标题、空态「统计尚未可用」、用水/用气、日周月年、误差说明等中英文案

**Checkpoint**: 目录与文案键就绪

---

## Phase 2: Foundational（阻塞性基础）

**Purpose**: 路由注册 — **故事页面前必须完成**

**⚠️ CRITICAL**: 未完成本阶段不得开始 US2 页面导航；US1 可不依赖路由但建议同阶段完成

- [x] T004 更新 `src/routes.config.ts`：注册 `/energy-report` → `pages/energy-report/index`
- [x] T005 确认 `src/devices/schema.ts` 已含 `turbo`（id 34 bool rw）；本 feature **不**新增变升等 Out of Scope DP 绑定

**Checkpoint**: 路由可解析到空报告页；schema 可用

---

## Phase 3: User Story 1 — 瀑布浴开关（P1）🎯 MVP

**Goal**: 首页展示瀑布浴行，开关读写 `turbo`；离线/关机禁用

**Independent Test**: 开机在线拨动瀑布浴，虚拟设备 `turbo` 与 UI 一致；关机/离线不可假成功

### Implementation for User Story 1

- [x] T006 [P] [US1] 实现 `src/components/waterfall-bath-entry/index.tsx` + `index.module.less`：标题「瀑布浴」、副文案「开启后可增加用水时的水压」、SmartUI `Switch`；`useProps(p => !!p.turbo)` + `actions.turbo.set`；接受 `disabled`；样式对齐 `zero-cold-entry` 行卡
- [x] T007 [US1] 更新 `src/pages/home/index.tsx`：在 `ZeroColdEntry` 之后挂载 `WaterfallBathEntry`，传入与首页一致的 `disabled`（离线等）
- [x] T008 [US1] 确认电源关闭时禁用策略与首页主控一致（若现有仅 `!online`，则瀑布浴与零冷水同行禁用；必要时在 home 组合 `!online || !switch` 并只影响可控行，**不**改 001/002 既有零冷水逻辑除非必要）

**Checkpoint**: US1 可独立演示瀑布浴开关

---

## Phase 4: User Story 2 — 能耗报告入口与页面壳（P2）

**Goal**: 首页能耗报告入口 → 页面壳（空图表结构）；可返回

**Independent Test**: 点击入口进入壳页再返回，连续 3 次无卡死；壳页无真实数据请求

### Implementation for User Story 2

- [x] T009 [P] [US2] 实现 `src/components/energy-report-entry/index.tsx` + `index.module.less`：标题「能耗报告」+ 右箭头；`navigateTo` `/pages/energy-report/index`；样式对齐列表行
- [x] T010 [US2] 更新 `src/pages/home/index.tsx`：在瀑布浴行之后挂载 `EnergyReportEntry`
- [x] T011 [US2] 实现 `src/pages/energy-report/index.tsx` + `index.module.less` + `index.config.ts`：NavBar「能耗报告」、`navigateBack`；用水/用气切换位（禁用或仅本地态）；日周月年（默认日，禁用数据）；日期行；空图表区；误差说明只读；空态提示统计尚未可用（对照 `55:1044`，**不**引入 Charts 数据绑定）
- [x] T012 [US2] 页面壳禁止任何用量云查询/DP 写入；切换控件不得伪装为已完成统计

**Checkpoint**: US1+US2 形成「瀑布浴 + 报告壳」闭环

---

## Phase 5: Polish（横切）

**Purpose**: 门禁、文档、对照

- [x] T013 [P] 运行 `npm run lint`，修复本 feature `src/` 改动问题
- [x] T014 [P] 运行 `npm run build`（`ray build --target tuya`）确保通过
- [x] T015 按 `quickstart.md` 手测 SC-001–SC-003；记录 `specs/003-pro-settings/checklists/manual-qa.md`（中文）
- [x] T016 对照 Ardot 更新 `docs/design/ui-diff.md` 或新建 `docs/design/pro-settings-ui-diff.md`（SC-004）
- [x] T017 更新 `CODEBUDDY.md` SPECKIT 段指向本 `tasks.md` 完成状态；中文 commit 本阶段变更

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** → 无依赖
- **Phase 2 Foundational** → 依赖 Phase 1；阻塞 US2 导航；建议 US1 前完成 T005
- **Phase 3 US1** → 依赖 Phase 1（组件目录/i18n）；可与 T004 并行后合并 home
- **Phase 4 US2** → 依赖 Phase 2 路由 + Phase 1；可与 US1 并行开发组件，最后统一挂 home
- **Phase 5 Polish** → 依赖交付的故事完成

### User Story Dependencies

| Story | 依赖 |
|-------|------|
| US1 瀑布浴 | Setup + schema 确认 |
| US2 报告壳 | Setup + 路由；不依赖 turbo 读写成功 |

### Parallel Opportunities

- T001 / T002 / T003 可并行
- T006 与 T009 可并行（不同组件目录）
- T013 / T014 可并行

---

## Parallel Example: User Story 1 + 2 组件

```bash
Task: "实现 waterfall-bath-entry ..."
Task: "实现 energy-report-entry ..."
# 然后串行挂到 home，并实现 energy-report 页面壳
```

---

## Implementation Strategy

### MVP First

1. Phase 1–2 → Phase 3（仅瀑布浴）
2. **停止并验收** SC-001/SC-002
3. 再做 US2 报告壳与 Polish

### Suggested MVP Scope

**T001–T008**（Setup + Foundational + US1）

### Notes

- 提交信息遵守宪章：中文 subject/body
- 禁止实现变升/浴缸流量/回水温差/点动/保温时长
- 禁止报告页真实曲线与 Charts 数据绑定（004）
- 不要改写 002 定时主路径
