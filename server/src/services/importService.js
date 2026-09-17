/**
 * Import Service
 * Processes a messy customer list: normalizes, validates, deduplicates,
 * and imports clean records into the database.
 */

const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');

/**
 * Normalize a phone number by stripping non-digit noise.
 * Handles: +91, 0-prefix, spaces, dashes, parentheses, dots.
 * Returns a clean 10-digit string or null if invalid.
 *
 * @param {string} raw - Raw phone input
 * @returns {string|null} Cleaned 10-digit phone or null
 */
function normalizePhone(raw) {
  if (!raw || typeof raw !== 'string') return null;

  // Strip all non-digit characters
  let digits = raw.replace(/[^\d]/g, '');

  // Remove leading country code
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  }
  // Remove leading 0
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  return digits.length === 10 ? digits : null;
}

/**
 * Try to parse a date from various messy formats.
 * Supported formats:
 *   - YYYY-MM-DD (ISO)
 *   - DD/MM/YYYY
 *   - DD-MM-YYYY
 *   - MM/DD/YYYY (US-style, tried after DD/MM if DD > 12)
 *   - DD Mon YYYY or DD-Mon-YYYY (e.g. 15 Sep 2026, 15-Sep-2026)
 *   - ISO 8601 full (2026-09-17T10:00:00Z)
 *   - JS Date-parseable strings (fallback)
 *
 * @param {string|number|Date} raw - Raw date input
 * @returns {Date|null} Parsed date or null
 */
function parseFlexibleDate(raw) {
  if (!raw) return null;

  // Already a Date
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? null : raw;
  }

  // Number (timestamp)
  if (typeof raw === 'number') {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const d = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    if (!isNaN(d.getTime())) return d;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const a = parseInt(dmyMatch[1]);
    const b = parseInt(dmyMatch[2]);
    const year = parseInt(dmyMatch[3]);

    // If first number > 12, it must be day (DD/MM/YYYY)
    if (a > 12) {
      const d = new Date(year, b - 1, a);
      if (!isNaN(d.getTime()) && d.getDate() === a) return d;
    }
    // If second number > 12, it must be day (MM/DD/YYYY)
    if (b > 12) {
      const d = new Date(year, a - 1, b);
      if (!isNaN(d.getTime()) && d.getDate() === b) return d;
    }
    // Ambiguous — default to DD/MM/YYYY (Indian format)
    if (a <= 12 && b <= 12) {
      const d = new Date(year, b - 1, a);
      if (!isNaN(d.getTime()) && d.getDate() === a) return d;
    }
  }

  // DD Mon YYYY or DD-Mon-YYYY (e.g. "15 Sep 2026", "15-Sep-2026")
  const monthNames = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5,
    jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8,
    oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
  };
  const textMatch = trimmed.match(/^(\d{1,2})[\s\-]([a-zA-Z]+)[\s\-](\d{4})$/);
  if (textMatch) {
    const day = parseInt(textMatch[1]);
    const monthKey = textMatch[2].toLowerCase();
    const year = parseInt(textMatch[3]);
    if (monthNames[monthKey] !== undefined) {
      const d = new Date(year, monthNames[monthKey], day);
      if (!isNaN(d.getTime()) && d.getDate() === day) return d;
    }
  }

  // Fallback: try native Date.parse
  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

/**
 * Normalize a customer name: trim, collapse whitespace, title-case.
 *
 * @param {string} raw
 * @returns {string|null}
 */
function normalizeName(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;
  return trimmed;
}

/**
 * Process a messy batch of customer data.
 *
 * @param {Array<Object>} rows - Array of customer objects with potentially messy data
 * @returns {Object} { imported: [], deduped: [], rejected: [], summary: {} }
 */
async function processImport(rows) {
  if (!Array.isArray(rows)) {
    throw new Error('Input must be an array of customer records');
  }

  const imported = [];
  const deduped = [];
  const rejected = [];

  // Track phones seen in this batch for intra-batch dedup
  const seenPhones = new Map(); // normalizedPhone -> index of first occurrence

  // Pre-fetch existing phones from DB for DB-level dedup
  const allCustomers = await Customer.find({}, { phone: 1 });
  const existingPhones = new Set(allCustomers.map(c => c.phone));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 1; // 1-indexed for human readability
    const errors = [];

    // --- Normalize ---
    const name = normalizeName(row.name);
    const phone = normalizePhone(row.phone);
    const address = row.address ? String(row.address).trim() : null;
    const planPrice = row.planPrice != null ? Number(row.planPrice) : null;
    const planStartDate = parseFlexibleDate(row.planStartDate || row.startDate || row.date);

    // --- Validate ---
    if (!name) errors.push('Missing or invalid name');
    if (!phone) errors.push(`Invalid phone: "${row.phone || ''}"`);
    if (!address) errors.push('Missing address');
    if (planPrice === null || isNaN(planPrice) || planPrice <= 0) {
      errors.push(`Invalid plan price: "${row.planPrice || ''}"`);
    }
    if (!planStartDate) {
      errors.push(`Unparseable date: "${row.planStartDate || row.startDate || row.date || ''}"`);
    }

    if (errors.length > 0) {
      rejected.push({
        row: rowIndex,
        original: row,
        reasons: errors
      });
      continue;
    }

    // --- Deduplicate: intra-batch ---
    if (seenPhones.has(phone)) {
      deduped.push({
        row: rowIndex,
        original: row,
        normalizedPhone: phone,
        reason: `Duplicate phone in batch (first seen at row ${seenPhones.get(phone)})`
      });
      continue;
    }

    // --- Deduplicate: against existing DB records ---
    if (existingPhones.has(phone)) {
      deduped.push({
        row: rowIndex,
        original: row,
        normalizedPhone: phone,
        reason: 'Phone already exists in database'
      });
      seenPhones.set(phone, rowIndex);
      continue;
    }

    // --- Insert ---
    try {
      const customer = await Customer.create({
        name,
        phone,
        address,
        planPrice,
        planStartDate
      });

      await Subscription.create({
        customerId: customer._id,
        monthlyPrice: planPrice,
        startDate: planStartDate,
        pausePeriods: []
      });

      imported.push({
        row: rowIndex,
        customerId: customer._id,
        name,
        phone,
        planPrice,
        planStartDate: planStartDate.toISOString().split('T')[0]
      });

      seenPhones.set(phone, rowIndex);
      existingPhones.add(phone); // prevent within-batch DB conflicts
    } catch (err) {
      // Handle unexpected DB errors (e.g. race condition duplicates)
      rejected.push({
        row: rowIndex,
        original: row,
        reasons: [`Database error: ${err.message}`]
      });
    }
  }

  return {
    imported,
    deduped,
    rejected,
    summary: {
      total: rows.length,
      importedCount: imported.length,
      dedupedCount: deduped.length,
      rejectedCount: rejected.length
    }
  };
}

module.exports = {
  normalizePhone,
  parseFlexibleDate,
  normalizeName,
  processImport
};
