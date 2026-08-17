import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, View, showToast } from '@ray-js/ray';
import { NavBar, Dialog } from '@ray-js/smart-ui';
import { useDevice, useProps } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import { StatusHero } from '@/components/status-hero';
import { PowerSwitch } from '@/components/power-switch';
import { ModeSelector } from '@/components/mode-selector';
import { TempControl } from '@/components/temp-control';
import { FaultBanner } from '@/components/fault-banner';
import { ZeroColdEntry } from '@/components/zero-cold-entry';
import { WaterfallBathEntry } from '@/components/waterfall-bath-entry';
import { EnergyReportEntry } from '@/components/energy-report-entry';
import { DeviceLogsEntry } from '@/components/device-logs-entry';
import { useDeviceOnlineGuard } from '@/hooks/useDeviceOnlineGuard';
import { useFaultSummary } from '@/hooks/useFaultSummary';
import styles from './index.module.less';

/**
 * Home layout aligned to Ardot「方案修改」55:788 / 55:711 (+ 55:864 expand rows).
 * Flame/flow not mounted — design frames have no dedicated nodes.
 * 关机或故障：写控件灰禁；故障时电源也不可点。预热与能耗报告仍可进入。
 * 浴缸流量条挂在 ModeSelector 内（箭头自浴缸卡引出）。
 */
export function Home() {
  const { online } = useDeviceOnlineGuard();
  const { hasFault } = useFaultSummary();
  const deviceName = useDevice(d => d.devInfo?.name) as string;
  const powerOn = useProps(p => !!p.switch);
  const offline = !online;
  const writeDisabled = offline || !powerOn || hasFault;
  const powerDisabled = offline || hasFault;
  const navTitle = (deviceName && String(deviceName).trim()) || Strings.getLang('home_title');
  const [logsEntryVisible, setLogsEntryVisible] = useState(false);
  const clickCount = useRef(0);
  const lastClickTime = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onNavPentaTap = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < 500) {
      clickCount.current += 1;
    } else {
      clickCount.current = 1;
    }
    lastClickTime.current = now;

    if (clickCount.current >= 5) {
      clickCount.current = 0;
      setLogsEntryVisible(true);
      showToast({ title: '已显示日志入口', icon: 'none' });
    }

    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 2000);
  }, []);

  return (
    <View className={styles.page}>
      {/* 不用 leftTextType=home：其左侧 width:auto 会让标题视觉偏左 */}
      <NavBar
        title={navTitle}
        border={false}
        background="var(--index-main-bg)"
        onClickTitle={onNavPentaTap}
      />
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className={styles.scroll}
        style={{ flex: 1, height: '100%' }}
      >
        <View className={styles.content}>
          <StatusHero />
          <FaultBanner />
          <PowerSwitch disabled={powerDisabled} />
          <ModeSelector disabled={writeDisabled} />
          <TempControl disabled={writeDisabled} />
          <ZeroColdEntry writeDisabled={writeDisabled} />
          <WaterfallBathEntry disabled={writeDisabled} />
          <EnergyReportEntry />
          {logsEntryVisible ? <DeviceLogsEntry /> : null}
        </View>
      </ScrollView>
      <Dialog id="smart-dialog" />
    </View>
  );
}

export default Home;
