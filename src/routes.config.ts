import { Routes } from '@ray-js/types';

export const routes: Routes = [
  {
    route: '/',
    path: '/pages/home/index',
    name: 'Home',
  },
  {
    route: '/zero-cold-schedule',
    path: '/pages/zero-cold-schedule/index',
    name: 'ZeroColdSchedule',
  },
  {
    route: '/zero-cold-schedule-edit',
    path: '/pages/zero-cold-schedule-edit/index',
    name: 'ZeroColdScheduleEdit',
  },
  {
    route: '/energy-report',
    path: '/pages/energy-report/index',
    name: 'EnergyReport',
  },
  {
    route: '/logs',
    path: '/pages/logs/index',
    name: 'DeviceLogs',
  },
];
