import { Request } from "express";

//injecting user and files key in every request
export interface IRequest extends Request {
    user?: any;
    files?: any;
}