import { Request, Response } from 'express';
import { LowdbService } from '../../lowdb/lowdb.service';
export declare class ConfiguracionAPPWEBMockController {
    private readonly lowdbService;
    constructor(lowdbService: LowdbService);
    getPantallaInicial(res: Response): void;
    getTyc(req: Request, res: Response): void;
    getConfiguracionDashboard(req: Request, res: Response): void;
    getTycAuth(headers: any, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    postTycAccepted(req: Request, res: Response): void;
    getBancos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getConceptos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getImporte(req: Request, res: Response): Response<any, Record<string, any>>;
    getFeriados(res: Response): Promise<Response<any, Record<string, any>>>;
    getMenu(headers: any, res: Response): Promise<Response<any, Record<string, any>>>;
    getAccesosDirectos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBanners(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    getBuzon(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    eliminar(res: Response): void;
    updateDescarga(res: Response): void;
    getContexto25(res: Response): void;
    getTareasPendientes(res: Response): Promise<void>;
    getGuias(res: Response): Promise<void>;
}
