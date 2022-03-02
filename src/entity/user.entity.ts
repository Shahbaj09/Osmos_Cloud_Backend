import { Entity, Column } from "typeorm";
import { SharedEntity } from "./shared.entity";
import { Roles, Boolean } from "../enums/enums";

//defined user table structure
@Entity({ name: "users" })
export class User extends SharedEntity {
    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    fullName: string;

    @Column({ default: Boolean.False })
    isVerified: number;

    @Column({ default: Roles.User })
    role: string;

    @Column({ nullable: true })
    accountVerificationTokenTimeStamp: Date;

    @Column({ nullable: true })
    forgotPasswordTokenTimeStamp: Date;

    @Column({ nullable: true })
    accountVerificationToken: string;

    @Column({ nullable: true })
    forgotPasswordToken: string;
};