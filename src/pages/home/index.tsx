import React from 'react';
import { ScrollView, View } from '@ray-js/ray';
import { NavBar, Dialog } from '@ray-js/smart-ui';
import { useProps } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import { StatusHero } from '@/components/status-hero';
import { PowerSwitch } from '@/components/power-switch';
import { ModeSelector } from '@/components/mode-selector';
import { TempControl } from '@/components/temp-control';
import { FaultBanner } from '@/components/fault-banner';
import { ZeroColdEntry } from '@/components/zero-cold-entry';
import { WaterfallBathEntry } from '@/components/waterfall-bath-entry';
import { EnergyReportEntry } from '@/components/energy-report-entry';
import { useDeviceOnlineGuard } from '@/hooks/useDeviceOnlineGuard';
import styles from './index.module.less';

/**
 * Home layout aligned to Ardot「方案修改」55:788 / 55:711 (+ 55:864 expand rows).
 * Flame/flow not mounted — design frames have no dedicated nodes.
 * Power-off greys write controls (grill Q6-B); preheat/energy remain enterable (Q7-A).
 */
export function Home() {
  const { online } = useDeviceOnlineGuard();
  const powerOn = useProps(p => !!p.switch);
  const offline = !online;
  const writeDisabled = offline || !powerOn;

  return (
    <View className={styles.page}>
      <NavBar title={Strings.getLang('home_title')} leftTextType="home" />
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
          <PowerSwitch disabled={offline} />
          <ModeSelector disabled={writeDisabled} />
          <TempControl disabled={writeDisabled} />
          <ZeroColdEntry writeDisabled={writeDisabled} />
          <WaterfallBathEntry disabled={writeDisabled} />
          <EnergyReportEntry />
        </View>
      </ScrollView>
      <Dialog id="smart-dialog" />
    </View>
  );
}

export default Home;
