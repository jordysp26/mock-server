"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LowdbService = void 0;
const common_1 = require("@nestjs/common");
const lowdb = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
let LowdbService = class LowdbService {
    async initDatabase(file) {
        const adapter = new FileAsync(file);
        this.db = await lowdb(adapter);
    }
    getDb() {
        return this.db;
    }
    async findAll(collctionName) {
        const listData = await this.db.get(collctionName).value();
        return listData;
    }
    async find(condition, collctionName) {
        const values = await this.db.get(collctionName).find(condition).value();
        return values;
    }
    async update(key, value, collctionName, dataUpdate) {
        const listData = await this.db.get(collctionName).value();
        let out;
        const listDataMap = listData.map((data) => {
            if (data[key] !== value)
                return data;
            if (data[key] === value) {
                out = Object.assign(data, dataUpdate);
                return out;
            }
        });
        await this.db.set(collctionName, listDataMap).write();
        return out;
    }
    async add(data, collctionName) {
        const listData = await this.db.get(collctionName).value();
        listData.push(data);
        await this.db.set(collctionName, listData).write();
        return data;
    }
    async delete(condition, collctionName) {
        await this.db.get(collctionName).remove(condition).write();
        return true;
    }
};
LowdbService = __decorate([
    (0, common_1.Injectable)()
], LowdbService);
exports.LowdbService = LowdbService;
//# sourceMappingURL=lowdb.service.js.map