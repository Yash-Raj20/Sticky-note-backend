import { Request, Response } from 'express';
import multer from 'multer';
interface AuthRequest extends Request {
    user?: any;
}
export declare const upload: multer.Multer;
/** POST /api/upload — Upload a file and return its URL */
export declare const uploadFile: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=uploadController.d.ts.map