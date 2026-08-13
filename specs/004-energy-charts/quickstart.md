# Quickstart: 004 能耗报告曲线

## 开发

1. 分支：`004-energy-charts`
2. 安装依赖：`@ray-js/stat-charts`、`dayjs`（若尚未安装）
3. `npm start`（`ray start --target tuya`）
4. IDE 绑定 Pro_Key `a3cbezgki7lkl8rr`

## 手测路径

1. 首页 →「能耗报告」
2. 默认：用水量 + 日；5 秒内见图表或明确空态（SC-001）；**无**「尚未开放」误导横幅
3. ‹ › 切换日期：标签与图表刷新；不能翻到未来日
4. 切换周/月/年：选中态与序列粒度变化
5. 切换用气量：标题/单位切到气；period 保持
6. 连续快速切换 metric/period 各 5 次：最终与最后选择一致（SC-002）
7. 无数据日：空态不崩溃（SC-003）
8. 断网或失败：可见失败提示，可返回
9. 返回首页：主控/瀑布浴状态仍正确
10. 对照 Ardot `55:1044`：metric、period、日期、图表区、误差说明齐全（SC-004）

## 构建门禁

```bash
npm run lint
npm run build
```

## 参考

- 规格：`specs/004-energy-charts/spec.md`
- 计划：`specs/004-energy-charts/plan.md`
- 设计：Ardot `55:1044`（截图 `.tmp/ardot-screenshots/004/`）
- 品类：`Gas-Boiler-codybuddy` curve；`Water-Softener-Electrolux` StatCharts
