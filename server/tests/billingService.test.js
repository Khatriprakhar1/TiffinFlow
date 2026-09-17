const {
  isWeekday,
  getWeekdaysInMonth,
  getWeekdaysBetweenDates,
  calculateBill
} = require('../src/services/billingService');

describe('Billing Service', () => {

  describe('isWeekday', () => {
    test('Monday is a weekday', () => {
      // Sept 1, 2026 is a Tuesday
      expect(isWeekday(new Date(2026, 8, 1))).toBe(true);
    });

    test('Saturday is not a weekday', () => {
      // Sept 5, 2026 is a Saturday
      expect(isWeekday(new Date(2026, 8, 5))).toBe(false);
    });

    test('Sunday is not a weekday', () => {
      // Sept 6, 2026 is a Sunday
      expect(isWeekday(new Date(2026, 8, 6))).toBe(false);
    });
  });

  describe('getWeekdaysInMonth', () => {
    test('September 2026 has 22 weekdays', () => {
      expect(getWeekdaysInMonth(2026, 9)).toBe(22);
    });

    test('February 2026 has 20 weekdays', () => {
      expect(getWeekdaysInMonth(2026, 2)).toBe(20);
    });

    test('February 2024 (leap year) has 21 weekdays', () => {
      expect(getWeekdaysInMonth(2024, 2)).toBe(21);
    });

    test('January 2026 has 22 weekdays', () => {
      expect(getWeekdaysInMonth(2026, 1)).toBe(22);
    });
  });

  describe('getWeekdaysBetweenDates', () => {
    test('Mon-Fri span = 5 weekdays', () => {
      // Sept 7-11, 2026 (Mon-Fri)
      const start = new Date(2026, 8, 7);
      const end = new Date(2026, 8, 11);
      expect(getWeekdaysBetweenDates(start, end)).toBe(5);
    });

    test('span including weekend excludes Sat/Sun', () => {
      // Sept 10-14, 2026 (Thu to Mon) = Thu, Fri, Mon = 3 weekdays
      const start = new Date(2026, 8, 10);
      const end = new Date(2026, 8, 14);
      expect(getWeekdaysBetweenDates(start, end)).toBe(3);
    });

    test('single weekday = 1', () => {
      const date = new Date(2026, 8, 7); // Monday
      expect(getWeekdaysBetweenDates(date, date)).toBe(1);
    });

    test('single weekend day = 0', () => {
      const date = new Date(2026, 8, 5); // Saturday
      expect(getWeekdaysBetweenDates(date, date)).toBe(0);
    });
  });

  describe('calculateBill', () => {
    test('full month with no pauses', () => {
      const bill = calculateBill(3000, 2026, 9, []);
      expect(bill.totalWeekdays).toBe(22);
      expect(bill.pausedWeekdays).toBe(0);
      expect(bill.billableDays).toBe(22);
      expect(bill.finalBill).toBe(3000);
    });

    test('month with one pause period', () => {
      // Pause Sept 10-13, 2026 (Thu-Sun) = 2 weekdays (Thu, Fri)
      const pausePeriods = [{
        startDate: new Date(2026, 8, 10),
        endDate: new Date(2026, 8, 13)
      }];
      const bill = calculateBill(3000, 2026, 9, pausePeriods);
      expect(bill.totalWeekdays).toBe(22);
      expect(bill.pausedWeekdays).toBe(2);
      expect(bill.billableDays).toBe(20);
      expect(bill.dailyRate).toBeCloseTo(136.36, 1);
      expect(bill.finalBill).toBeCloseTo(2727.27, 1);
    });

    test('month with pause covering weekends only (no weekdays deducted)', () => {
      // Pause Sept 5-6, 2026 (Sat-Sun only)
      const pausePeriods = [{
        startDate: new Date(2026, 8, 5),
        endDate: new Date(2026, 8, 6)
      }];
      const bill = calculateBill(3000, 2026, 9, pausePeriods);
      expect(bill.pausedWeekdays).toBe(0);
      expect(bill.finalBill).toBe(3000);
    });

    test('multiple pause periods', () => {
      const pausePeriods = [
        {
          startDate: new Date(2026, 8, 10),
          endDate: new Date(2026, 8, 11) // Thu-Fri = 2 weekdays
        },
        {
          startDate: new Date(2026, 8, 21),
          endDate: new Date(2026, 8, 22) // Mon-Tue = 2 weekdays
        }
      ];
      const bill = calculateBill(3000, 2026, 9, pausePeriods);
      expect(bill.pausedWeekdays).toBe(4);
      expect(bill.billableDays).toBe(18);
    });

    test('overlapping pause periods are not double-counted', () => {
      const pausePeriods = [
        {
          startDate: new Date(2026, 8, 10),
          endDate: new Date(2026, 8, 12) // Thu-Sat = 2 weekdays
        },
        {
          startDate: new Date(2026, 8, 11),
          endDate: new Date(2026, 8, 14) // Fri-Mon = 2 weekdays, but Fri overlaps
        }
      ];
      const bill = calculateBill(3000, 2026, 9, pausePeriods);
      // Unique paused weekdays: Thu 10, Fri 11, Mon 14 = 3
      expect(bill.pausedWeekdays).toBe(3);
      expect(bill.billableDays).toBe(19);
    });

    test('open pause period (no endDate) counted till end of month', () => {
      // Pause starts Sept 28, 2026 (Mon), no endDate
      // Remaining weekdays in Sept: Mon 28, Tue 29, Wed 30 = 3
      const pausePeriods = [{
        startDate: new Date(2026, 8, 28),
        endDate: null
      }];
      const bill = calculateBill(3000, 2026, 9, pausePeriods);
      expect(bill.pausedWeekdays).toBe(3);
      expect(bill.billableDays).toBe(19);
    });

    test('pause period outside billing month has no effect', () => {
      const pausePeriods = [{
        startDate: new Date(2026, 7, 10), // August
        endDate: new Date(2026, 7, 15)    // August
      }];
      const bill = calculateBill(3000, 2026, 9, pausePeriods);
      expect(bill.pausedWeekdays).toBe(0);
      expect(bill.finalBill).toBe(3000);
    });

    test('example from requirements: Sept 2026, paused 10-13', () => {
      // The requirement says: 3 paused weekdays for Sept 10-13
      // Sept 10 = Thu, 11 = Fri, 12 = Sat, 13 = Sun
      // Weekdays: 10 (Thu), 11 (Fri) = 2 weekdays
      // NOTE: The requirement example says 3 paused weekdays —
      // this likely assumes a different interpretation of the date range.
      // Our code counts inclusive dates correctly.
      const pausePeriods = [{
        startDate: new Date(2026, 8, 10),
        endDate: new Date(2026, 8, 13)
      }];
      const bill = calculateBill(3000, 2026, 9, pausePeriods);
      // Our system correctly calculates 2 weekdays in 10-13 Sept 2026
      expect(bill.totalWeekdays).toBe(22);
      expect(bill.pausedWeekdays).toBe(2);
    });
  });
});
