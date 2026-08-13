# 温度仪表盘（status-hero）调参记录

**组件**: `src/components/status-hero/`  
**对照稿**: Ardot `55:848`  
**更新日期**: 2026-08-13

## 已锁定的产品规则（勿因微调样式改掉）

| 项 | 约定 |
|----|------|
| 大号温度 | 左对齐，在「设置温度」下方 |
| ℃ | 相对数字偏下（见 `.setUnit` margin-top） |
| 出水温度 | DP 原样显示（含脏值） |
| 胶囊 `off` 无故障 | 不显示 |
| 胶囊 `standby` | 灰点 +「待机中」 |
| 胶囊 `bath_heating` | 绿点 +「卫浴加热中」 |
| 胶囊 `zc_heating` | 绿点 +「循环加热中」 |
| 胶囊故障 | 优先；红点 +「设备故障」（关机有故障也显示） |
| 胶囊样式 | 同一浅底，只换圆点色；宽度 hug |
| 文案 | 中文上表；英文短词 Standby / Heating / Fault |

## Agent 调参基线（手动微调前）

```less
.hero { padding: 96rpx 96rpx 48rpx; min-height: 448rpx; }
.tempRow { margin-top: 32rpx; }
.setUnit { margin-left: 4rpx; margin-top: 28rpx; }
.metaRow { margin-top: 32rpx; padding-top: 0; }
```

## 手动微调结果（用户 2026-08-13）

文件：`src/components/status-hero/index.module.less`

| 属性 | 基线 | 手动最终 | 备注 |
|------|------|----------|------|
| `.hero` padding | `96rpx 96rpx 48rpx` | `96rpx` | 四边统一 |
| `.hero` min-height | `448rpx` | `448rpx` | 未改 |
| `.tempRow` margin-top | `32rpx` | `16rpx` | 标签→大号温度 |
| `.setUnit` margin-top | `28rpx` | `16rpx` | ℃ 下移量收一点 |
| `.setUnit` margin-left | `4rpx` | `4rpx` | 未改 |
| `.metaRow` margin-top | `32rpx` | `16rpx` | 与标签→温度间距对齐 |

### 最终关键 less

```less
.hero {
  min-height: 448rpx;
  padding: 96rpx;
}

.tempRow {
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 16rpx;
}

.setUnit {
  margin-left: 4rpx;
  margin-top: 16rpx;
  font-size: 80rpx;
  font-weight: 500;
  line-height: 1;
}

.metaRow {
  margin-top: 16rpx;
  padding-top: 0;
}
```
