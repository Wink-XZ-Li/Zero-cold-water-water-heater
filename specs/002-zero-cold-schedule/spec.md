# Feature Specification: 零冷水定时（设置定时）

**Feature Branch**: `002-zero-cold-schedule`

**Created**: 2026-08-13

**Status**: Draft

**Input**: 用户确认 Grill 共识 — 采用方案 1「业务层定时组封装」；首页「零冷水预热」即「零冷水定时」入口；交互参考米家时间段定时（Ardot 节点 `57:4`/`57:5`/`57:6`）；云定时 API 使用涂鸦 Ray DeviceKit（`syncTimerTask` / `addTimer` / `updateTimer` / `updateTimerStatus` / `removeTimer`）；每组由两个 Timer 组成（开始/结束），通过相同 `aliasName` 成组；开始对应 `dpid 104`=`zc_always_on` true，结束对应 false。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 查看定时组列表 (Priority: P1)

用户从首页点击「零冷水预热」进入定时列表，看到已配置的时间段定时组（开始–结束时间、重复日摘要、开关状态），并可返回首页。

**Why this priority**: 列表是定时能力的主入口，无列表则无法演示增删改。

**Independent Test**: 预置至少 1 组配对 Timer（相同 aliasName），仅打开列表即可验证展示与开关状态。

**Acceptance Scenarios**:

1. **Given** 首页已加载, **When** 用户点击「零冷水预热」, **Then** 进入定时列表页（不再进入「后续开放」占位说明页）
2. **Given** 云端存在成对 Timer（同一 aliasName，一个 dps 104=true、一个 false）, **When** 打开列表, **Then** 显示为一行时间段（如 `10:34 - 23:34`）及重复日摘要
3. **Given** 列表中某组成对 Timer 均启用, **When** 查看该行开关, **Then** 开关为开；关闭开关后两 Timer 状态均变为关（`updateTimerStatus`）
4. **Given** 列表为空, **When** 打开列表, **Then** 展示空态，且提供新增入口（如 FAB「+」）
5. **Given** 用户在列表页, **When** 点击返回, **Then** 回到首页且首页主控状态保持正确

---

### User Story 2 - 新增定时组 (Priority: P1)

用户在列表页新增一组时间段定时：选择重复日、开始时间、结束时间，以及是否执行通知（`isAppPush`），保存后云端创建两个 Timer 并出现在列表中。

**Why this priority**: 与查看列表共同构成 MVP 闭环。

**Independent Test**: 从空列表新增一组后刷新列表可见，且 `syncTimerTask` 返回两条同 aliasName 记录。

**Acceptance Scenarios**:

1. **Given** 用户在列表页, **When** 点击新增, **Then** 进入时间段编辑页（交互对齐米家：重复 / 开启 / 关闭）
2. **Given** 用户选定重复日、开始时间、结束时间与 `isAppPush`, **When** 保存成功, **Then** 创建两个 Timer：开始 `dps={"104":true}`，结束 `dps={"104":false}`，二者 `loops`/`isAppPush`/`aliasName` 一致
3. **Given** 开始时间与结束时间相同, **When** 用户尝试保存, **Then** 不允许提交并给出可理解提示
4. **Given** 新增过程中第二个 Timer 创建失败, **When** 错误发生, **Then** 不得留下「半组」可展示脏数据：须回滚已创建的第一个 Timer（或自动重试至成对），并向用户提示失败

---

### User Story 3 - 编辑定时组 (Priority: P1)

用户在列表中点击某一组，进入编辑页同时修改该组两个 Timer 的重复日与时间，保存后列表展示更新。

**Why this priority**: 米家核心路径；无编辑则只能删建，体验不完整。

**Independent Test**: 修改已有组的结束时间并保存，列表与 `syncTimerTask` 结果一致。

**Acceptance Scenarios**:

1. **Given** 列表存在至少一组, **When** 点击该组, **Then** 进入编辑页且预填该组开始/结束时间与重复日
2. **Given** 用户修改重复日或时间后保存成功, **When** 返回列表, **Then** 该组展示为新值，且两个 Timer 仍共享同一 aliasName
3. **Given** 编辑保存时仅一侧更新成功, **When** 失败发生, **Then** 提示失败并尽量保持组内数据一致（重试或回读后纠正）

---

### User Story 4 - 删除定时组 (Priority: P2)

用户在列表中通过左滑（或等价删除手势/操作）删除一整组，对应两个 Timer 均从云端移除。

**Why this priority**: 次于增改，但是成组模型的必要闭环。

**Independent Test**: 删除一组后 `syncTimerTask` 不再返回该 aliasName 下任何 Timer。

**Acceptance Scenarios**:

1. **Given** 列表存在一组, **When** 用户对该组执行删除并在二次确认中确认, **Then** 两个 Timer 均被 `removeTimer` 删除且列表不再显示该组
2. **Given** 用户触发删除, **When** 在二次确认中取消, **Then** 不调用 `removeTimer`，列表保持不变
3. **Given** 删除过程中第二个 remove 失败, **When** 错误发生, **Then** 提示失败；列表刷新后不得静默留下单侧孤儿 Timer（须重试删除或提示用户重试）

---

### Edge Cases

