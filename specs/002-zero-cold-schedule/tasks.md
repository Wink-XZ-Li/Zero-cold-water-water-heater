# Tasks: 零冷水定时（设置定时）

**Input**: Design documents from `/specs/002-zero-cold-schedule/`

**Prerequisites**: plan.md（✅）、spec.md（✅）、research.md（✅）、data-model.md（✅）、contracts/（✅）、quickstart.md（✅）

**Tests**: 未要求自动化单测；验收以涂鸦 IDE/真机云定时联调 + 米家信息结构对照（Ardot `57:4`/`57:5`）为准

**Organization**: 按 User Story（US1–US4）分组，便于独立实现与验证

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可并行（不同文件、无未完成依赖）
- **[Story]**：对应规格用户故事（US1–US4）
- 描述须含确切文件路径

---

## Phase 1: Setup（共享基建）

**Purpose**: 设计节点记录与目录骨架，不绑定业务交互

- [x] T001 [P] 将米家参考节点记入 `docs/design/figma-nodes.md`（或新建 `docs/design/schedule-nodes.md`）：列表 `57:5`、编辑 `57:4`、入口参考 `57:6`；注明交互权威为米家截图、视觉用 001 主题
- [x] T002 [P] 创建目录骨架：`src/pages/zero-cold-schedule/`、`src/pages/zero-cold-schedule-edit/`、`src/components/schedule-group-item/`（可先空 `index.tsx` + `index.module.less` + 页面 `index.config.ts`）
- [x] T003 [P] 扩展 `src/i18n/strings.ts`：定时列表/时间段定时/重复/开启/关闭/通知/删除确认/空态/半组异常/保存失败等中英文案（`isAppPush` 默认关的说明可含）

**Checkpoint**: 目录与文案键就绪

---

## Phase 2: Foundational（阻塞性基础）

**Purpose**: Timer API 封装、成组工具、路由 — **所有故事开始前必须完成**

**⚠️ CRITICAL**: 未完成本阶段不得开始 US1–US4 页面业务

- [x] T004 实现 `src/api/timer.ts`：Promise 封装 `syncTimerTask` / `addTimer` / `updateTimer` / `updateTimerStatus` / `removeTimer`（`device` from `@ray-js/ray`；入参含 `deviceId` + `category`）
- [x] T005 实现 `src/utils/timer-group.ts`：常量 `TIMER_CATEGORY=zc_schedule`、`ZC_ALWAYS_ON_DP_ID="104"`；`createAliasName`；`pairTimers`/`toTimerGroups`；`loops` 校验与中文摘要；`startTime!==endTime` 校验；孤儿检测（见 `data-model.md` / `contracts/timer-group.md`）
- [x] T006 实现 `src/hooks/useTimerGroups.ts`：拉取 sync → 归组 → loading/error/refresh；暴露 groups 列表
- [x] T007 更新 `src/routes.config.ts`：注册 `/zero-cold-schedule` → `pages/zero-cold-schedule/index`、`/zero-cold-schedule-edit` → `pages/zero-cold-schedule-edit/index`；移除或重定向旧 `zero-cold-placeholder`
- [x] T008 更新 `src/components/zero-cold-entry/index.tsx`：点击「零冷水预热」`navigateTo` 定时列表（不再进占位页）；保留首页开关写 `once_zero_cold` 的既有行为除非与列表冲突（开关与入口分行已存在则只改预热行导航）

**Checkpoint**: 可从首页进入空列表壳；API/工具可在控制台调用

---

## Phase 3: User Story 1 — 查看定时组列表（P1）🎯 MVP 切片 A

**Goal**: 列表展示成组时段、重复摘要、空态；可返回首页

**Independent Test**: 云端预置一对同 aliasName Timer 后，打开列表可见一行 `HH:mm - HH:mm` 与 loops 摘要

### Implementation for User Story 1

- [x] T009 [P] [US1] 实现列表行组件 `src/components/schedule-group-item/index.tsx` + `index.module.less`（时段主文案、开启时段|星期副文案；开关槽位可先只读占位，US1 可不接写）
- [x] T010 [US1] 实现列表页 `src/pages/zero-cold-schedule/index.tsx` + `index.module.less` + `index.config.ts`：NavBar「定时列表」、ScrollView、`useTimerGroups` 渲染、空态、加载/错误 Toast；FAB「+」可先跳转编辑页 create（若 US2 未就绪则 disable 并注释）
- [x] T011 [US1] 列表页返回：`navigateBack`；孤儿组展示异常样式/文案（不可当完整组）

**Checkpoint**: US1 可独立演示列表只读

---

## Phase 4: User Story 1 续 — 列表开关（P1）

**Goal**: 列表开关成对 `updateTimerStatus`

**Independent Test**: 拨动开关后两侧 status 一致，sync 复核

### Implementation

- [x] T012 [US1] 在 `src/components/schedule-group-item/index.tsx` 与列表页接通开关：对 `startTimerId`/`endTimerId` 成对调用 `updateTimerStatus`；失败 Toast 并 `refresh`
- [x] T013 [US1] 完善 FAB 导航至编辑页：`navigateTo` `/pages/zero-cold-schedule-edit/index?mode=create`

**Checkpoint**: 列表可读 + 可开关

---

## Phase 5: User Story 2 — 新增定时组（P1）🎯 MVP 闭环

