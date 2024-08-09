"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FedaMockController = void 0;
const common_1 = require("@nestjs/common");
const lowdb_service_1 = require("../../lowdb/lowdb.service");
let FedaMockController = class FedaMockController {
    constructor(lowdbService) {
        this.lowdbService = lowdbService;
    }
    async getFedaData(headers, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error interno';
            }
            await this.lowdbService.initDatabase('./src/modules/feda-mock/json/feda-data.json');
            const user = await this.lowdbService.find({ id: "12345" }, 'users');
            return res.status(common_1.HttpStatus.OK).json({
                user: user
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener la data para el usuario',
            });
        }
    }
    async getReasons(headers, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error interno';
            }
            await this.lowdbService.initDatabase('./src/modules/feda-mock/json/feda-reasons.json');
            const reasons = await this.lowdbService.findAll('reasons');
            return res.status(common_1.HttpStatus.OK).json(reasons);
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener los reasons para el usuario',
            });
        }
    }
    async getCases(headers, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error interno';
            }
            await this.lowdbService.initDatabase('./src/modules/feda-mock/json/feda-cases.json');
            const cases = await this.lowdbService.findAll('cases');
            return res.status(common_1.HttpStatus.OK).json(cases);
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener los casos para el usuario',
            });
        }
    }
};
__decorate([
    (0, common_1.Get)('/data'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FedaMockController.prototype, "getFedaData", null);
__decorate([
    (0, common_1.Get)('/reasons'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FedaMockController.prototype, "getReasons", null);
__decorate([
    (0, common_1.Get)('/cases'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FedaMockController.prototype, "getCases", null);
FedaMockController = __decorate([
    (0, common_1.Controller)('feda/api'),
    __metadata("design:paramtypes", [lowdb_service_1.LowdbService])
], FedaMockController);
exports.FedaMockController = FedaMockController;
//# sourceMappingURL=feda-mock.controller.js.map