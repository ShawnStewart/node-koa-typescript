import { ArgumentsError, ArgumentsErrorFieldsObject } from '../errors';

export const checkShouldThrowArgumentsError = (errors: ArgumentsErrorFieldsObject): void => {
    if (Object.keys(errors).length) {
        throw new ArgumentsError(errors);
    }
};
