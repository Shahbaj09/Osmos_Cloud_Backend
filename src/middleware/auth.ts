import * as jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET;
import { Response, NextFunction } from "express";
import { IRequest } from "./IRequest";
import { UserService } from "../services/user.service";
const userService = new UserService();

//setup auth middleware to check every request authentication according to user role
//it will return 401 status code if the request is not from authenticated user
export class Authentication {
    constructor() { }

    hasRole = (...role: any) => {
        return async (req: IRequest, res: Response, next: NextFunction) => {
            let token = req.headers["authorization"];
            if (!token) {
                return res.status(401).send("Not Authorized!");
            }
            token = token.replace("Bearer ", "");
            try {
                let jwtPayload: any = jwt.verify(token, jwtSecret!);
                let roles = Array.isArray(role) ? role : new Array(role);
                if (roles.indexOf(jwtPayload.role) !== -1) {
                    let userDetails: any = await userService.getUserDetailsFromId(jwtPayload.id);
                    if (userDetails.status) {
                        if (jwtPayload.role == userDetails.result.role) {
                            req.user = userDetails.result;
                            next();
                        }
                        else {
                            return res.status(401).send("Not Authorized!");
                        }
                    }
                    else {
                        return res.status(401).send("Not Authorized!");
                    }
                }
                else {
                    return res.status(401).send("Not Authorized!");
                }
            }
            catch (e) {
                console.log(e);
                return res.status(401).send("Not Authorized!");
            }
        }
    }
}