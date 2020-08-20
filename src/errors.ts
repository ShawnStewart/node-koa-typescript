export class InternalServerError extends Error {
    status: Number;

    constructor(
        message = 'The server encountered an internal error and was unable to process your request',
        status = 500,
    ) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message;
        this.status = status;
    }
}

export class InvalidEndpointError extends InternalServerError {
    constructor(method: string, url: string) {
        super(`Failed to route request: ${method} ${url}`, 404);
    }
}

export interface ArgumentsErrorFieldsObject {
    [key: string]: string;
}

export class ArgumentsError extends InternalServerError {
    fields: ArgumentsErrorFieldsObject;

    constructor(fields: ArgumentsErrorFieldsObject) {
        super('Request contained invalid arguments', 406);

        this.fields = fields;
    }
}

export class UnauthorizedError extends InternalServerError {
    constructor(message = 'Authentication is required to make this request') {
        super(message, 401);
    }
}

export class AuthTokenExpiredError extends UnauthorizedError {
    expiredAt: Date;

    constructor(expiredAt: Date, message = 'Token expired') {
        super(message);

        this.expiredAt = expiredAt;
    }
}
