import { ArgumentsError } from '../../src/errors';
import * as validationUtils from '../../src/utils/validation';

describe('checkShouldThrowArgumentsError', () => {
    test('should throw', async () => {
        const errors = { testError: 'error message' };
        console.log('going to validate', errors);
        try {
            await validationUtils.checkShouldThrowArgumentsError(errors);
            fail('Expected validationUtils.checkShouldThrowArgumentsError() to throw');
        } catch (error) {
            console.log('caught error', error);
            const e = error as ArgumentsError;

            expect(e).toBeInstanceOf(ArgumentsError);
            expect(e.status).toEqual(406);
            expect(e.fields).toEqual(expect.objectContaining(errors));
        }
    });

    test('should not throw', async () => {
        const noErrors = {};

        try {
            await validationUtils.checkShouldThrowArgumentsError(noErrors);
        } catch (error) {
            fail(`Expected validationUtils.checkShouldThrowArgumentsError() not to throw, but threw with:\n${error}`);
        }
    });
});
