/**
 * Command to authenticate a registered user.
 */
export class SignInCommand {
    /**
     * @param {{email: string, password: string}} props raw form values.
     */
    constructor({email, password}) {
        this.email = typeof email === 'string' ? email.trim() : '';
        this.password = typeof password === 'string' ? password : '';
    }
}
