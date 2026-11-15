/**
 * Command to register a new account. The role is never part of it: the API assigns the default one.
 */
export class SignUpCommand {
    /**
     * @param {{email: string, password: string, fullName: string}} props raw form values.
     */
    constructor({email, password, fullName}) {
        this.email = typeof email === 'string' ? email.trim() : '';
        this.password = typeof password === 'string' ? password : '';
        this.fullName = typeof fullName === 'string' ? fullName.trim() : '';
    }
}
