import {useI18n} from "vue-i18n";

/**
 * Translated validation messages for form fields. Each check returns an empty string when the value
 * is valid. The limits come from the domain Value Objects, so the form and the model never disagree.
 */
export function useFormValidation() {
    const {t} = useI18n();

    const required = value => (value === null || value === undefined || value === '' ? t('validation.required') : '');

    const requiredText = (value, maxLength) => {
        const text = typeof value === 'string' ? value.trim() : '';
        if (!text) return t('validation.required');
        return text.length > maxLength ? t('validation.max-length', {max: maxLength}) : '';
    };

    const optionalText = (value, maxLength) =>
        (typeof value === 'string' && value.trim().length > maxLength ? t('validation.max-length', {max: maxLength}) : '');

    const positiveNumber = value => {
        if (value === null || value === undefined) return t('validation.required');
        return value > 0 ? '' : t('validation.positive');
    };

    const wholeNumber = value => {
        if (value === null || value === undefined) return t('validation.required');
        return Number.isInteger(value) && value >= 0 ? '' : t('validation.whole-number');
    };

    const percentage = value => {
        if (value === null || value === undefined) return t('validation.required');
        return value >= 0 && value <= 100 ? '' : t('validation.percentage');
    };

    const notInFuture = date => {
        if (!date) return t('validation.required');
        return date.getTime() > Date.now() ? t('validation.not-future') : '';
    };

    return {required, requiredText, optionalText, positiveNumber, wholeNumber, percentage, notInFuture};
}

/**
 * @param {Record<string, string>} fieldErrors
 * @returns {boolean} true when no field has an error.
 */
export function hasNoErrors(fieldErrors) {
    return Object.values(fieldErrors).every(error => !error);
}
