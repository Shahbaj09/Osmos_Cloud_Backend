import sgMail from "@sendgrid/mail";

export class EmailService {
    constructor() { }

    accountVerificationEmail(email: string, userId: number, token: string) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
        const msg = {
            to: email,
            from: process.env.SENDGRID_EMAIL!,
            subject: 'Account Verification',
            html: `<!DOCTYPE html>
                <html lang="en">               
                <body>
                    <div>Hello,</div>
                    <div>Please verify your account by clicking on this <a href="${process.env.FORNTEND_HOST}/verify/${userId}/${token}">link</a></div>
                    <div>If button is not working then copy this link and paste in your browser tab: ${process.env.FORNTEND_HOST}/verify/${userId}/${token}</div>
                </body>                
                </html>`,
        };
        sgMail.send(msg);
    }

    forgotPasswordEmail(email: string, userId: number, token: string) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
        const msg = {
            to: email,
            from: process.env.SENDGRID_EMAIL!,
            subject: 'Forgot Password',
            html: `<!DOCTYPE html>
                <html lang="en">               
                <body>
                    <div>Hello,</div>
                    <div>Please recover your password by clicking on this <a href="${process.env.FORNTEND_HOST}/setnewpassword/${userId}/${token}">link</a></div>
                    <div>If button is not working then copy this link and paste in your browser tab: ${process.env.FORNTEND_HOST}/setnewpassword/${userId}/${token}</div>
                </body>                
                </html>`,
        };
        sgMail.send(msg);
    }
}