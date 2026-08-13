# Feature Specification: 能耗报告曲线与统计

**Feature Branch**: `004-energy-charts`

**Created**: 2026-08-13

**Status**: Implemented (IDE hand-test pending)

**Input**: 路线图 004「用水/用气曲线统计」+ Ardot `55:1044` + 003 已交付的能耗报告页面壳（`src/pages/energy-report`）。

**基线**: 自 `003-pro-settings` tip（含瀑布浴与报告页壳）；003 壳内用水/用气、日周月年、空图表需升级为可交互真实统计。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 查看日维度用水量曲线 (Priority: P1)

用户从首页进入「能耗报告」，默认看到「用水量」「日」视图；图表展示所选日期的用水统计序列（或明确空态）；可左右切换日期并刷新图表。

**Why this priority**: 设计默认态即用水量/日，是报告页核心价值。

**Independent Test**: 仅验证用水量 + 日维度切换与图表展示/空态，无需用气或周月年。

**Acceptance Scenarios**:

1. **Given** 用户进入能耗报告页, **When** 页面加载完成, **Then** 默认选中用水量与日，并尝试加载当日数据；有数据则绘图，无数据则空态且不崩溃
2. **Given** 日视图, **When** 用户点击日期左右切换, **Then** 日期标签更新并重新加载对应日数据
3. **Given** 加载失败或网络异常, **When** 查看图表区, **Then** 给出可理解失败/空态提示，页面仍可返回

---

### User Story 2 - 切换用气量与周期 (Priority: P1)

用户可在用水/用气之间切换，并在日/周/月/年之间切换；图表标题与数据维度随之变化；误差说明在用水量相关视图保持可读。

**Why this priority**: 设计帧完整信息结构；与 US1 共同构成报告页主路径。

**Independent Test**: 在无真实数据环境下仍可切换控件并看到空态/标题变化；有数据时序列与所选 metric/period 一致。

**Acceptance Scenarios**:

1. **Given** 当前为用水量, **When** 切换到用气量, **Then** 标题与图表请求维度切换为用气；默认周期可保持或回日（实现时在 Assumptions 固定一种）
2. **Given** 任意 metric, **When** 切换日/周/月/年, **Then** 周期选中态更新并重新加载对应区间数据
3. **Given** 用水量视图, **When** 查看页脚说明, **Then** 仍可见 ±15% 误差类文案

---

### User Story 3 - 去掉「尚未开放」伪装并打磨体验 (Priority: P2)

003 页面壳上的「统计尚未可用」横幅在真实能力就绪后移除或仅在无数据时显示空态；加载中有轻量反馈；返回首页不丢设备主控状态。

**Why this priority**: 体验打磨，不阻塞主统计路径。

**Independent Test**: 有数据时无「后续版本」误导文案；加载中可感知；返回正常。

**Acceptance Scenarios**:

1. **Given** 统计能力已接通, **When** 进入报告页且有数据, **Then** 不展示「后续版本才提供」类误导横幅
2. **Given** 正在请求数据, **When** 用户等待, **Then** 有加载中指示或图表区占位，无长时间空白无反馈
3. **Given** 用户在报告页, **When** 返回首页, **Then** 首页状态保持正确

---

### Edge Cases

- 某日/周无用量：空图表 + 说明，不报未捕获错误
- 快速连续切换 metric/period/日期：最终展示与最后一次选择一致
- 离线：提示或保留上次成功数据（二选一，见 Assumptions），不得崩溃
- 累计 DP（`water_total` / `gas_consumption`）与曲线统计口径不一致时：曲线以统计接口为准，累计值若展示须标注（本包默认不强制展示累计总值，除非设计要求）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 必须在现有 `energy-report` 页面上启用用水/用气切换与日/周/月/年切换（交互可用，不再整页禁用）
- **FR-002**: 必须按所选 metric 与 period 加载并展示统计曲线或等价柱/折可视化
- **FR-003**: 日视图必须支持日期前进/后退并重新加载
- **FR-004**: 无数据、加载中、失败三种状态必须可区分且对用户可理解
- **FR-005**: 必须对照 Ardot `55:1044` 保持信息结构（切换位、周期、日期、图表区、误差说明）
- **FR-006**: 必须复用 001 视觉 token；禁止引入米家或其他品牌色
- **FR-007**: 本 feature MUST NOT 改写 002 定时或 003 瀑布浴主路径（可改报告页内部实现）
- **FR-008**: 统计数据来源 MUST 为涂鸦设备统计 API（`getStatisticsRangHour` / `getStatisticsRangDay` / `getStatisticsRangMonth`，按日/周/月/年映射）+ Charts 可视化（方案 A）；MUST NOT 仅用累计 DP `water_total`/`gas_consumption` 冒充日曲线；禁止伪造随机曲线冒充真实用量
- **FR-009**: Charts 组件选型遵循涂鸦 Skill（优先 SmartUI/Charts 或品类面板既有曲线实现）

### Key Entities

- **EnergyMetric**: water | gas
- **EnergyPeriod**: day | week | month | year
- **EnergySeries**: 某 metric+period+锚点日期下的有序数据点（时间标签 + 数值）
- **EnergyReportViewState**: 加载中 / 成功有数据 / 空 / 失败

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户从首页进入报告页后，在 5 秒内（正常网络）看到默认日/用水量的图表或明确空态
- **SC-002**: 连续切换 metric 与 period 各 5 次，界面最终状态与最后选择一致，无卡死
- **SC-003**: 无数据日期 100% 显示空态而非白屏/崩溃
- **SC-004**: 对照 `55:1044`，主信息区块齐全；不再出现「功能未做」误导横幅（有数据时）

## Assumptions

- 003 页面壳与路由已存在，004 在其上增强而非新建第二套入口
- 默认 metric=water、period=day；切换 metric 时保持当前 period（除非数据接口限制）
- 离线时：展示失败提示并允许返回（不强制缓存历史）
- 视觉权威：Ardot `55:1044`；工具例外同 001–003（Ardot）
- **FR-008 已确认（方案 A）**：时间序列用涂鸦设备统计 API + Charts；累计 DP 不作曲线数据源

## Out of Scope

- 变升/回水温差等专业参数（003 已排除）
- 导出报表、分享、多设备对比
- 故障诊断百科
- 修改云定时逻辑

## 路线图衔接

| Feature | 内容 |
|---------|------|
| **003** | 瀑布浴 + 报告入口与页面壳（已实现） |
| **004** | 报告页真实曲线与统计（本规格） |
