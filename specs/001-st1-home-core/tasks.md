# Tasks: ST1 Pro 首页核心能力

**Input**: Design documents from `/specs/001-st1-home-core/`

**Prerequisites**: plan.md（✅）、spec.md（✅）、research.md（✅）、data-model.md（✅）、contracts/（✅）、quickstart.md（✅）

**Tests**: 未要求自动化单测；验收以涂鸦虚拟设备联调 + Figma/`get_screenshot` + 用户 IDE 截图对照为准

**Organization**: 按 User Story 分组，便于独立实现与验证

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可并行（不同文件、无未完成依赖）
- **[Story]**：对应规格用户故事（US1–US4）
- 描述须含确切文件路径

---

## Phase 1: Setup（共享基建）

**Purpose**: 产品资料入库、Figma 门禁与目录骨架，不绑定业务交互

- [x] T001 将产品描述文件拷贝为 `docs/product/Debugfile_ST1_Pro.json`（源：Downloads 中 ST1 Pro 20260812 Debugfile），并在 `docs/product/README.md` 注明 Pro_Key `a3cbezgki7lkl8rr`
- [x] T002 [P] 通过 Ardot MCP 访问设计稿（原 Figma fileKey `vkmMZjILzrheBxPiXO8kF4` / Ardot `714289030938546`）；首页 node 记录于 `docs/design/figma-nodes.md`
- [x] T003 [P] 创建组件/页面目录骨架：`src/components/{power-switch,mode-selector,temp-control,work-state-display,fault-banner,flame-flow-status,zero-cold-entry}/` 与 `src/pages/zero-cold-placeholder/`（可先放空 `index.tsx` + `index.module.less` 占位）
- [x] T004 [P] 更新 `project.tuya.json` 展示名称为伊莱克斯 ST1 Pro / 零冷水热水器相关命名（保持 `type: panel-app` 与依赖硬约束不变）

**Checkpoint**: 资料与目录就绪，Figma 可拉取

---

## Phase 2: Foundational（阻塞性基础 — 对应 US4 物模型对齐）

**Purpose**: Schema、设备模型、i18n、DP 工具、路由 — **所有故事开始前必须完成**

**⚠️ CRITICAL**: 未完成本阶段不得开始 US1–US3 业务 UI

- [x] T005 根据 `docs/product/Debugfile_ST1_Pro.json` 重写 `src/devices/schema.ts`（完整 21 DP 类型；替换模板 `switch_1`）
- [x] T006 更新 `src/devices/index.ts`：`SmartDeviceModel`/`dpKit` 绑定新 Schema；保留单设备路径，群组分支仅保编译
- [x] T007 [P] 实现 `src/utils/dp.ts`：scale 换算、range 夹紧、enum 校验、fault bitmap→label（E0–Ec 共 13 位，见 data-model.md）
- [x] T008 [P] 扩展 `src/i18n/`：开关/模式/工作状态/故障码/零冷水入口/占位页文案（中英）；枚举用 `Strings.getDpLang` 或项目等价 API
- [x] T009 更新 `src/routes.config.ts`：保留 `/` → `pages/home`；新增零冷水占位路由 → `pages/zero-cold-placeholder/index`
- [x] T010 [P] 抽取主题变量占位到 `src/variables.less` / `src/styles/index.less`（实现前用 Figma token 覆盖；禁止无依据硬编码品牌色）
- [x] T011 实现 `src/hooks/useTempSetGuard.ts` 与 `src/hooks/useFaultSummary.ts`（供后续故事复用）

**Checkpoint**: 虚拟设备可加载 Schema；路由可进首页与占位页空壳；US4 主验收（能力一致）可开始抽样核对

---

## Phase 3: User Story 1 — 打开面板查看并控制热水主状态（P1）🎯 MVP

**Goal**: 首页完成开关、模式、设定温度、出水温度、工作状态的展示与合法控制

**Independent Test**: 虚拟设备只测上述 DP，1 分钟内可完成查看状态 + 开关或调温

### Implementation for User Story 1

- [x] T012 [US1] 用 Ardot `batch_read`/`capture_screenshot` 提取首页主控区 token，写入 `docs/design/home-tokens.md`
- [x] T013 [P] [US1] 实现电源开关组件 `src/components/power-switch/index.tsx` + `index.module.less`（合约：`switch` 读写，见 `contracts/ui-dp-bindings.md`）
- [x] T014 [P] [US1] 实现模式选择 `src/components/mode-selector/index.tsx` + `index.module.less`（`mode` enum 五档 + i18n）
- [x] T015 [P] [US1] 实现温度控件 `src/components/temp-control/index.tsx` + `index.module.less`（`temp_set` 夹紧 35–65；展示 `temp_current` 只读）
- [x] T016 [P] [US1] 实现工作状态展示 `src/components/work-state-display/index.tsx` + `index.module.less`（`work_state` 只读 + i18n）
- [x] T017 [US1] 改造组装首页 `src/pages/home/index.tsx` + `index.module.less`：集成 T013–T016，布局对齐 Figma；移除模板 `switch_1`/示例文案
- [x] T018 [US1] 首页离线/下发失败可理解提示（不假装成功），逻辑落在 `src/pages/home/index.tsx` 或 `src/hooks/` 专用 hook

**Checkpoint**: US1 可独立演示 — MVP

---

## Phase 4: User Story 2 — 故障与燃烧/水流状态感知（P1）

**Goal**: 故障摘要可读；火焰/水流按 Figma 条件展示

**Independent Test**: 模拟 `fault` 非零与 `flame_state2`/`flow_state2` 切换，不依赖零冷水页

