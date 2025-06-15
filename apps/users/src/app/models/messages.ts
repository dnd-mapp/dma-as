export const createFailedUsernameTaken = (username: string) =>
    `Could not create User. - Reason: Username "${username}" is not available`;

export const updateFailedInvalidPathAndId = (path: string, id: string) =>
    `Could not update User. - Reason: It's forbidden to update User on path "${path}" with data from User with ID "${id}"`;

export const updateFailedNotFound = (userId: string) =>
    `Could not update User with ID "${userId}". - Reason: User was not found`;

export const updateFailedUsernameTaken = (userId: string, username: string) =>
    `Could not update User with ID "${userId}". - Reason: Username "${username}" is not available`;

export const updateFailedPasswordMismatch = (userId: string) =>
    `Could not update User with ID "${userId}". - Reason: Current password is invalid`;

export const updateFailedEmailMismatch = (userId: string) =>
    `Could not update User with ID "${userId}". - Reason: Current email address is invalid`;

export const updateFailedEmailVerificationCodeInvalid = (userId: string) =>
    `Could not update User with ID "${userId}". - Reason: Invalid email verification code`;

export const updateFailedEmailVerificationCodeExpired = (userId: string) =>
    `Could not update User with ID "${userId}". - Reason: Email verification code expired`;

export const removeFailedNotFound = (userId: string) =>
    `Could not remove User with ID "${userId}". - Reason: User was not found`;

export const getFailedUsernameNotFound = (username: string) => `User with username "${username}" was not found`;

export const getFailedIdNotFound = (userId: string) => `User with ID "${userId}" was not found`;
