import { User } from "../entity/user.entity";
import { getRepository } from "typeorm";
import bCrypt from "bcrypt";
import randomString from "randomstring";
import * as jwt from "jsonwebtoken";
import { EmailService } from "./email.service";
const emailService = new EmailService();
import { Boolean } from "../enums/enums";

export class UserService {
    constructor() { }

    createNewUser(email: string, password: string, fullName: string) {
        //making sure it will return response only after processing all the required data
        return new Promise(async (resolve: any, reject: any) => {
            //try and catch block to prevent application from getting crashed
            try {
                const userRepository = getRepository(User); //defined user repository to run queries
                //before creating new user check if there is another user with the same email
                let user: any = await this.getUserDetailsFromEmail(email);
                if (user.status) {
                    //if user already exists, return false status with accurate message
                    resolve({
                        status: false,
                        message: `User already exists`
                    });
                }
                else {
                    //encrypting user password before storing it into database
                    let hasString: any = await this.hashString(password);
                    let verificationToken = this.generateRandomString(64);
                    if (hasString.status) {
                        let userObject = new User();
                        userObject.email = email;
                        userObject.password = hasString.result;
                        userObject.fullName = fullName;
                        userObject.accountVerificationToken = verificationToken;
                        userObject.accountVerificationTokenTimeStamp = new Date(Date.now());
                        //save values in the database
                        let save = await userRepository.save(userObject);
                        //send account verification email
                        emailService.accountVerificationEmail(email, save.id, verificationToken);
                        resolve({
                            status: true,
                            message: `User created successfully, please check your email for account verification`
                        });
                    }
                    else {
                        resolve({
                            status: false,
                            message: `Error, please check server logs for more information.`
                        });
                    }
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information.'
                });
            }
        });
    }

    generateRandomString(length: number) {
        //generating random string of given length
        let generatedRandomString = randomString.generate({
            length: length,
            charset: "alphanumeric",
        });
        return generatedRandomString;
    }

    hashString(string: string) {
        return new Promise((resolve: any, reject: any) => {
            try {
                //encrypting string using a library
                bCrypt.hash(string, 10, async (err, encryptedString) => {
                    if (err) {
                        console.log(err);
                        resolve({
                            status: false,
                            error: err,
                        });
                    } else {
                        //if encryption process succeeds return encrypted value
                        resolve({
                            status: true,
                            result: encryptedString,
                        });
                    }
                });
            }
            catch (e) {
                console.log(e);
                resolve({
                    status: false,
                    error: e,
                });
            }
        });
    }

    getUserDetailsFromId(userId: number) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const userRepository = getRepository(User);
                //check if user exists with given user id
                let user = await userRepository.findOne(userId);
                //if user exists return status = true else false
                if (user) {
                    resolve({
                        status: true,
                        result: user
                    });
                }
                else {
                    resolve({
                        status: false,
                        message: `User doesn't exists`
                    });
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information.'
                });
            }
        });
    }

    getUserDetailsFromEmail(userEmail: string) {
        return new Promise(async (resolve: any, reject: any) => {
            //try and catch block to prevent application from getting crashed
            try {
                const userRepository = getRepository(User);
                //check if user exists with given email
                let user = await userRepository.findOne({
                    email: userEmail
                });
                //if user exists return status = true else false
                if (user) {
                    resolve({
                        status: true,
                        result: user
                    });
                }
                else {
                    resolve({
                        status: false,
                        message: `User doesn't exists`
                    });
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information.'
                });
            }
        });
    }

    verifyUserAccount(userId: number, token: string) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const userRepository = getRepository(User);
                //check if user exists
                let user: any = await this.getUserDetailsFromId(userId);
                if (user.status) {
                    let userDetails: User = user.result;
                    //return if user verified already
                    if (userDetails.isVerified == Boolean.True) {
                        resolve({
                            status: false,
                            message: 'User already verified'
                        });
                    }
                    else {
                        //get timestamp when verification email was sent
                        let tokenTimestamp = userDetails.accountVerificationTokenTimeStamp;
                        //getting difference between user creation time and current. If it is more than 48 hours, user can not be verified with the same token
                        let timestampDifference = await this.getTimestampDifference(tokenTimestamp.toString(), new Date(Date.now()).toISOString());
                        if (timestampDifference) {
                            resolve({
                                status: false,
                                message: 'Verification link expired, click below to get new link in your email.'
                            });
                        }
                        else {
                            //verify if the token is authenticate
                            if (userDetails.accountVerificationToken === token) {
                                userDetails.isVerified = Boolean.True;
                                await userRepository.save(userDetails);
                                resolve({
                                    status: true,
                                    message: 'Account verified successfully.'
                                });
                            } else {
                                resolve({
                                    status: false,
                                    message: "Invalid token"
                                });
                            }
                        }
                    }
                }
                else {
                    resolve({
                        status: false,
                        message: 'User does not exist'
                    });
                }
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'error'
                });
            }
        });
    }

    resendVerification(userEmail: string) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const userRepository = getRepository(User);
                let isUserExist: any = await this.getUserDetailsFromEmail(userEmail);
                let emailToken = this.generateRandomString(64);
                if (isUserExist.status) {
                    if (isUserExist.result.isVerified == Boolean.True) {
                        resolve({
                            status: false,
                            message: 'User already verified'
                        });
                    }
                    else {
                        //storing new token to verify user account
                        isUserExist.result.accountVerificationToken = emailToken;
                        isUserExist.result.accountVerificationTokenTimeStamp = new Date(Date.now());
                        isUserExist.result.isVerified = Boolean.False;
                        await userRepository.save(isUserExist.result);
                        emailService.accountVerificationEmail(userEmail, isUserExist.result.id, emailToken);
                        resolve({
                            status: true,
                            message: 'Account verification email sent'
                        });
                    }
                }
                else {
                    resolve({
                        status: false,
                        message: 'User does not exist'
                    });
                }
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'error'
                });
            }
        });
    }

    login(email: string, password: string) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                //check if user exists
                let user: any = await this.getUserDetailsFromEmail(email);
                if (user.status) {
                    if (user.result.isVerified == Boolean.True) {
                        //compare user password for authentication
                        let isPasswordVerified = await this.compareHashString(password, user.result.password);
                        if (isPasswordVerified) {
                            //deleting password
                            delete user.result.password;

                            //create token to use for user authentication
                            let jwtToken = jwt.sign({
                                id: user.result.id,
                                role: user.result.role,
                            }, process.env.JWT_SECRET!, { expiresIn: '3 days' });
                            resolve({
                                status: true,
                                message: "Login successful",
                                token: jwtToken,
                                result: user.result
                            });
                        }
                        else {
                            resolve({
                                status: false,
                                message: "Invalid credentials"
                            });
                        }
                    }
                    else {
                        resolve({
                            status: false,
                            message: `Please verify your account first`
                        });
                    }
                }
                else {
                    resolve({
                        status: false,
                        message: `User doesn't exists`
                    });
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information.'
                });
            }
        });
    }

    //comparing two different timestamps
    getTimestampDifference(prevTime: string, currentTime: string) {
        return new Promise(async (resolve, reject) => {
            let currentTimeUnix = new Date(currentTime).getTime();
            let prevTimeUnix = new Date(prevTime).getTime();
            let subtract = currentTimeUnix - prevTimeUnix;
            let formula = 48 * 60 * 60 * 1000;
            if (subtract > formula) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }


    compareHashString(string: string, hashString: string) {
        return new Promise((resolve: any, reject: any) => {
            //comparing user password with the one stored in DB
            bCrypt.compare(string, hashString, async (err, isVerified) => {
                if (err) {
                    console.log(err);
                    resolve(false);
                } else {
                    if (isVerified) {
                        resolve(isVerified);
                    } else {
                        resolve(false);
                    }
                }
            });
        });
    }

    forgotPassword(email: string) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const userRepository = getRepository(User);
                //check if user exists
                let isUser = await userRepository.findOne({
                    email: email
                });
                if (isUser) {
                    if (isUser.isVerified == Boolean.True) {
                        let token = this.generateRandomString(30);
                        isUser.forgotPasswordToken = token;
                        isUser.forgotPasswordTokenTimeStamp = new Date(Date.now());
                        await userRepository.save(isUser);
                        //sending forgot password email
                        emailService.forgotPasswordEmail(isUser.email, isUser.id, token);
                        resolve({
                            status: true,
                            message: 'A reset password link sent to your email'
                        });
                    }
                    else {
                        resolve({
                            status: false,
                            message: `Please verify your account first!`
                        });
                    }
                }
                else {
                    resolve({
                        status: false,
                        message: `Account not found!`
                    });
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information.'
                });
            }
        });
    }

    verifyFpToken(userId: number, token: string) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const userRepository = getRepository(User);
                let isUser = await userRepository.findOne(userId);
                if (isUser) {
                    //check if received token is the one was sent to user
                    if (token == isUser.forgotPasswordToken) {
                        //compare token sent time, it should not be more than 48 hours
                        let timestampDifference = await this.getTimestampDifference(isUser.forgotPasswordTokenTimeStamp.toString(), new Date(Date.now()).toISOString());
                        if (timestampDifference) {
                            //if token has expired, server will send email again to user with updated link
                            let emailToken = this.generateRandomString(30);
                            isUser.forgotPasswordToken = emailToken;
                            isUser.forgotPasswordTokenTimeStamp = new Date(Date.now());
                            await userRepository.save(isUser);
                            //sending forgot password email
                            emailService.forgotPasswordEmail(isUser.email, isUser.id, token);
                            resolve({
                                status: false,
                                message: `Link expired. A new password link has been sent to your email`
                            });
                        }
                        else {
                            //create JWT for user
                            let jwtToken = jwt.sign(
                                {
                                    id: userId,
                                    role: isUser.role,
                                },
                                process.env.JWT_SECRET!,
                                { expiresIn: "1 days" }
                            );
                            resolve({
                                status: true,
                                message: jwtToken
                            });
                        }
                    }
                    else {
                        resolve({
                            status: false,
                            message: 'Invalid token'
                        });
                    }

                }
                else {
                    resolve({
                        status: false,
                        message: `Account not found!`
                    });
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information.'
                });
            }
        });
    }

    resetPassword(userId: number, userPassword: string, token: string) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const userRepo = getRepository(User);
                let isUserExist: any = await this.getUserDetailsFromId(userId);
                if (isUserExist.status) {
                    //check if received token is valid by comparing it with database
                    if (token === isUserExist.result.forgotPasswordToken) {
                        let hasString: any = await this.hashString(userPassword);
                        //update token so it can not be used twice
                        isUserExist.result.forgotPasswordToken = "";
                        isUserExist.result.password = hasString.result;
                        await userRepo.save(isUserExist.result);
                        resolve({
                            status: true,
                            message: 'Password updated successfully'
                        });
                    }
                    else {
                        resolve({
                            status: false,
                            message: `Invalid token`
                        });
                    }
                }
                else {
                    resolve({
                        status: false,
                        message: 'No user found',
                    });
                }
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'error'
                });
            }
        });
    }

    changePassword(userId: number, oldPassword: string, newPassword: string) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const userRepository = getRepository(User);
                //check if user exists
                let user = await userRepository.findOne(userId);
                if (user) {
                    //compare old password with the one stored in the database
                    let isPasswordVerified = await this.compareHashString(oldPassword, user.password);
                    if (isPasswordVerified) {
                        //create hash string of new password
                        let hasString: any = await this.hashString(newPassword);
                        if (hasString.status) {
                            //update new has string as new password
                            user.password = hasString.result;
                            await userRepository.save(user);
                            resolve({
                                status: true,
                                message: `Password updated successfully`
                            });
                        }
                        else {
                            resolve({
                                status: false,
                                message: `Error, please contact administrator`
                            });
                        }
                    }
                    else {
                        resolve({
                            status: false,
                            message: `Incorrect old password`
                        });
                    }
                }
                else {
                    resolve({
                        status: false,
                        message: `Account not found!`
                    });
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information.'
                });
            }
        });
    }
}