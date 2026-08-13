# Contract: Statistics data binding

## Source of truth

| Metric | DP code | DP id | Stats type | Unit |
|--------|---------|-------|------------|------|
| water | `water_total` | 25 | `sum` | L |
| gas | `gas_consumption` | 24 | `sum` | m3 |

## Period mapping

| Period | API / StatCharts range | Window |
|--------|------------------------|--------|
| day | hour / `1hour` | single calendar day |
| week | day / `1day` | anchor−6d … anchor |
| month | day / `1day` | month start … end |
| year | month / `1month` | year start … end |

Underlying APIs (if not using StatCharts built-in fetch):

- Day: `getStatisticsRangHour({ devId, dpId, type: 'sum', date: 'YYYYMMDD', ... })`
- Week/Month: `getStatisticsRangDay({ devId, dpId, type: 'sum', startDay, endDay, ... })`
- Year: `getStatisticsRangMonth({ devId, dpId, type: 'sum', startMonth, endMonth, ... })`

## Forbidden

- Using only live `useProps(p => p.water_total)` / `gas_consumption` as the chart series
- Random / hardcoded demo series in production paths (`debug` flag must default false)

## Device context

- `devId` from panel SDK (`useDevice` / `useDevId`)
- Read-only; no `useActions` for these DPs
