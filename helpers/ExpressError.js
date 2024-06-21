class ExpressError extends Error {
    constructor(status, message) {
        super();
        this.name = 'ExpressError';
        this.status = status;
        this.message = message;
    }
}

export default ExpressError;
