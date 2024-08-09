import { Response } from 'express';
import { LowdbService } from '../../lowdb/lowdb.service';
export declare class FedaMockController {
    private readonly lowdbService;
    constructor(lowdbService: LowdbService);
    getFedaData(headers: any, res: Response): Promise<Response<any, Record<string, any>>>;
    getReasons(headers: any, res: Response): Promise<Response<any, Record<string, any>>>;
    getCases(headers: any, res: Response): Promise<Response<any, Record<string, any>>>;
}
