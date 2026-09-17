const { calculateSplitBill } = require('../src/services/billingService');

describe('Split Bill (Transfer Service)', () => {

  test('full month active range gives same result as full bill', () => {
    const bill = calculateSplitBill(3000, 2026, 9, [], {
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30)
    });
    expect(bill.totalWeekdays).toBe(22);
    expect(bill.activeWeekdays).toBe(22);
    expect(bill.billableDays).toBe(22);
    expect(bill.finalBill).toBe(3000);
  });

  test('first half of month (transfer out mid-month)', () => {
    // Customer A active Sept 1–14 (Mon-Sun weeks)
    // Sept 1-14: Sept 1(Tue), 2(Wed), 3(Thu), 4(Fri), 7(Mon), 8(Tue), 9(Wed), 10(Thu), 11(Fri), 14(Mon) = 10 weekdays
    const bill = calculateSplitBill(3000, 2026, 9, [], {
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 14)
    });
    expect(bill.activeWeekdays).toBe(10);
    expect(bill.dailyRate).toBeCloseTo(136.36, 1);
    expect(bill.finalBill).toBeCloseTo(1363.64, 0);
  });

  test('second half of month (transfer in mid-month)', () => {
    // Customer B active Sept 15–30
    // Sept 15(Tue), 16(Wed), 17(Thu), 18(Fri), 21(Mon), 22(Tue), 23(Wed), 24(Thu), 25(Fri), 28(Mon), 29(Tue), 30(Wed) = 12 weekdays
    const bill = calculateSplitBill(3000, 2026, 9, [], {
      from: new Date(2026, 8, 15),
      to: new Date(2026, 8, 30)
    });
    expect(bill.activeWeekdays).toBe(12);
    expect(bill.finalBill).toBeCloseTo(1636.36, 0);
  });

  test('split bills A + B should equal full month bill', () => {
    const billA = calculateSplitBill(3000, 2026, 9, [], {
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 14)
    });
    const billB = calculateSplitBill(3000, 2026, 9, [], {
      from: new Date(2026, 8, 15),
      to: new Date(2026, 8, 30)
    });
    // Together they should cover all 22 weekdays
    expect(billA.activeWeekdays + billB.activeWeekdays).toBe(22);
    // Bills should sum to ~3000 (within rounding)
    expect(billA.finalBill + billB.finalBill).toBeCloseTo(3000, 0);
  });

  test('split with pause period in active range', () => {
    // Active Sept 1-14, paused Sept 10-11 (Thu-Fri = 2 weekdays)
    const bill = calculateSplitBill(3000, 2026, 9, [
      { startDate: new Date(2026, 8, 10), endDate: new Date(2026, 8, 11) }
    ], {
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 14)
    });
    expect(bill.activeWeekdays).toBe(10);
    expect(bill.pausedWeekdays).toBe(2);
    expect(bill.billableDays).toBe(8);
  });

  test('pause outside active range has no effect', () => {
    // Active Sept 1-14, pause Sept 20-22 (outside range)
    const bill = calculateSplitBill(3000, 2026, 9, [
      { startDate: new Date(2026, 8, 20), endDate: new Date(2026, 8, 22) }
    ], {
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 14)
    });
    expect(bill.pausedWeekdays).toBe(0);
    expect(bill.billableDays).toBe(10);
  });

  test('active range returns correct date strings', () => {
    const bill = calculateSplitBill(3000, 2026, 9, [], {
      from: new Date(2026, 8, 15),
      to: new Date(2026, 8, 30)
    });
    expect(bill.activeRange.from).toBe('2026-09-15');
    expect(bill.activeRange.to).toBe('2026-09-30');
  });
});
