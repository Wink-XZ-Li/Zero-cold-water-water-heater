# UI Diff: 004 能耗报告曲线

**Design**: Ardot `55:1044`（file `714289030938546`）  
**Screenshot**: `.tmp/ardot-screenshots/004/`

## 信息结构对照（SC-004）

| 设计区块 | 实现 | 状态 |
|----------|------|------|
| 标题「能耗报告」+ 返回 | NavBar | ✅ |
| 用水/用气切换 | metric chips，可交互 | ✅ |
| 日/周/月/年 | period chips，可交互 | ✅ |
| 日期左右切换 | `useEnergyAnchor` | ✅ |
| 图表区「用水量 L」等 | StatCharts line + 标题 | ✅ |
| ±15% 误差说明 | 用水视图页脚 | ✅ |
| 「尚未开放」横幅 | 已移除 | ✅ |

## 刻意差异

- 顶栏用 SmartUI NavBar（系统能力），非设计稿内自定义状态栏+返回圆钮
- 卡片色/圆角复用 001 CSS 变量，非稿面灰蓝大色块硬编码（品牌一致优先）
- 图表由 StatCharts 绘制，网格样式以组件默认为准，对齐折线语义而非像素级复刻空网格

## 数据

- water_total id=25 / gas_consumption id=24，`type=sum`
- period → range：日 `1hour`，周/月 `1day`，年 `1month`
