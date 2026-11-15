/**
 * Command used by an administrator to register a user with a chosen role.
 */
export class RegisterUserCommand {
    /**
     * @param {{email: string, password: string, fullName: string, jobTitle?: string, phoneNumber?: string, role: string}} props
     */
    constructor({email, password, fullName, jobTitle = '', phoneNumber = '', role}) {
        this.email = typeof email === 'string' ? email.trim() : '';
        this.password = typeof password === 'string' ? password : '';
        this.fullName = typeof fullName === 'string' ? fullName.trim() : '';
        this.jobTitle = typeof jobTitle === 'string' ? jobTitle.trim() : '';
        this.phoneNumber = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';
        this.role = role;
    }
}
