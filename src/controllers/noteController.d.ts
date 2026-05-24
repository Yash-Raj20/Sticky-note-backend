import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getNotes: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getArchivedNotes: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTrashedNotes: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSharedNotes: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createNote: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateNote: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteNote: (req: AuthRequest, res: Response) => Promise<void>;
export declare const shareNote: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSharedNote: (req: Request, res: Response) => Promise<void>;
export declare const searchNotes: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTags: (req: AuthRequest, res: Response) => Promise<void>;
export declare const shareNoteWithUser: (req: AuthRequest, res: Response) => Promise<void>;
/** POST /api/notes/:id/connect — Add a connection arrow to another note */
export declare const addConnection: (req: AuthRequest, res: Response) => Promise<void>;
/** DELETE /api/notes/:id/connect/:targetId — Remove a connection */
export declare const removeConnection: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=noteController.d.ts.map