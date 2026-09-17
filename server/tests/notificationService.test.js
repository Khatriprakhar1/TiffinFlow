const {
  isPausedOnDate
} = require('../src/services/notificationService');

describe('Notification Service', () => {

  describe('isPausedOnDate', () => {
    test('returns false when no pause periods', () => {
      expect(isPausedOnDate([], new Date(2026, 8, 15))).toBe(false);
    });

    test('returns true when date falls within a closed pause period', () => {
      const pausePeriods = [
        { startDate: new Date(2026, 8, 10), endDate: new Date(2026, 8, 15) }
      ];
      expect(isPausedOnDate(pausePeriods, new Date(2026, 8, 12))).toBe(true);
    });

    test('returns false when date is outside a closed pause period', () => {
      const pausePeriods = [
        { startDate: new Date(2026, 8, 10), endDate: new Date(2026, 8, 15) }
      ];
      expect(isPausedOnDate(pausePeriods, new Date(2026, 8, 16))).toBe(false);
    });

    test('returns true for open-ended pause (endDate null)', () => {
      const pausePeriods = [
        { startDate: new Date(2026, 8, 10), endDate: null }
      ];
      expect(isPausedOnDate(pausePeriods, new Date(2026, 8, 20))).toBe(true);
    });

    test('returns false for date before open-ended pause starts', () => {
      const pausePeriods = [
        { startDate: new Date(2026, 8, 15), endDate: null }
      ];
      expect(isPausedOnDate(pausePeriods, new Date(2026, 8, 10))).toBe(false);
    });

    test('returns true on the start date of a pause', () => {
      const pausePeriods = [
        { startDate: new Date(2026, 8, 10), endDate: new Date(2026, 8, 12) }
      ];
      expect(isPausedOnDate(pausePeriods, new Date(2026, 8, 10))).toBe(true);
    });

    test('returns true on the end date of a pause', () => {
      const pausePeriods = [
        { startDate: new Date(2026, 8, 10), endDate: new Date(2026, 8, 12) }
      ];
      expect(isPausedOnDate(pausePeriods, new Date(2026, 8, 12))).toBe(true);
    });

    test('handles multiple pause periods correctly', () => {
      const pausePeriods = [
        { startDate: new Date(2026, 8, 5), endDate: new Date(2026, 8, 7) },
        { startDate: new Date(2026, 8, 20), endDate: new Date(2026, 8, 22) }
      ];
      // In first pause
      expect(isPausedOnDate(pausePeriods, new Date(2026, 8, 6))).toBe(true);
      // Between pauses
      expect(isPausedOnDate(pausePeriods, new Date(2026, 8, 10))).toBe(false);
      // In second pause
      expect(isPausedOnDate(pausePeriods, new Date(2026, 8, 21))).toBe(true);
    });
  });

});
