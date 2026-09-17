const {
  normalizePhone,
  parseFlexibleDate,
  normalizeName
} = require('../src/services/importService');

describe('Import Service', () => {

  describe('normalizePhone', () => {
    test('valid 10-digit phone passes through', () => {
      expect(normalizePhone('9876543210')).toBe('9876543210');
    });

    test('strips +91 country code', () => {
      expect(normalizePhone('+919876543210')).toBe('9876543210');
    });

    test('strips 91 prefix without +', () => {
      expect(normalizePhone('919876543210')).toBe('9876543210');
    });

    test('strips leading 0', () => {
      expect(normalizePhone('09876543210')).toBe('9876543210');
    });

    test('strips spaces', () => {
      expect(normalizePhone('987 654 3210')).toBe('9876543210');
    });

    test('strips dashes', () => {
      expect(normalizePhone('987-654-3210')).toBe('9876543210');
    });

    test('strips parentheses and dots', () => {
      expect(normalizePhone('(987) 654.3210')).toBe('9876543210');
    });

    test('returns null for too short', () => {
      expect(normalizePhone('12345')).toBeNull();
    });

    test('returns null for empty string', () => {
      expect(normalizePhone('')).toBeNull();
    });

    test('returns null for null input', () => {
      expect(normalizePhone(null)).toBeNull();
    });

    test('returns null for undefined input', () => {
      expect(normalizePhone(undefined)).toBeNull();
    });

    test('strips +91 with space', () => {
      expect(normalizePhone('+91 9876543210')).toBe('9876543210');
    });
  });

  describe('parseFlexibleDate', () => {
    test('ISO format YYYY-MM-DD', () => {
      const d = parseFlexibleDate('2026-09-15');
      expect(d).toBeInstanceOf(Date);
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(8); // 0-indexed
      expect(d.getDate()).toBe(15);
    });

    test('DD/MM/YYYY format', () => {
      const d = parseFlexibleDate('15/09/2026');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(8);
      expect(d.getDate()).toBe(15);
    });

    test('DD-MM-YYYY format', () => {
      const d = parseFlexibleDate('15-09-2026');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(8);
      expect(d.getDate()).toBe(15);
    });

    test('DD Mon YYYY format', () => {
      const d = parseFlexibleDate('15 Sep 2026');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(8);
      expect(d.getDate()).toBe(15);
    });

    test('DD-Mon-YYYY format', () => {
      const d = parseFlexibleDate('15-September-2026');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(8);
      expect(d.getDate()).toBe(15);
    });

    test('handles Date object input', () => {
      const input = new Date(2026, 8, 15);
      const d = parseFlexibleDate(input);
      expect(d.getDate()).toBe(15);
    });

    test('returns null for empty string', () => {
      expect(parseFlexibleDate('')).toBeNull();
    });

    test('returns null for null', () => {
      expect(parseFlexibleDate(null)).toBeNull();
    });

    test('returns null for garbage', () => {
      expect(parseFlexibleDate('not-a-date')).toBeNull();
    });

    test('unambiguous DD/MM: day > 12 forces DD/MM', () => {
      const d = parseFlexibleDate('25/09/2026');
      expect(d.getDate()).toBe(25);
      expect(d.getMonth()).toBe(8);
    });

    test('unambiguous MM/DD: month slot > 12 forces MM/DD', () => {
      const d = parseFlexibleDate('09/25/2026');
      expect(d.getDate()).toBe(25);
      expect(d.getMonth()).toBe(8);
    });
  });

  describe('normalizeName', () => {
    test('trims whitespace', () => {
      expect(normalizeName('  John Doe  ')).toBe('John Doe');
    });

    test('collapses multiple spaces', () => {
      expect(normalizeName('John    Doe')).toBe('John Doe');
    });

    test('returns null for empty string', () => {
      expect(normalizeName('')).toBeNull();
    });

    test('returns null for whitespace only', () => {
      expect(normalizeName('   ')).toBeNull();
    });

    test('returns null for null', () => {
      expect(normalizeName(null)).toBeNull();
    });
  });
});
