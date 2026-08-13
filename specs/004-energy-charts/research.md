# Research: 004 能耗报告曲线与统计

**Date**: 2026-08-13  
**Branch**: `004-energy-charts`

## R1 — FR-008 数据源：统计 API vs 累计 DP？

- **Decision**: **方案 A** — 涂鸦设备统计 API（`getStatisticsRangHour` / `getStatisticsRangDay` / `getStatisticsRangMonth`）+ Charts；累计 DP `water_total`（id 25）/`gas_consumption`（id 24）仅作为统计目标 DP（按其 `dpId` 查询），不直接把当前累计值画成日曲线
- **Rationale**: 设计要求日/周/月/年时间序列；累计 DP 是单点累计值，无法还原日内曲线；HANDOFF 与 Softener/Gas-Boiler 品类实践一致
- **Alternatives**: 方案 B 仅累计 DP — 拒绝（无法满足 FR-002/003 真日曲线）；伪造随机曲线 — 明确禁止

## R2 — Charts 组件选型：StatCharts vs CommonCharts？

- **Decision**: 优先 `@ray-js/stat-charts`（`StatCharts`），`chartType` 用 `line` 或 `line-area` 贴近 Ardot `55:1044` 折线网格；`type="sum"`
- **Rationale**: Skill Component Selection Guide 将历史统计图表首选 StatCharts；Water-Softener 已验证 day/week/month/year → `range` 映射；自带按区间拉数，减少手写 format；对齐 FR-009
- **Alternatives**: `@ray-js/common-charts`（Gas-Boiler 温度/湿度）— 更灵活但需自管 `getStatisticsRang*` + option；本页标准用量统计优先 StatCharts。若 IDE 联调发现 StatCharts 无法满足空态/样式，再降级 CommonCharts（同一 hook 层可复用）

## R3 — period → StatCharts `range` / 日期窗口映射？

- **Decision**（对齐 Softener）：

| UI period | StatCharts `range` | 日期窗口 |
|-----------|--------------------|----------|
| day | `1hour` | 当日 `YYYYMMDD`～`YYYYMMDD` |
| week | `1day` | 锚点日往前 6 天～锚点日 |
| month | `1day` | 当月起止 |
| year | `1month` | 当年起止（`YYYYMM`） |

日期前进/后退：day/month/year 按对应单位 ±1；week 按日 ±7（或 Softener 的按日滑动周窗口，实现时固定一种并在 quickstart 注明）

- **Rationale**: Softener `MaintenanceContent` 已落地；周视图用日粒度柱/线可展示 7 点序列
- **Alternatives**: 周也用小时粒度 — 数据过密且 API 按日更稳，拒绝

## R4 — 统计聚合类型？

- **Decision**: `type: 'sum'`（用水 L / 用气 m³ 累计量）
- **Rationale**: `water_total` / `gas_consumption` 为耗量类 value DP；用量报告语义是区间合计而非均值
- **Alternatives**: `avg`/`max` — 不符「用水量/用气量」报告语义

## R5 — 交互与空态策略？

- **Decision**:
  - 启用 metric / period / 日期切换（去掉 003「尚未开放」横幅）
  - 加载中：图表区 loading 或占位文案
  - 无数据：空网格 + 说明，不崩溃
  - 失败：可理解错误文案，可返回
  - 切换 metric 时保持当前 period（Assumptions）
  - 用水视图保留 ±15% 误差说明；用气可共用或切换单位文案（实现时用水保持原文案，用气换单位提示若设计未给则仅改标题单位）
- **Rationale**: FR-001–004、US3；离线不强制缓存（Assumptions）
- **Alternatives**: 保留「后续版本」横幅 — 与 SC-004 冲突，拒绝

## R6 — 依赖与包？

- **Decision**: 新增 `@ray-js/stat-charts`、`dayjs`（日期窗口计算）；不引入米家色或其它品牌包
- **Rationale**: Softener/Skill 同源依赖；dayjs 轻量且与参考仓一致
- **Alternatives**: 手写 Date 运算 — 周/月边界易错；CommonCharts + ECharts — 非首选

## R7 — 设计权威？

- **Decision**: Ardot file `714289030938546` 节点 `55:1044`；视觉 token 复用 001 `docs/design/home-tokens.md` / CSS 变量
- **Rationale**: 宪章 Figma 条款在本仓的既定 Ardot 例外（同 001–003）；截图已落盘 `.tmp/ardot-screenshots/004/`
- **Alternatives**: 等待 Figma MCP — 阻塞，拒绝

## Open Items

无未解决 NEEDS CLARIFICATION。FR-008 已闭合为方案 A。
