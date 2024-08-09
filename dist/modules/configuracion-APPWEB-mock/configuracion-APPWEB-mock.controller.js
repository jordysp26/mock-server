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
exports.ConfiguracionAPPWEBMockController = void 0;
const common_1 = require("@nestjs/common");
const lowdb_service_1 = require("../../lowdb/lowdb.service");
const getUserNameFromJWTToken_1 = require("../../utils/functions/getUserNameFromJWTToken");
let ConfiguracionAPPWEBMockController = class ConfiguracionAPPWEBMockController {
    constructor(lowdbService) {
        this.lowdbService = lowdbService;
    }
    getPantallaInicial(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    recuperoClave: true,
                    recuperoUsuario: true,
                    tutorialAPPWEB: true,
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener configuracion',
                });
                break;
        }
    }
    getTyc(req, res) {
        const transaccion = req.query.transaccion;
        const typeResponse = 0;
        if (typeResponse === 0) {
            switch (transaccion) {
                case 'RECORDAR_USUARIO':
                    res.status(common_1.HttpStatus.OK).json({
                        codigoResultado: '00',
                        descripcionResultado: 'OK',
                        terminosYCondiciones: 'RECORDAR USUARIO...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                        aceptacionUnica: false,
                        mostrarTyC: true,
                    });
                    break;
                default:
                    res.status(406).json({
                        codigoResultado: '99',
                        descripcionResultado: 'Error al obtener terminos y condiciones',
                    });
                    break;
            }
        }
        else {
            res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener terminos y condiciones',
            });
        }
    }
    getConfiguracionDashboard(req, res) {
        res.status(common_1.HttpStatus.OK).json({
            codigoResultado: '00',
            descripcionResultado: 'OK',
            banco: 21,
            responsableCta: true,
        });
    }
    async getTycAuth(headers, req, res) {
        const transaccion = req.query.transaccion;
        const cuit = headers.cuit;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/tycs.json');
            const tycAuth = await this.lowdbService.find({ cuit }, 'tycs');
            const tyc = tycAuth.transacciones.find((item) => {
                return item.transaccion.indexOf(transaccion) > -1;
            });
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                terminosYCondiciones: tyc.descripcion,
                aceptacionUnica: tyc.aceptacionUnica,
                mostrarTyC: tyc.mostrarTyC,
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener terminos y condiciones',
            });
        }
    }
    postTycAccepted(req, res) {
        const transaccion = req.body.transaccion;
        switch (transaccion) {
            case 'LOGIN':
                res
                    .status(common_1.HttpStatus.OK)
                    .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                break;
            case 'APROBAR_CTAS_CRED':
                res
                    .status(common_1.HttpStatus.OK)
                    .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                break;
            case 'MODIFICAR_EMPRESA':
                res
                    .status(common_1.HttpStatus.OK)
                    .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                break;
            default:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al aceptar términos y condiciones',
                });
                break;
        }
    }
    async getBancos(req, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/bancos.json');
            const elementsPerPage = parseInt(req.query.elementsPerPage.toString());
            const bancos = await this.lowdbService.findAll('bancos');
            const cantidadTotal = bancos.length;
            const cantidadPaginas = Math.ceil(cantidadTotal / elementsPerPage);
            const pageNumberAux = parseInt(req.query.pageNumber) + 1;
            const bancosFiltrados = bancos.slice(elementsPerPage * (pageNumberAux - 1), elementsPerPage * pageNumberAux);
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                resultado: bancosFiltrados,
                paginado: { total: cantidadTotal, cantPaginas: cantidadPaginas },
            });
        }
        catch (e) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener los bancos',
            });
        }
    }
    async getConceptos(req, res) {
        const typeResponse = 0;
        try {
            if (typeResponse === 1) {
                throw 'Error interno';
            }
            let conceptos = [];
            if (req.query.modulo === 'TON') {
                await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/conceptos-ton.json');
                conceptos = await this.lowdbService.findAll('conceptosTON');
            }
            else {
                await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/conceptos-toff.json');
                conceptos = await this.lowdbService.findAll('conceptosTOFF');
            }
            if (!conceptos || conceptos.length == 0 || typeResponse > 0) {
                throw 'Error';
            }
            else {
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    conceptos,
                });
            }
        }
        catch (e) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener los conceptos',
            });
        }
    }
    getImporte(req, res) {
        const modulo = req.query.modulo;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error interno';
            }
            switch (modulo) {
                case 'TON':
                    res.status(common_1.HttpStatus.OK).json({
                        codigoResultado: '00',
                        descripcionResultado: 'OK',
                        enteros: 15,
                        decimales: 2,
                    });
                    break;
                case 'TOFF':
                    res.status(common_1.HttpStatus.OK).json({
                        codigoResultado: '00',
                        descripcionResultado: 'OK',
                        enteros: 17,
                        decimales: 2,
                    });
                    break;
            }
        }
        catch (e) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al consultar la configuracion de importe',
            });
        }
    }
    async getFeriados(res) {
        const typeResponse = 0;
        try {
            await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/feriados.json');
            let feriados = [];
            feriados = await this.lowdbService.findAll('feriados');
            if (!feriados || feriados.length == 0 || typeResponse > 0) {
                throw 'Error';
            }
            else {
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    feriados,
                });
            }
        }
        catch (e) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener los feriados',
            });
        }
    }
    async getMenu(headers, res) {
        const cuit = headers.cuit;
        const typeResponse = 0;
        try {
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/empresas.json');
            const empresa = await this.lowdbService.find({ cuit }, 'empresas');
            await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/menu.json');
            const menuproducto = await this.lowdbService.find({ producto: empresa.producto }, 'menuProducto');
            if (!menuproducto || menuproducto.length == 0 || typeResponse > 0) {
                throw 'Error';
            }
            else {
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    menu: menuproducto.menu,
                });
            }
        }
        catch (e) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener los menus',
            });
        }
    }
    async getAccesosDirectos(req, res) {
        const jwtToken = req.headers.authorization;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const usuario = await this.lowdbService.find({ alias: (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(jwtToken) }, 'usuarios');
            await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/accesos-directos.json');
            const accesoDirecto = await this.lowdbService.find({ cuil: usuario.cuil }, 'accesosDirectos');
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '01',
                descripcionResultado: 'OK',
                accesosDirectos: accesoDirecto.accesos,
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener los accesos',
            });
        }
    }
    async getBanners(req, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 2) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/banners.json');
            let banners = await this.lowdbService.findAll('banners');
            if (typeResponse === 1) {
                banners = [banners[0]];
            }
            if (typeResponse === 2) {
                banners = banners.map((data, index) => {
                    if (index === 0) {
                        data.path = '/banners/notfound.jpg';
                    }
                    return data;
                });
            }
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                banners,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener banners',
            });
        }
    }
    async getBuzon(req, res) {
        const typeResponse = 0;
        const pageNumber = parseInt(req.query.pageNumber) + 1;
        const records = req.query.records;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/buzon.json');
            const buzon = await this.lowdbService.findAll('buzon');
            if (buzon.length) {
                const cantidadTotal = buzon.length;
                const cantidadPaginas = Math.ceil(cantidadTotal / records);
                const buzonFiltrados = buzon.slice(records * (pageNumber - 1), records * pageNumber);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    paginasTotales: cantidadPaginas,
                    buzon: buzonFiltrados.map((data) => {
                        const { archivosBuzonId, tipo, archivoUrl, estado, parametrosJson, } = data;
                        return {
                            fechaHora: new Date(),
                            disponibleHasta: new Date(),
                            archivosBuzonId,
                            tipo,
                            archivoUrl,
                            estado,
                            parametrosJson,
                        };
                    }),
                });
            }
        }
        catch (error) {
            if (typeResponse === 1) {
                return res.status(406).json({
                    codigoResultado: '31',
                    descripcionResultado: 'No hay archivos para descargar',
                });
            }
            else {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener archivos para descarga',
                });
            }
        }
    }
    eliminar(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res
                    .status(common_1.HttpStatus.OK)
                    .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error genérico',
                });
                break;
            case 2:
                res.status(500).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error genérico',
                });
                break;
        }
    }
    updateDescarga(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res
                    .status(common_1.HttpStatus.OK)
                    .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error genérico',
                });
                break;
            case 2:
                res.status(500).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error genérico',
                });
                break;
        }
    }
    getContexto25(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    contextos: [
                        { bancoID: 29, productoID: 30, contexto: 'ciudad' },
                        { bancoID: 29, productoID: 32, contexto: 'ciudad2' },
                        { bancoID: 247, productoID: 30, contexto: 'roela' },
                        { bancoID: 247, productoID: 32, contexto: 'roela2' },
                    ],
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'No se puede realizar la accion en este momento, intente nuevamente en unos minutos',
                });
                break;
        }
    }
    async getTareasPendientes(res) {
        try {
            const typeResponse = 0;
            if (typeResponse > 1) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/tareas-pendientes.json');
            const tareasPendientes = await this.lowdbService.findAll('tareasPendientes');
            switch (typeResponse) {
                case 0:
                    res.status(common_1.HttpStatus.OK).json({
                        codigoResultado: '00',
                        descripcionResultado: 'OK',
                        tareasPendientes,
                    });
                    break;
                case 1:
                    res.status(406).json({
                        codigoResultado: '99',
                        descripcionResultado: 'Hubo un error al intentar conseguir las tareas pendientes',
                    });
                    break;
            }
        }
        catch (error) {
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                tareasPendientes: [],
            });
        }
    }
    async getGuias(res) {
        try {
            const typeResponse = 0;
            if (typeResponse > 1) {
                throw 'Error';
            }
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                modulo: ['DASHBOARD', 'ECHEQ', 'AFIP'],
            });
        }
        catch (error) {
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
            });
        }
    }
};
__decorate([
    (0, common_1.Get)('/configuracion/pantalla/inicial'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfiguracionAPPWEBMockController.prototype, "getPantallaInicial", null);
__decorate([
    (0, common_1.Get)('/configuracion/tyc'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConfiguracionAPPWEBMockController.prototype, "getTyc", null);
__decorate([
    (0, common_1.Get)('/configuracion/dashboard'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConfiguracionAPPWEBMockController.prototype, "getConfiguracionDashboard", null);
__decorate([
    (0, common_1.Get)('/configuracion/tyc/auth'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getTycAuth", null);
__decorate([
    (0, common_1.Post)('/configuracion/tyc/aceptacion'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConfiguracionAPPWEBMockController.prototype, "postTycAccepted", null);
__decorate([
    (0, common_1.Get)('/configuracion/bancos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getBancos", null);
__decorate([
    (0, common_1.Get)('/configuracion/conceptos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getConceptos", null);
__decorate([
    (0, common_1.Get)('/configuracion/importe'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConfiguracionAPPWEBMockController.prototype, "getImporte", null);
__decorate([
    (0, common_1.Get)('/configuracion/feriados'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getFeriados", null);
__decorate([
    (0, common_1.Get)('/menu'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getMenu", null);
__decorate([
    (0, common_1.Get)('/menu/directo'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getAccesosDirectos", null);
__decorate([
    (0, common_1.Get)('/banners'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getBanners", null);
__decorate([
    (0, common_1.Get)('/buzon'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getBuzon", null);
__decorate([
    (0, common_1.Delete)('/buzon/archivos'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfiguracionAPPWEBMockController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Put)('/buzon/estado/descarga'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfiguracionAPPWEBMockController.prototype, "updateDescarga", null);
__decorate([
    (0, common_1.Get)('/contexto/productos'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfiguracionAPPWEBMockController.prototype, "getContexto25", null);
__decorate([
    (0, common_1.Get)('/tareas'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getTareasPendientes", null);
__decorate([
    (0, common_1.Get)('/guia'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionAPPWEBMockController.prototype, "getGuias", null);
ConfiguracionAPPWEBMockController = __decorate([
    (0, common_1.Controller)('configuracion-APPWEB/rest-api'),
    __metadata("design:paramtypes", [lowdb_service_1.LowdbService])
], ConfiguracionAPPWEBMockController);
exports.ConfiguracionAPPWEBMockController = ConfiguracionAPPWEBMockController;
//# sourceMappingURL=configuracion-APPWEB-mock.controller.js.map