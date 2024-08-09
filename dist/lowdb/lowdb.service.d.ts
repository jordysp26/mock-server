export declare class LowdbService {
    private db;
    initDatabase(file: string): Promise<void>;
    getDb(): lowdb.LowdbAsync<any>;
    findAll(collctionName: string): Promise<any>;
    find(condition: any, collctionName: string): Promise<any>;
    update(key: string, value: string, collctionName: string, dataUpdate: any): Promise<any>;
    add(data: any, collctionName: string): Promise<any>;
    delete(condition: any, collctionName: string): Promise<any>;
}
