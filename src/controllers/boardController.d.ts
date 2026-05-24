import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
/** GET /api/boards — Get all boards for the logged-in user */
export declare const getBoards: (req: AuthRequest, res: Response) => Promise<void>;
/** POST /api/boards — Create a new board */
export declare const createBoard: (req: AuthRequest, res: Response) => Promise<void>;
/** PATCH /api/boards/:id — Rename a board */
export declare const updateBoard: (req: AuthRequest, res: Response) => Promise<void>;
/** DELETE /api/boards/:id — Delete board and all its notes */
export declare const deleteBoard: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=boardController.d.ts.map