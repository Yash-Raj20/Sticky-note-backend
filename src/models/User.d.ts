import { Document, Model } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    avatar?: string;
}
declare const User: Model<IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map