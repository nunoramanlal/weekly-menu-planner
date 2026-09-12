import type {
  DayOfWeek,
  Menu,
  MenuStatus,
} from '../types/menu';

export const daysOfWeek: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const statusOrder: Record<MenuStatus, number> = {
  current: 0,
  previous: 1,
  backlog: 2,
};

export function sortMenus(menus: Menu[]): Menu[] {
  return [...menus].sort((a, b) => {
    const statusDifference =
      statusOrder[a.status] - statusOrder[b.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return (
      new Date(b.week_start).getTime() -
      new Date(a.week_start).getTime()
    );
  });
}