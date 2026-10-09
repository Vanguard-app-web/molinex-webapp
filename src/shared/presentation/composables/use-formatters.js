import {useI18n} from "vue-i18n";

/**
 * Locale-aware formatting for dates, numbers, weights and percentages. It formats plain values
 * only, so the shared module stays free of business rules.
 */
export function useFormatters() {
    const {d, n, t} = useI18n();

    const formatDateTime = date => (date ? d(date, 'dateTime') : '—');
    const formatDate = date => (date ? d(date, 'date') : '—');
    const formatTime = date => (date ? d(date, 'time') : '—');
    const formatDay = date => (date ? d(date, 'day') : '—');
    const formatNumber = (value, format = 'decimal') => (value === null || value === undefined ? '—' : n(value, format));
    /** @param {{value: number, unit: string}|null} weight a Weight or any value with its unit. */
    const formatWeight = weight => (weight ? `${n(weight.value, 'decimal')} ${t(`units.${weight.unit}`)}` : '—');
    const formatPercentage = value => (value === null || value === undefined ? '—' : `${n(value, 'decimal')} %`);

    return {formatDateTime, formatDate, formatTime, formatDay, formatNumber, formatWeight, formatPercentage};
}

/**
 * @param {Date} date
 * @returns {string} the local calendar day of the date as YYYY-MM-DD, to group and filter by day.
 */
export function toLocalDateKey(date) {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}
