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
exports.FirmasAPPWEBMockController = void 0;
const common_1 = require("@nestjs/common");
const lowdb_service_1 = require("../../lowdb/lowdb.service");
const getUserNameFromJWTToken_1 = require("../../utils/functions/getUserNameFromJWTToken");
let FirmasAPPWEBMockController = class FirmasAPPWEBMockController {
    constructor(lowdbService) {
        this.lowdbService = lowdbService;
        this.equalsIgnoreOrder = (a, b) => {
            if (a.length !== b.length)
                return false;
            const uniqueValues = new Set([...a, ...b]);
            for (const v of uniqueValues) {
                const aCount = a.filter((e) => e === v).length;
                const bCount = b.filter((e) => e === v).length;
                if (aCount !== bCount)
                    return false;
            }
            return true;
        };
    }
    async getAccionesDisponibles(headers, req, res) {
        const cuit = headers.cuit;
        const nroCuenta = req.body.nroCuenta;
        const operacion = req.body.operacion;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error interno';
            }
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const aliasUsuarioLogueado = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(headers.authorization);
            const usuario = await this.lowdbService.find({ alias: aliasUsuarioLogueado }, 'usuarios');
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/cuentas-por-cuit.json');
            const empresa = await this.lowdbService.find({ cuit }, 'cuentasPorCuit');
            const cuenta = empresa.datos.find((cuenta) => cuenta.nroCuenta === nroCuenta);
            const esFirmante = cuenta.firmantes.includes(usuario.cuil);
            let puedeEnviar = false;
            const enviadores = cuenta.enviadores;
            const firmantes = cuenta.firmantes;
            if (operacion === 'TON') {
                const esEnviador = enviadores.includes(usuario.cuil);
                const completaEsquema = enviadores.length === 1 &&
                    this.equalsIgnoreOrder(enviadores, firmantes);
                if (esEnviador && completaEsquema) {
                    puedeEnviar = true;
                }
            }
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                puedeFirmar: esFirmante,
                puedeEnviar: puedeEnviar,
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener tipo de acciones de transferencia',
            });
        }
    }
    async getVerificarFirma(headers, req, res) {
        const cuit = headers.cuit;
        const nroCuenta = req.body.nroCuenta;
        const tipoCuenta = req.body.tipoCuenta;
        const operaciones = req.body.operaciones;
        const typeResponse = 0;
        const error99 = {
            status: 406,
            codigoResultado: '99',
            descripcionResultado: 'Error al obtener tipo de acciones de transferencia',
        };
        const error55 = {
            status: 406,
            codigoResultado: '55',
            descripcionResultado: 'Tu mandato esta vencido',
        };
        try {
            if (typeResponse === 1) {
                throw error99;
            }
            if (typeResponse === 2) {
                throw error55;
            }
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const aliasUsuarioLogueado = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(headers.authorization);
            const usuario = await this.lowdbService.find({ alias: aliasUsuarioLogueado }, 'usuarios');
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/cuentas-por-cuit.json');
            const empresa = await this.lowdbService.find({ cuit }, 'cuentasPorCuit');
            const cuenta = empresa.datos.find((cuenta) => cuenta.nroCuenta === nroCuenta);
            const esFirmante = cuenta.firmantes.includes(usuario.cuil);
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
            const transferencias = await this.lowdbService.findAll('transferencias');
            let transferenciasCuenta = [];
            if (nroCuenta && tipoCuenta) {
                transferenciasCuenta = transferencias.filter((transferencia) => {
                    return (transferencia.numeroCuentaDebito === nroCuenta &&
                        transferencia.tipoCuentaDebitoId === tipoCuenta);
                });
            }
            const acciones = [];
            operaciones.forEach((operacion) => {
                const transferencia = transferenciasCuenta.find((transferencia) => transferencia.nroTransferencia === operacion);
                if (transferencia) {
                    const yaFirmo = transferencia.firmas
                        ? transferencia.firmas.includes(usuario.cuil)
                        : false;
                    const firmasPosibles = [usuario.cuil].concat(transferencia.firmas);
                    const completaEsquema = cuenta.firmantes.every((element) => {
                        return firmasPosibles.includes(element);
                    });
                    acciones.push({
                        nroOperacion: operacion,
                        puedeOperar: esFirmante && !yaFirmo,
                        completaEsquema: completaEsquema,
                        yaFirmo: yaFirmo,
                    });
                }
            });
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                acciones: acciones,
            });
        }
        catch (error) {
            return res.status(error.status).json(error);
        }
    }
};
__decorate([
    (0, common_1.Post)('/esquema/acciones'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FirmasAPPWEBMockController.prototype, "getAccionesDisponibles", null);
__decorate([
    (0, common_1.Post)('/firmas/acciones'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FirmasAPPWEBMockController.prototype, "getVerificarFirma", null);
FirmasAPPWEBMockController = __decorate([
    (0, common_1.Controller)('firmas-APPWEB/rest-api'),
    __metadata("design:paramtypes", [lowdb_service_1.LowdbService])
], FirmasAPPWEBMockController);
exports.FirmasAPPWEBMockController = FirmasAPPWEBMockController;
//# sourceMappingURL=firmas-APPWEB-mock.controller.js.map