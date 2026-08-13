# Tasks: 能耗报告曲线与统计

**Input**: Design documents from `/specs/004-energy-charts/`

**Prerequisites**: plan.md（✅）、spec.md（✅）、research.md（✅）、data-model.md（✅）、contracts/（✅）、quickstart.md（✅）

**Tests**: 未要求自动化单测；验收以涂鸦 IDE 联调统计 + Ardot `55:1044` 对照为准

**Organization**: 按 User Story（US1–US3）分组

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可并行（不同文件、无未完成依赖）
- **[Story]**：对应规格用户故事（US1–US3）
- 描述须含确切文件路径

---

## Phase 1: Setup（共享基建）

**Purpose**: 依赖与设计对照

- [x] T001 [P] 安装 `@ray-js/stat-charts` 与 `dayjs` 到根目录 `package.json` / lockfile
- [x] T002 [P] 在 `docs/design/figma-nodes.md`（或等价设计索引）确认/补全能耗报告节点 `55:1044`；注明截图目录 `.tmp/ardot-screenshots/004/`
- [x] T003 [P] 扩展 `src/i18n/strings.ts`：加载中、暂无数据、获取失败等状态文案；保留用水/用气、日周月年、误差说明；去掉对「后续版本/尚未开放」作为主路径文案的依赖（可留 key 但页面不再展示误导横幅）

**Checkpoint**: 依赖可解析；文案键就绪

---

## Phase 2: Foundational（阻塞性基础）

**Purpose**: 锚点/映射工具 — **故事实现前必须完成**

**⚠️ CRITICAL**: 未完成本阶段不得开始图表绑定

- [x] T004 确认 `src/devices/schema.ts` 含 `water_total`（id 25）与 `gas_consumption`（id 24）；只读，不新增写路径
- [x] T005 实现 `src/pages/energy-report/hooks/useEnergyAnchor.ts`：按 period 计算 start/end、`chartRange`（`1hour`/`1day`/`1month`）、日期标签、前进/后退（禁止越过今天）
- [x] T006 [P] 实现 `src/pages/energy-report/energyMetric.ts`（或同目录常量模块）：metric→`dpId`/`unit`/`titleKey` 映射（water=25/L，gas=24/m3）

**Checkpoint**: 日期窗口与 DP 映射可被页面引用

---

## Phase 3: User Story 1 — 日维度用水量曲线（P1）🎯 MVP

**Goal**: 默认用水+日；加载当日统计并绘图或空态；日期左右切换刷新

**Independent Test**: 仅验证用水量+日：进入页有图表/空态；‹ › 换日刷新；失败可理解且不崩溃

### Implementation for User Story 1

- [x] T007 [US1] 重构 `src/pages/energy-report/index.tsx`：metric/period/anchor 为可交互 state；默认 water+day；绑定日期导航到 `useEnergyAnchor`
- [x] T008 [US1] 在 `src/pages/energy-report/index.tsx` 集成 `StatCharts`（`@ray-js/stat-charts`）：`devId`、`dpList` water id 25、`type="sum"`、`chartType` line/line-area、日窗口 `range=1hour`
- [x] T009 [US1] 更新 `src/pages/energy-report/index.module.less`：图表容器高度/留白对齐 `55:1044`；复用 001 CSS 变量
- [x] T010 [US1] 实现 loading / empty / error 可区分展示（StatCharts 能力 + 页面文案兜底）；禁止伪造随机序列

**Checkpoint**: US1 可独立演示日用水曲线/空态

---

## Phase 4: User Story 2 — 用气量与周期切换（P1）

**Goal**: 用水/用气、日/周/月/年切换；标题与数据维度随之变化；用水保留 ±15% 说明

**Independent Test**: 无数据仍可切换控件并见空态/标题变化；有数据时序列与 metric/period 一致

### Implementation for User Story 2

- [x] T011 [US2] 在 `src/pages/energy-report/index.tsx` 启用 metric 切换（保持 period）；切换时 `dpId`/unit/标题更新
- [x] T012 [US2] 在 `src/pages/energy-report/index.tsx` 启用 period 日/周/月/年；映射到 StatCharts `range` 与日期窗口（见 `contracts/statistics-api.md`）
- [x] T013 [US2] 确保页脚误差说明在用水量视图可见；用气标题单位为 m³
- [x] T014 [US2] 快速连续切换时以最后一次选择为准（key/debounce 或忽略过期，按 StatCharts debounce 配置）

**Checkpoint**: US1+US2 构成完整主路径

---

## Phase 5: User Story 3 — 去掉伪装横幅与体验打磨（P2）

**Goal**: 有能力后不再展示「后续版本」误导横幅；加载反馈；返回首页状态正确

**Independent Test**: 有数据时无误导横幅；加载中可感知；返回首页主控正常

### Implementation for User Story 3

- [x] T015 [US3] 从 `src/pages/energy-report/index.tsx` 移除「统计尚未可用/后续版本」横幅主路径展示
- [x] T016 [US3] 确认加载中指示（StatCharts loading 或页面占位）无长时间空白无反馈
- [x] T017 [US3] 确认 `navigateBack` 不写入任何 DP、不破坏首页状态（只读统计）

**Checkpoint**: 体验与 SC-004 对齐

---

## Phase 6: Polish（横切）

**Purpose**: 门禁、文档、对照

- [x] T018 [P] 运行 `npm run lint`，修复本 feature `src/` 改动问题
- [x] T019 [P] 运行 `npm run build`（`ray build --target tuya`）确保通过
- [x] T020 按 `quickstart.md` 手测要点写入 `specs/004-energy-charts/checklists/manual-qa.md`（中文）
- [x] T021 对照 Ardot `55:1044` 更新 `docs/design/ui-diff.md` 或新建 `docs/design/energy-charts-ui-diff.md`（SC-004）
- [x] T022 更新 `CODEBUDDY.md` / `HANDOFF.md` 反映实现完成状态

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** → 无依赖
- **Phase 2 Foundational** → 依赖 Phase 1；阻塞图表绑定
- **Phase 3 US1** → 依赖 Phase 2
- **Phase 4 US2** → 依赖 US1 图表骨架（同页增强）
- **Phase 5 US3** → 依赖 US1/US2 主路径
- **Phase 6 Polish** → 依赖交付故事完成

### User Story Dependencies

| Story | 依赖 |
|-------|------|
| US1 日用水 | Setup + Foundational |
| US2 用气/周期 | US1 图表集成 |
| US3 体验打磨 | US1（横幅移除可与 US1 同改） |

### Parallel Opportunities

- T001 / T002 / T003 可并行
- T005 / T006 可并行（不同文件）
- T018 / T019 可并行

---

## Parallel Example: Setup

```bash
Task: "安装 @ray-js/stat-charts 与 dayjs"
Task: "扩展 i18n 状态文案"
Task: "补全设计节点索引 55:1044"
```

---

## Implementation Strategy

### MVP First（仅 US1）

1. Setup + Foundational
2. US1 日用水曲线
3. **STOP and VALIDATE** 后再做 US2/US3

### Suggested MVP Scope

User Story 1（日维度用水量）

### Task Count

- Total: 22
- Setup: 3 | Foundational: 3 | US1: 4 | US2: 4 | US3: 3 | Polish: 5

---

## Notes

- FR-008 = 方案 A（统计 API + Charts）；禁止方案 B 冒充日曲线
- 不改 002 定时 / 003 瀑布浴主路径
- 可选 after_tasks git commit hook：由用户决定是否提交
