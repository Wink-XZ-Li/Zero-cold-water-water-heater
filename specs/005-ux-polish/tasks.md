# Tasks: 体验与视觉打磨

**Input**: Design documents from `/specs/005-ux-polish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 规格未要求自动化测试；以 lint/build + IDE 手测 + Ardot 对照为准

**Organization**: 按用户故事分组，便于独立交付

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无依赖）
- **[Story]**: US1–US4
- 描述含确切路径

---

## Phase 1: Setup

**Purpose**: 依赖与工作区就绪

- [x] T001 确认分支 `005-ux-polish` 基于 `dec73cc`；工作区不含无关提交意图
- [x] T002 安装 `@ray-js/svg` 并写入 `package.json` / lockfile

---

## Phase 2: Foundational

**Purpose**: 图标资源与共享约定，阻塞 US1/US2

**⚠️ CRITICAL**: US1/US2 前完成

- [x] T003 用 Ardot `export_nodes`（svg）导出模式矢量节点 `55:800`/`55:805`/`55:810`/`55:815` 与故障警示相关矢量至 `.tmp/` 或 `docs/design/exports/`，记录路径
- [x] T004 [P] 新增 `src/components/mode-icons/index.tsx`：四模式 Svg 组件（props: `active`/`disabled`/`size`），fill 走 CSS 变量色
- [x] T005 [P] 扩展 `src/i18n/strings.ts`：故障弹层标题/多故障拼接/确认按钮等文案（中英）

**Checkpoint**: Svg 依赖可用；图标组件可独立渲染

---

## Phase 3: User Story 1 - 模式图标对齐 (P1) 🎯 MVP

**Goal**: 四模式矢量图标替换文字占位

**Independent Test**: 首页模式区对照 `55:788`；切换模式选中态正确；DP 逻辑不变

- [x] T006 [US1] 改造 `src/components/mode-selector/index.tsx`：接入 `mode-icons`，移除 Eco/厨/浴/温文字主图标
- [x] T007 [US1] 调整 `src/components/mode-selector/index.module.less` 选中/未选中图标盒与颜色对齐合约 `contracts/mode-icons.md`

**Checkpoint**: SC-001 可验收

---

## Phase 4: User Story 2 - 故障提示可信 (P1)

**Goal**: 故障条对齐设计；点击就地摘要；无假手册导航

**Independent Test**: 模拟无/单/多故障；点击不跳转新页

- [x] T008 [US2] 改造 `src/components/fault-banner/index.tsx`：矢量警示图标；点击 `showModal`/`Dialog` 列出全部故障摘要
- [x] T009 [US2] 调整 `src/components/fault-banner/index.module.less` 对齐 `55:781` / token

**Checkpoint**: SC-002 可验收

---

## Phase 5: User Story 3 - NavBar 与间距 (P2)

**Goal**: 四页内容壳间距统一；NavBar 返回一致

**Independent Test**: 首页与三子页边距对照；子页返回正常

- [x] T010 [P] [US3] 核对并统一 `src/pages/home/index.module.less` 与 `src/pages/energy-report/index.module.less` 内容壳 `padding`/`gap`
- [x] T011 [P] [US3] 统一 `src/pages/zero-cold-schedule/index.module.less` 与 `src/pages/zero-cold-schedule-edit/index.module.less` 内容壳间距
- [x] T012 [US3] 抽检四页 NavBar：`leftArrow`/`navigateBack` 行为一致；仅样式/壳层，不改定时与图表逻辑

**Checkpoint**: SC-003 可验收

---

## Phase 6: User Story 4 - ui-diff 清零 (P2)

**Goal**: B 范围开放差异归零

**Independent Test**: 审阅 `docs/design/ui-diff.md`

- [x] T013 [US4] 重写 `docs/design/ui-diff.md`：已对齐 / 已接受例外；关闭过时「瀑布浴/能耗未出」；开放项 0

**Checkpoint**: SC-004 可验收

---

## Phase 7: Polish

**Purpose**: 回归与文档

- [x] T014 跑 `yarn lint` 与 `yarn build`（或等价 `npm`/`npx ray build`）
- [x] T015 [P] 更新 `specs/005-ux-polish/checklists/manual-qa.md` 手测清单（模式/故障/边距/回归）
- [x] T016 对照 quickstart.md 勾选 SC-001–SC-005；必要时补 `CODEBUDDY.md` SPECKIT 状态为实现中/已实现

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 → Phase 2 → US1 / US2（可并行）→ US3 → US4 → Polish
- US3 不依赖图标完成，但建议在 US1/US2 后做，减少首页冲突
- US4 依赖 US1–US3 实际关闭项

### User Story Dependencies

- **US1**: Phase 2 后
- **US2**: Phase 2（T005）后；与 US1 并行
- **US3**: 与 US1/US2 弱相关，改不同 less 文件可并行
- **US4**: 建议最后

### Parallel Opportunities

```text
T004 || T005
T006–T007 (US1) || T008–T009 (US2)
T010 || T011
```

---

## Implementation Strategy

### MVP

1. T001–T007 → 模式图标可演示（US1）
2. 再接 US2 故障 → 核心观感完成

### Incremental

US1 → US2 → US3 → US4 → lint/build/手测清单

### Notes

- 中文 commit（用户要求时再提交）
- 禁止改 002 定时配对与 004 StatCharts 主路径
- 禁止米家色；复用 001 token
