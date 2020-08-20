export interface NewUserArgs {
    username?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
}

export interface UserLoginArgs {
    username?: string;
    password?: string;
}

export interface SafeUserResponse {
    username: string;
    email?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletedAt?: Date;
    isDeleted: boolean;
}

export interface FullUserResponse extends SafeUserResponse {
    password: string;
}
