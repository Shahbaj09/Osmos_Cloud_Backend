import { Request, Response, Router } from "express";
import userRouter from "./user.router";

//Init router
const router = Router();
router.use('/user', userRouter);

/**
 * @swagger
 * /api/:
 *   get:
 *     tags:
 *     - "Default"
 *     summary: Check if the server is running
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *          description: success
 */
router.get('/', (req: Request, res: Response) => {
    res.json("Welcome to NODEjs-test-server");
});

export default router;