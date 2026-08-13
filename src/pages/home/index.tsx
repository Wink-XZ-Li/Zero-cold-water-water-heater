import React from 'react';
import { ScrollView, View } from '@ray-js/ray';
import { NavBar } from '@ray-js/smart-ui';
import Strings from '@/i18n';
import { StatusHero } from '@/components/status-hero';
import { PowerSwitch } from '@/components/power-switch';
import { ModeSelector } from '@/components/mode-selector';
import { TempControl } from '@/components/temp-control';
import { FaultBanner } from '@/components/fault-banner';
import { ZeroColdEntry } from '@/components/zero-cold-entry';
import { useDeviceOnlineGuard } from '@/hooks/useDeviceOnlineGuard';
import styles from './index.module.less';

/**
 * Home layout aligned to Ardot「方案修改」55:788 / 55:711.
 * Flame/flow not mounted — design frames have no dedicated nodes.
 */
export function Home() {
  const { online } = useDeviceOnlineGuard();
  const disabled = !online;

  return (
    <View className={styles.page}>
      <NavBar title={Strings.getLang('home_title')} leftTextType="home" />
      <ScrollView scrollY className={styles.scroll}>
        <View className={styles.content}>
          <StatusHero />
          <FaultBanner />
          <PowerSwitch disabled={disabled} />
          <ModeSelector disabled={disabled} />
          <TempControl disabled={disabled} />
          <ZeroColdEntry disabled={disabled} />
        </View>
      </ScrollView>
    </View>
  );
}

export default Home;
