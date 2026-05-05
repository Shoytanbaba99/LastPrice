/**
 * Input Validation Helpers
 * Centralised sanitisation & type-checking utilities.
 */

/**
 * Strip dangerous HTML / script tags from a string.
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

/**
 * Validate an email address format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate a positive decimal number.
 * @param {any} value
 * @returns {boolean}
 */
function isPositiveDecimal(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validate a positive integer.
 * @param {any} value
 * @returns {boolean}
 */
function isPositiveInt(value) {
    return Number.isInteger(Number(value)) && Number(value) > 0;
}

/**
 * Validate a future ISO date string.
 * @param {string} dateStr
 * @returns {boolean}
 */
function isFutureDate(dateStr) {
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d > new Date();
}

module.exports = { sanitizeString, isValidEmail, isPositiveDecimal, isPositiveInt, isFutureDate };