- 云端存在无法配对的单侧 Timer（缺开始或结束）：列表 MUST 可识别；SHOULD 提供清理/修复入口或在加载时提示，MUST NOT 当作完整组展示误导用户
- 设备离线或 Timer API 失败：界面给出可理解错误，不假装保存成功
- `loops` 全为 0（不重复）：若产品允许「仅一次」，须明确日期策略；默认本规格按「至少选择一天」校验（见 Assumptions）
- 跨日时间段（开始 23:00、结束 06:00）：允许，结束 Timer 仍写 104=false，不额外拆日逻辑
- 并发多端修改：以再次 `syncTimerTask` 结果为准刷新列表

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 首页「零冷水预热」入口 MUST 导航至零冷水定时列表页，MUST NOT 再进入「设置定时后续开放」占位页
- **FR-002**: 系统页 MUST 通过 `syncTimerTask`（固定 `category`，如 `zc_schedule`）拉取 Timer，并按 `aliasName` 归并为定时组
- **FR-003**: 每个完整定时组 MUST 恰好包含两个 Timer：开始（`dps` 含 `"104": true`）与结束（`"104": false`），且共享同一 `aliasName`
- **FR-004**: 用户 MUST 能新增定时组：选择 `loops`、开始时间、结束时间、`isAppPush`；保存时成对 `addTimer`
- **FR-005**: 用户 MUST 能点击组进入编辑页，成对 `updateTimer` 更新两个 Timer
- **FR-006**: 用户 MUST 能在列表开关成组启用状态：对组内两个 `timerId` 分别调用 `updateTimerStatus`
- **FR-007**: 用户 MUST 能删除定时组：对组内两个 `timerId` 分别 `removeTimer`（交互对齐米家左滑删除；若平台手势受限可用等价删除操作）
- **FR-008**: `dpid 104` MUST 映射产品 DP `zc_always_on`（Schema id 104）；Timer 的 `dps` 键使用字符串 `"104"`
- **FR-009**: 列表与编辑页信息结构 MUST 可追溯到米家参考截图（Ardot `57:5` 列表、`57:4` 编辑）；视觉主题 MUST 复用本产品 001 已落地的伊莱克斯 CSS 变量，MUST NOT 照搬米家青绿品牌色作为主色
- **FR-010**: 所有用户可见文案 MUST 走 i18n；首页入口文案保持设计稿「零冷水预热」；列表标题默认「定时列表」
- **FR-011**: 成对写操作 MUST 具备失败保护（回滚/重试/刷新纠偏），避免长期「半组」污染列表
- **FR-012**: 本 feature MUST NOT 实现增压、变升、能耗报告、回水温差/点动/保温时长等 003 范围能力（即使米家参考图中出现）

### Key Entities

- **定时组 (TimerGroup)**: 业务层实体，由相同 `aliasName` 的开始/结束两个云 Timer 组成；展示字段含 startTime、endTime、loops、enabled、isAppPush
- **云 Timer (TimerModel)**: 涂鸦云定时任务，含 timerId、time、loops、dps、aliasName、isAppPush、status
- **入口导航**: 首页零冷水预热行 → 定时列表 →（新增/编辑）时间段编辑页

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户从首页进入列表并完成「新增一组时间段定时」可在 2 分钟内独立完成（含选日与两个时间）
- **SC-002**: 对同一 aliasName 的增、改、删、开关操作后，`syncTimerTask` 抽样核对成对一致性达到 100%（不少于新增/编辑/删除各 1 次）
- **SC-003**: 人为制造「第二个 Timer 写入失败」时，界面不出现可交互的半组脏数据（回滚或自动修复后列表干净）
- **SC-004**: 对照米家列表/编辑关键信息块，评审「缺失主路径控件」项为 0（视觉像素级差异允许，以信息结构为准）

## Assumptions

- 首页入口文案保持「零冷水预热」（与伊莱克斯设计稿一致）；其业务含义为本 feature 的零冷水定时
- 二级页标题采用「定时列表」/「时间段定时」（对齐米家参考）；若产品要求改文案可在实现前微调 i18n
- `category` 使用面板内固定常量（建议 `zc_schedule`），全 feature 唯一
- `aliasName` 由面板生成稳定成组键（如 `zc_g_<uuid>`），用户不可见
- `loops` 默认要求至少选择一天；「仅执行一次」若不做云 date 策略，则首包不提供
- `isAppPush` 在新增/编辑中可配置，**默认 `false`**（用户确认）
- 删除定时组 **MUST** 二次确认后再成对 `removeTimer`（用户确认）
- 伊莱克斯正式稿暂无定时二级页帧：交互以米家截图为准，视觉套用 001 主题变量；后续有正式稿再做视觉替换
- 单设备模式；群组 Timer API 路径不作为首包目标
- 不调用 `openTimerPage` 原生页作为主方案

## Out of Scope

- **003**：增压、变升、浴缸流量、回水温差、点动、保温时长、用气/用水累计等
- **004**：能耗曲线/统计
- 天文定时、场景联动、共享设备特殊权限流
- 完整故障百科、客服工单

## Roadmap Link

| Feature | 范围 |
|---------|------|
| **001** | 首页主控 + 零冷水入口占位（本 feature 替换占位） |
| **002**（本规格） | 零冷水定时组（云定时成对模型） |
| **003** | 其余设置/专业参数 |
| **004** | 曲线/统计 |
