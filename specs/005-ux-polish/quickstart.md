# Quickstart: 005 UX Polish

## 前置

- 分支：`005-ux-polish`（基线 `004-energy-charts` @ `dec73cc`）
- Skill：`tuya-ray-panel-dev`
- 设计：Ardot `714289030938546` / `55:241`

## 实现顺序（建议）

1. 安装 `@ray-js/svg`；从 Ardot 导出模式区矢量并封装四模式图标
2. 改造 `ModeSelector`：替换文字 mark，保留 DP 逻辑
3. 改造 `FaultBanner`：矢量警示图标 + 点击 `showModal`/`Dialog` 展示全部故障摘要
4. 对齐四页内容区 padding/gap；确认 NavBar 返回一致
5. 重写 `docs/design/ui-diff.md` 清零开放项
6. `yarn lint` + `yarn build`；IDE 手测模式/故障/子页返回

## 验收对照

- [ ] SC-001 模式无文字占位图标
- [ ] SC-002 故障无假手册导航；点击有就地摘要（或明确不可点且无箭头——本方案取就地摘要）
- [ ] SC-003 边距一致
- [ ] SC-004 ui-diff 开放项 0
- [ ] SC-005 定时与能耗主流程无回归

## 勿做

- 专业参数页（A）、火焰/水流挂载（C）
- 改 timer 配对或 StatCharts 数据绑定
