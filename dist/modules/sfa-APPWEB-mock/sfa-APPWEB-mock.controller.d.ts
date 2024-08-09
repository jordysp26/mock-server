import { Request, Response } from 'express';
import { LowdbService } from '../../lowdb/lowdb.service';
export declare class SfaAPPWEBMockController {
    private readonly lowdbService;
    constructor(lowdbService: LowdbService);
    obtenerSfaAlias(req: Request, res: Response): Promise<void>;
    obtenerSfaSinAlias(req: Request, res: Response): Promise<void>;
    obtenerSfaConSesionActiva(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSfa(res: Response, cuil: number, transacciones?: string[]): Promise<Response<any, Record<string, any>>>;
    obtenerCodigoOtp(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    countClaveBloqueda: number;
    countOtpBloquedo: number;
    validarOtp(req: Request, res: Response): void;
    ValidarClave(req: Request, res: Response): void;
    getConfiguracionSfa(headers: any, res: Response): Promise<void>;
    solicitudOTPEnrolamiento(req: Request, res: Response): void;
    mostrarSFAEnrolamiento(headers: any, req: Request, res: Response): Promise<void>;
    validarOtpEnrolamiento(req: Request, res: Response): void;
    enrolarSFA(req: Request, res: Response): void;
    desenrolarSFA(req: Request, res: Response): void;
    getConfiguracionSFAByEntidad(req: Request, res: Response): void;
    getDetalleSFA(req: Request, res: Response): void;
    modificatTipoSFA(req: Request, res: Response): void;
    getUsuario(authorization: any): Promise<any>;
    descargaFormulario(req: Request, res: Response): void;
    desvincularSFa(res: Response): void;
}
