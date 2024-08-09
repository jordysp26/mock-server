import { Request, Response } from 'express';
import { LowdbService } from '../../lowdb/lowdb.service';
export declare class FirmasAPPWEBMockController {
    private readonly lowdbService;
    constructor(lowdbService: LowdbService);
    getAccionesDisponibles(headers: any, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getVerificarFirma(headers: any, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    equalsIgnoreOrder: (a: any, b: any) => boolean;
}
