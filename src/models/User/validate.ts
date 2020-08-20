import { compare } from 'bcryptjs';

import { ArgumentsErrorFieldsObject } from '../../errors';
import { checkShouldThrowArgumentsError } from '../../utils/validation';

import { NewUserArgs, UserLoginArgs, FullUserResponse } from './types';
import User from './';

export const newUser = async (body: NewUserArgs): Promise<void> => {
    const { username, email, password, passwordConfirm, ...unknownArguments } = body;
    const errors: ArgumentsErrorFieldsObject = {};

    // Username
    if (!username) {
        errors.username = 'Username is required';
    } else if (username.length > 20) {
        errors.username = 'Username can not be more than 20 characters';
    } else if (!/^[a-zA-Z0-9]+$/g.test(username)) {
        errors.username = 'Username can only contain letters and numbers';
    } else if (await User.findByUsername(username)) {
        errors.username = 'Username taken';
    }

    // Email
    if (email) {
        if (!/^[\w\d._%+-]+@[\w\d.-]+\.[\w]{2,4}$/g.test(email)) {
            errors.email = 'Email invalid';
        }
    }

    // Password
    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (!passwordConfirm) {
        errors.passwordConfirm = 'Confirm your password';
    } else if (passwordConfirm !== password) {
        errors.passwordConfirm = 'Passwords do not match';
    }

    for (const key in unknownArguments) {
        errors[key] = `Unknown argument: ${key}`;
    }

    checkShouldThrowArgumentsError(errors);
};

export const login = async (body: UserLoginArgs): Promise<FullUserResponse | undefined> => {
    const { username, password, ...unknownArguments } = body;
    const errors: ArgumentsErrorFieldsObject = {};
    let user: FullUserResponse | undefined;

    // Username
    if (!username) {
        errors.username = 'Username is required';
    } else {
        user = await User.findByUsername(username);
    }

    // Password
    if (!password) {
        errors.password = 'Password is required';
    } else if (!user || !(await compare(password, user.password))) {
        errors.username = 'Username or password incorrect';
    }

    for (const key in unknownArguments) {
        errors[key] = `Unknown argument: ${key}`;
    }

    checkShouldThrowArgumentsError(errors);

    return user;
};