**Goal**: 编辑页创建成对 Timer（104 true/false），`isAppPush` 默认 false

**Independent Test**: 空列表新增一组后 sync 得两条同 aliasName 记录

### Implementation for User Story 2

- [x] T014 [US2] 实现编辑页骨架 `src/pages/zero-cold-schedule-edit/index.tsx` + `index.module.less` + `index.config.ts`：NavBar（取消/保存）、表单区：重复、开启时间、关闭时间、执行通知 Switch（默认 false）
- [x] T015 [P] [US2] 实现星期多选与时间选择 UI（优先 SmartUI Picker/Popup）于编辑页或 `src/components/schedule-edit-form/`；`loops` 至少一天；`start≠end`
- [x] T016 [US2] 实现新增保存：`createAliasName` → 先 `addTimer` 开始（dps 104 true）再 `addTimer` 结束（false）；结束失败则 `removeTimer` 开始并提示；成功 `navigateBack` 并刷新列表
- [x] T017 [US2] 校验失败（同时间/未选日）禁止提交并 Toast（文案走 i18n）

**Checkpoint**: US1+US2 形成「看列表 + 新增」MVP

---

## Phase 6: User Story 3 — 编辑定时组（P1）

**Goal**: 点击组进入编辑，成对 `updateTimer`

**Independent Test**: 改结束时间保存后列表与 sync 一致

### Implementation for User Story 3

- [x] T018 [US3] 列表行点击：`navigateTo` edit 页带 `mode=edit&aliasName=`
- [x] T019 [US3] 编辑页 `mode=edit`：按 aliasName 从 `useTimerGroups`/sync 预填；保存时两次 `updateTimer`（保持 aliasName 与成对 dps）；单侧失败则 sync 纠偏 + Toast
- [x] T020 [US3] 编辑页取消：不写云端，`navigateBack`

**Checkpoint**: 增改查开关闭环（除删除）

---

## Phase 7: User Story 4 — 删除定时组（P2）

**Goal**: 左滑或等价删除 + **二次确认** 后成对 `removeTimer`

**Independent Test**: 确认删除后 sync 无该 aliasName；取消删除无 API 调用

### Implementation for User Story 4

- [x] T021 [US4] 列表项左滑删除或「删除」操作入口（手势不稳则用明确按钮）；点击后 SmartUI `Dialog` 二次确认（确认/取消文案 i18n）
- [x] T022 [US4] 确认后成对 `removeTimer`；第二侧失败 Toast + refresh；取消不调用 API
- [x] T023 [US4] （可选）孤儿清理入口：仅异常组显示「清理」，成对尝试 remove

**Checkpoint**: US1–US4 主路径完成

---

## Phase 8: Polish（横切）

**Purpose**: 门禁、文档、对照

- [x] T024 [P] 运行 `npm run lint`，修复 `src/` 下本 feature 改动问题
- [x] T025 [P] 运行 `npm run build`（`ray build --target tuya`）确保通过
- [x] T026 按 `quickstart.md` 手测 SC-001–SC-003；记录 `specs/002-zero-cold-schedule/checklists/manual-qa.md`（中文）
- [x] T027 对照米家列表/编辑信息结构更新 `docs/design/ui-diff.md`（或 `docs/design/schedule-ui-diff.md`）SC-004
- [x] T028 更新 `CODEBUDDY.md` SPECKIT 段指向本 `tasks.md` 完成状态；中文 commit 本阶段变更
- [x] T029 删除或确认无引用 `src/pages/zero-cold-placeholder/` 残留路由与死代码

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** → 无依赖
- **Phase 2 Foundational** → 依赖 Phase 1；**阻塞**所有 User Story
- **Phase 3–4 US1** → 依赖 Phase 2；列表 MVP
- **Phase 5 US2** → 依赖 Phase 2；建议在列表壳（T010）之后
- **Phase 6 US3** → 依赖 US2 编辑页骨架（T014）
- **Phase 7 US4** → 依赖列表行组件（T009）与 Dialog
- **Phase 8 Polish** → 依赖计划交付的故事完成

### User Story Dependencies

| Story | 依赖 |
|-------|------|
| US1 列表 | 仅 Foundational |
| US2 新增 | Foundational + 列表壳（可返回刷新） |
| US3 编辑 | US2 编辑页 |
| US4 删除 | US1 列表行 |

### Parallel Opportunities

- T001 / T002 / T003 可并行
- T009 与 T010 部分可并行（先约定 props）
- T014 / T015 可并行
- T024 / T025 可并行

---

## Parallel Example: User Story 2

```bash
Task: "实现编辑页骨架 src/pages/zero-cold-schedule-edit/..."
Task: "实现星期/时间选择 UI schedule-edit-form 或内联"
# 然后串行：
Task: "实现成对 addTimer 保存与回滚"
```

---

## Implementation Strategy

### MVP First

1. Phase 1–2 → Phase 3–5（列表 + 新增）
2. **停止并验收** SC-001 新增路径
3. 再做编辑、删除、Polish

### Suggested MVP Scope

**T001–T017**（Setup + Foundational + US1 列表/开关 + US2 新增）

### Notes

- 提交信息遵守宪章：中文 subject/body
- 每次改文件前先 `read` 最新内容
- 禁止 `openTimerPage` 主路径；禁止 Timer.dps 写 104 以外业务 DP（本 feature）
- 不要实现 003/004 范围能力