### Implementation for User Story 2

- [x] T019 [P] [US2] 实现故障横幅 `src/components/fault-banner/index.tsx` + `index.module.less`（`useFaultSummary`；无故障不渲染主故障态；禁止写 fault）
- [x] T020 [P] [US2] 实现火焰/水流组件 `src/components/flame-flow-status/index.tsx` + `index.module.less`；**仅当** Figma 首页存在对应节点时在首页挂载，否则删除引用并在 `docs/design/figma-nodes.md` 注明延后
- [x] T021 [US2] 将 FaultBanner（及条件 FlameFlow）接入 `src/pages/home/index.tsx`，确保故障不阻断主控区其他状态展示

**Checkpoint**: US2 与 US1 同屏可测

---

## Phase 5: User Story 3 — 零冷水入口与占位二级页（P2）

**Goal**: 首页入口可见（可含只读摘要）；进入占位页说明「设置定时」后续开放；可返回

**Independent Test**: 三次往返无卡死、无错误页；占位页无定时编辑控件

### Implementation for User Story 3

- [x] T022 [P] [US3] 实现零冷水入口 `src/components/zero-cold-entry/index.tsx` + `index.module.less`（`once_zero_cold` 开关；预热入口 `navigateTo` 占位页；完整定时属 002）
- [x] T023 [P] [US3] 实现占位页 `src/pages/zero-cold-placeholder/index.tsx` + `index.module.less`（NavBar 返回；后续开放文案走 i18n；无定时 UI）
- [x] T024 [US3] 将 ZeroColdEntry 接入 `src/pages/home/index.tsx`；验证返回栈（优先 `navigateBack`）

**Checkpoint**: US3 导航与文案达标；002 可替换占位页实现

---

## Phase 6: User Story 4 收口 — 设备能力与界面一致（P1 校验）

**Goal**: 对照 Debugfile 确认首包能力类型/范围/只读；范围外能力无完整调节入口

**Independent Test**: 清单核对 + 虚拟设备抽样读写

- [x] T025 [US4] 编写并完成核对表 `docs/product/schema-home-checklist.md`：FR-001/012 与 data-model 首包表逐项勾选（含 temp_set 越界不下发）
- [x] T026 [US4] 确认首页及组件未暴露 Out of Scope 调节（turbo/变升/浴缸/回差/点动/保温时长/用气用水等）；若误加则从 `src/pages/home/` 与相关 components 移除

**Checkpoint**: US4 文档化验收通过

---

## Phase 7: Polish（横切）

**Purpose**: 质量门禁与视觉收口

- [x] T027 [P] 运行 `yarn lint`，修复 `src/` 下新增/修改文件问题
- [x] T028 [P] 运行 `yarn build`（`ray build --target tuya`），确保构建通过
- [x] T029 按 `quickstart.md` 做虚拟设备联调：SC-001–SC-004；记录结果到 `specs/001-st1-home-core/checklists/manual-qa.md`（中文）
- [x] T030 对照 Ardot「方案修改」首页关键区块完成视觉检查（SC-005）；差异项列入 `docs/design/ui-diff.md`
- [x] T031 更新 `CODEBUDDY.md` / README 短述（若需要）指向 `tasks.md` 完成状态；中文 commit 本阶段变更

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** → 无依赖
- **Phase 2 Foundational** → 依赖 Phase 1；**阻塞**所有 User Story
- **Phase 3 US1** → 依赖 Phase 2；MVP
- **Phase 4 US2** → 依赖 Phase 2；建议在 US1 首页壳之后接入（T021 改同一 `home/index.tsx`）
- **Phase 5 US3** → 依赖 Phase 2；可与 US2 并行组件开发，最后再接入 home
- **Phase 6 US4 收口** → 依赖 US1 至少完成；建议在 US2/US3 后做最终核对
- **Phase 7 Polish** → 依赖计划交付的故事完成

### User Story Dependencies

| Story | 依赖 |
|-------|------|
| US1 | 仅 Foundational |
| US2 | Foundational；与 US1 同页集成 |
| US3 | Foundational；入口挂在首页 |
| US4 | Schema 在 Foundational 已落地；收口任务在功能完成后 |

### Parallel Opportunities

- T002 / T003 / T004 可并行
- T007 / T008 / T010 可并行
- T013–T016 可并行（不同组件目录）
- T019 / T020 可并行
- T022 / T023 可并行
- T027 / T028 可并行

---

## Parallel Example: User Story 1

```bash
# 组件并行（不同目录）：
Task: "实现 src/components/power-switch/..."
Task: "实现 src/components/mode-selector/..."
Task: "实现 src/components/temp-control/..."
Task: "实现 src/components/work-state-display/..."

# 然后串行组装：
Task: "改造 src/pages/home/index.tsx 集成上述组件"
```

---

## Implementation Strategy

### MVP First（仅 US1）

1. Phase 1 → Phase 2 → Phase 3（US1）
2. **停止并验收**虚拟设备主控六类反馈中的开关/模式/温度/状态
3. 再进入 US2 / US3

### Incremental Delivery

1. Foundational → 物模型对齐（US4 基础）
2. US1 → MVP 演示
3. US2 → 安全可读
4. US3 → 路由占位（002 接口）
5. US4 收口 + Polish

### Suggested MVP Scope

**T001–T018**（Setup + Foundational + US1）

---

## Notes

- 提交信息遵守宪章：中文 subject/body
- 每次改文件前先 `read` 最新内容
- Figma 未定义暗色则不自行设计暗色视觉
- 不要实现 002 设置定时、003 专业参数、004 图表
