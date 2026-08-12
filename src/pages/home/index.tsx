import React from 'react';
import { ScrollView, View } from '@ray-js/ray';
import { NavBar } from '@ray-js/smart-ui';
import Strings from '@/i18n';
import { PowerSwitch } from '@/components/power-switch';
import { ModeSelector } from '@/components/mode-selector';
import { TempControl } from '@/components/temp-control';
import { WorkStateDisplay } from '@/components/work-state-display';
import { FaultBanner } from '@/components/fault-banner';
import { ZeroColdEntry } from '@/components/zero-cold-entry';
import { useDeviceOnlineGuard } from '@/hooks/useDeviceOnlineGuard';
import styles from './index.module.less';

/**
 * Home layout tokens: see docs/design/home-tokens.md (Figma pending).
 * Flame/flow intentionally not mounted until Figma confirms nodes.
 */
export function Home() {
  const { online } = useDeviceOnlineGuard();
  const disabled = !online;

  return (
    <View className={styles.page}>
      <NavBar title={Strings.getLang('home_title')} leftTextType="home" />
      <ScrollView scrollY className={styles.scroll}>
        <View className={styles.content}>
          <FaultBanner />
          <TempControl disabled={disabled} />
          <PowerSwitch disabled={disabled} />
          <ModeSelector disabled={disabled} />
          <WorkStateDisplay />
          <ZeroColdEntry />
        </View>
      </ScrollView>
    </View>
  );
}

export default Home;
