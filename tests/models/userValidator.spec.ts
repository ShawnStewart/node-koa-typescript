import bcrypt from 'bcryptjs';

import User from '../../src/models/User';
import { FullUserResponse, NewUserArgs } from '../../src/models/User/types';
import * as userValidator from '../../src/models/User/validate';
import * as validationUtils from '../../src/utils/validation';

describe('userValidator', () => {
    let mockCheckErrors: jest.SpyInstance;

    beforeEach(() => {
        mockCheckErrors = jest.spyOn(validationUtils, 'checkShouldThrowArgumentsError').mockImplementation();
    });

    describe('newUser', () => {
        test('required fields throw if not passed', async () => {
            await userValidator.newUser({});

            expect(mockCheckErrors).toHaveBeenCalledWith(expect.objectContaining({ username: 'Username is required' }));
        });

        test('unknown arguments throw ArgumentsError', async () => {
            await userValidator.newUser({ unknownArgument: true } as NewUserArgs);

            expect(mockCheckErrors).toHaveBeenCalledWith(
                expect.objectContaining({ unknownArgument: 'Unknown argument: unknownArgument' }),
            );
        });

        test('username must be less than 21 characters', async () => {
            await userValidator.newUser({ username: '123456789012345678901' });

            expect(mockCheckErrors).toHaveBeenCalledWith(
                expect.objectContaining({ username: 'Username can not be more than 20 characters' }),
            );
        });

        test('username can only be letters and numbers', async () => {
            const badValues = ['!', '@', '#', '$', '%', '-', '_'];

            for (const username of badValues) {
                await userValidator.newUser({ username });

                expect(mockCheckErrors).toHaveBeenCalledWith(
                    expect.objectContaining({ username: 'Username can only contain letters and numbers' }),
                );
            }
        });

        test('username must be unique', async () => {
            const mockUser = { username: 'shawn' };
            const mockFindByUsername = jest
                .spyOn(User, 'findByUsername')
                .mockImplementation(() => Promise.resolve(mockUser as FullUserResponse));

            await userValidator.newUser({ username: mockUser.username });

            expect(mockFindByUsername).toHaveBeenCalledWith(mockUser.username);
            expect(mockCheckErrors).toHaveBeenCalledWith(expect.objectContaining({ username: 'Username taken' }));
        });

        test('email must be valid', async () => {
            await userValidator.newUser({ email: 'abc' });

            expect(mockCheckErrors).toHaveBeenCalledWith(expect.objectContaining({ email: 'Email invalid' }));
        });

        test('password must be at least 6 characters', async () => {
            await userValidator.newUser({ password: '12345' });

            expect(mockCheckErrors).toHaveBeenCalledWith(
                expect.objectContaining({ password: 'Password must be at least 6 characters' }),
            );
        });

        test('password confirmation must match password', async () => {
            await userValidator.newUser({ password: 'abcdef', passwordConfirm: '123456' });

            expect(mockCheckErrors).toHaveBeenCalledWith(
                expect.objectContaining({ passwordConfirm: 'Passwords do not match' }),
            );
        });
    });

    describe('login', () => {
        test('required fields throw if not passed', async () => {
            await userValidator.login({});

            expect(mockCheckErrors).toHaveBeenCalledWith({
                username: 'Username is required',
                password: 'Password is required',
            });
        });

        test('unknown arguments throw ArgumentsError', async () => {
            await userValidator.login({ unknownArgument: true } as NewUserArgs);

            expect(mockCheckErrors).toHaveBeenCalledWith(
                expect.objectContaining({ unknownArgument: 'Unknown argument: unknownArgument' }),
            );
        });

        test('nonexistent username throws incorrect login', async () => {
            const loginArgs = { username: 'doesNotExist', password: 'password' };

            const mockFindByUsername = jest
                .spyOn(User, 'findByUsername')
                .mockImplementation(() => Promise.resolve(undefined));

            await userValidator.login(loginArgs);

            expect(mockFindByUsername).toHaveBeenCalledWith(loginArgs.username);
            expect(mockCheckErrors).toHaveBeenCalledWith({ username: 'Username or password incorrect' });
        });

        test('incorrect password throws incorrect login', async () => {
            const loginArgs = { username: 'shawn', password: 'incorrect' };
            const mockUser = { username: 'shawn', password: 'password' };
            const mockFindByUsername = jest
                .spyOn(User, 'findByUsername')
                .mockImplementation(() => Promise.resolve(mockUser as FullUserResponse));
            const mockBcryptCompare = jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

            await userValidator.login(loginArgs);

            expect(mockFindByUsername).toHaveBeenCalledWith(loginArgs.username);
            expect(mockBcryptCompare).toHaveBeenCalledWith(loginArgs.password, mockUser.password);
            expect(mockCheckErrors).toHaveBeenCalledWith({ username: 'Username or password incorrect' });
        });
    });
});
