import { Request, Response, Router } from "express";
import { Authentication } from "../middleware/auth";
import { Roles } from "../enums/enums";
import { UserService } from "../services/user.service";
import { IRequest } from "../middleware/IRequest";
const userService = new UserService();
const auth = new Authentication();

//Init router
const router = Router();

/**
 * @swagger
 * /api/user/create:
 *   post:
 *     tags:
 *     - "User"
 *     summary: Create new user
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *     parameters:
 *       - in: body
 *         name: Keys
 *         type: object
 *         required: true
 *         properties:
 *          email:
 *              type: string
 *          password:
 *              type: string
 *          fullName:
 *              type: string
 */
router.post('/create', async (req: Request, res: Response) => {
    //fetching required data from request
    let userEmail = req.body.email;
    let userPassword = req.body.password;
    let fullName = req.body.fullName;

    let result = await userService.createNewUser(userEmail, userPassword, fullName);
    //sending response to the web application
    res.json(result);
});

/**
 * @swagger
 * /api/user/verify:
 *   post:
 *     tags:
 *     - "User"
 *     summary: Verify user account
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *     parameters:
 *       - in: body
 *         name: Keys
 *         type: object
 *         required: true
 *         properties:
 *          id:
 *              type: number
 *          token:
 *              type: string
 */
router.post('/verify', async (req: Request, res: Response) => {
    let userId = req.body.id;
    let token = req.body.token;

    let result = await userService.verifyUserAccount(userId, token);
    res.json(result);
});

/**
 * @swagger
 * /api/user/resendVerification:
 *   post:
 *     tags:
 *     - "User"
 *     summary: resend user verification email
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *     parameters:
 *       - in: body
 *         name: Keys
 *         type: object
 *         required: true
 *         properties:
 *          email:
 *              type: string
 */
router.post('/resendVerification', async (req: Request, res: Response) => {
    let userEmail = req.body.email;

    let result = await userService.resendVerification(userEmail);
    res.json(result);
});

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags:
 *     - "User"
 *     summary: login api
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *     parameters:
 *       - in: body
 *         name: required
 *         type: object
 *         required: true
 *         properties:
 *          email:
 *              type: string
 *          password:
 *              type: string
 * 
 */
router.post('/login', async (req: Request, res: Response) => {
    let userEmail = req.body.email;
    let userPassword = req.body.password;

    let result = await userService.login(userEmail, userPassword);
    res.json(result);
});

/**
 * @swagger
 * /api/user/forgotPassword:
 *   post:
 *     tags:
 *     - "User"
 *     summary: forgot password API
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *     parameters:
 *       - in: body
 *         name: required
 *         type: object
 *         required: true
 *         properties:
 *          email:
 *              type: string
 */
router.post('/forgotPassword', async (req: Request, res: Response) => {
    let email = req.body.email;

    let result = await userService.forgotPassword(email);
    res.json(result);
});

/**
 * @swagger
 * /api/user/fpToken:
 *   post:
 *     tags:
 *     - "User"
 *     summary: forgot password token API
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *     parameters:
 *       - in: body
 *         name: required
 *         type: object
 *         required: true
 *         properties:
 *          userId:
 *              type: number
 *          token:
 *              type: string
 */
router.post('/fpToken', async (req: Request, res: Response) => {
    let userId = req.body.userId;
    let token = req.body.token;

    let result = await userService.verifyFpToken(userId, token);
    res.json(result);
});

/**
 * @swagger
 * /api/user/resetPassword:
 *   post:
 *     tags:
 *     - "User"
 *     security:
 *      - Bearer: []
 *     summary: reset password API
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *     parameters:
 *       - in: body
 *         name: required
 *         type: object
 *         required: true
 *         properties:
 *          password:
 *              type: string
 *          token:
 *              type: string
 */
router.post('/resetPassword', auth.hasRole(Roles.User, Roles.Admin), async (req: IRequest, res: Response) => {
    let userId = req.user.id;
    let password = req.body.password;
    let token = req.body.token;

    let result = await userService.resetPassword(userId, password, token);
    res.json(result);
});

/**
 * @swagger
 * /api/user/changePassword:
 *   post:
 *     tags:
 *     - "User"
 *     security:
 *      - Bearer: []
 *     summary: change password API
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *     parameters:
 *       - in: body
 *         name: required
 *         type: object
 *         required: true
 *         properties:
 *          oldPassword:
 *              type: string
 *          newPassword:
 *              type: string
 */
 router.post('/changePassword', auth.hasRole(Roles.User, Roles.Admin), async (req: IRequest, res: Response) => {
    let userId = req.user.id;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    let result = await userService.changePassword(userId, oldPassword, newPassword);
    res.json(result);
});
export default router;