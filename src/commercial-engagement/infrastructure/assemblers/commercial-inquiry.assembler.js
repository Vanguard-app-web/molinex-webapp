import {CommercialInquiry} from "../../domain/model/commercial-inquiry.entity.js";
import {CommercialInquiryId} from "../../domain/model/commercial-inquiry-id.js";
import {ContactInformation} from "../../domain/model/contact-information.js";
import {FullName} from "../../domain/model/full-name.js";
import {EmailAddress} from "../../domain/model/email-address.js";
import {PhoneNumber} from "../../domain/model/phone-number.js";
import {CompanyName} from "../../domain/model/company-name.js";
import {InquiryMessage} from "../../domain/model/inquiry-message.js";
import {SubmissionDateTime} from "../../domain/model/submission-date-time.js";

/**
 * Resource exchanged with the inquiries endpoint. A draft sent by the form has no `id` or
 * `submittedAt`: the API assigns both.
 * @typedef {Object} CommercialInquiryResource
 * @property {string} [id]
 * @property {string} fullName
 * @property {string} email
 * @property {string} [phone] omitted when the visitor gave none.
 * @property {string} companyName
 * @property {string} message
 * @property {string} [submittedAt] ISO 8601 date and time.
 */

export class CommercialInquiryAssembler {
    /**
     * @param {CommercialInquiryResource} resource
     * @returns {CommercialInquiry}
     */
    static toEntity(resource) {
        const hasPhone = typeof resource.phone === 'string' && resource.phone.trim() !== '';
        return new CommercialInquiry({
            id: resource.id === undefined || resource.id === null ? null : new CommercialInquiryId(resource.id),
            contact: new ContactInformation({
                fullName: new FullName(resource.fullName),
                email: new EmailAddress(resource.email),
                phone: hasPhone ? new PhoneNumber(resource.phone) : null,
                companyName: new CompanyName(resource.companyName),
            }),
            message: new InquiryMessage(resource.message),
            submittedAt: resource.submittedAt ? new SubmissionDateTime(resource.submittedAt) : null,
        });
    }

    /**
     * @param {CommercialInquiry} entity
     * @returns {CommercialInquiryResource}
     */
    static toResource(entity) {
        const { contact } = entity;
        return {
            ...(entity.id ? {id: entity.id.value} : {}),
            fullName: contact.fullName.value,
            email: contact.email.value,
            ...(contact.phone ? {phone: contact.phone.value} : {}),
            companyName: contact.companyName.value,
            message: entity.message.value,
            ...(entity.submittedAt ? {submittedAt: entity.submittedAt.value.toISOString()} : {}),
        };
    }
}
