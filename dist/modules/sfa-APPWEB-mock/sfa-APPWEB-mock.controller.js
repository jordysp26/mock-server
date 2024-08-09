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
exports.SfaAPPWEBMockController = void 0;
const common_1 = require("@nestjs/common");
const lowdb_service_1 = require("../../lowdb/lowdb.service");
const getUserNameFromJWTToken_1 = require("../../utils/functions/getUserNameFromJWTToken");
let SfaAPPWEBMockController = class SfaAPPWEBMockController {
    constructor(lowdbService) {
        this.lowdbService = lowdbService;
        this.countClaveBloqueda = 1;
        this.countOtpBloquedo = 1;
    }
    async obtenerSfaAlias(req, res) {
        const cuil = req.body.cuil;
        const transacciones = req.body.transacciones;
        this.getSfa(res, cuil, transacciones);
    }
    async obtenerSfaSinAlias(req, res) {
        const cuil = req.body.cuil;
        const transacciones = req.body.transacciones;
        this.getSfa(res, cuil, transacciones);
    }
    async obtenerSfaConSesionActiva(req, res) {
        const alias = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(req.headers.authorization);
        const transacciones = req.body.transacciones;
        try {
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const usuarios = await this.lowdbService.findAll('usuarios');
            const usuarioEncontrado = usuarios.find((element) => {
                return element.alias === alias;
            });
            if (usuarioEncontrado) {
                this.getSfa(res, usuarioEncontrado.cuil, transacciones);
            }
            else {
                throw 'error';
            }
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener SFA para este usuario',
            });
        }
    }
    async getSfa(res, cuil, transacciones = []) {
        const typeResponse = 0;
        try {
            await this.lowdbService.initDatabase('./src/modules/sfa-APPWEB-mock/json/sfa-conf-trx.json');
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener SFA disponibles.',
                };
            }
            let sfaEncontrados = await this.lowdbService.findAll('sfa-conf-trx');
            sfaEncontrados = sfaEncontrados.filter((sfa) => transacciones.includes(sfa.transaccion));
            if (!sfaEncontrados.length) {
                throw {
                    status: 406,
                    codigoResultado: '24',
                    descripcionResultado: 'No necesita SFA.',
                };
            }
            let usaClave = false;
            let usaOTP = false;
            sfaEncontrados.forEach((sfa) => {
                if (!sfa.habilitadoTRX) {
                    throw {
                        status: 406,
                        codigoResultado: '28',
                        descripcionResultado: 'El segundo factor de autenticación requerido para esta transacción no se encuentra activo',
                    };
                }
                usaClave = usaClave || sfa.usaClave;
                usaOTP = usaOTP || sfa.usaOTP;
            });
            if (usaOTP) {
                await this.lowdbService.initDatabase('./src/modules/sfa-APPWEB-mock/json/sfa-usuario.json');
                const sfaDelUsuario = await this.lowdbService.find({ cuil }, 'sfa-usuario');
                if (!sfaDelUsuario) {
                    throw {
                        status: 406,
                        codigoResultado: '03',
                        descripcionResultado: 'No pudimos validar tus datos de usuario',
                    };
                }
                if (!sfaDelUsuario.sfaDisponible) {
                    throw {
                        status: 406,
                        codigoResultado: '28',
                        descripcionResultado: 'No hay SFA disponibles.',
                    };
                }
                if (sfaDelUsuario.sfaDisponible.bloqueado) {
                    throw {
                        status: 406,
                        codigoResultado: '27',
                        descripcionResultado: 'Su SFA se encuentra bloqueado.',
                    };
                }
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    sfaToken: 'Aee4',
                    sfaDisponible: sfaDelUsuario.sfaDisponible,
                    usaClave: usaClave,
                });
            }
            else {
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    sfaToken: 'Aee4',
                    sfaDisponible: null,
                    usaClave: usaClave,
                });
            }
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async obtenerCodigoOtp(req, res) {
        const typeResponse = 0;
        const tipo = req.query.tipoOTP;
        try {
            await this.lowdbService.initDatabase('./src/modules/sfa-APPWEB-mock/json/tipos-otp.json');
            if (typeResponse > 0) {
                throw 'Error';
            }
            const tipoOTP = await this.lowdbService.find({ tipo }, 'tiposOTP');
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                sfaToken: tipoOTP.sfaToken,
                destino: tipoOTP.destino,
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '71',
                descripcionResultado: 'No se pudo enviar el código de segundo factor. Intentalo de nuevo en unos minutos.',
            });
        }
    }
    validarOtp(req, res) {
        const codigoOTP = req.body.otp;
        const clave = req.body.clave;
        if (this.countClaveBloqueda > 3) {
            res.status(406).json({
                codigoResultado: '06',
                descripcionResultado: 'La clave se encuentra bloqueada.',
            });
        }
        if (this.countOtpBloquedo > 3) {
            res.status(406).json({
                codigoResultado: '33',
                descripcionResultado: 'Alcanzaste el máximo de intentos. SFA bloqueado temporalmente.',
            });
        }
        if (clave === '0000') {
            res.status(406).json({
                codigoResultado: '05',
                descripcionResultado: 'La clave ingresada es incorrecta.',
            });
            this.countClaveBloqueda++;
        }
        else {
            switch (codigoOTP) {
                case '1111':
                    res.status(406).json({
                        codigoResultado: '26',
                        descripcionResultado: 'Codigo incorrecto. Vuelva a ingresar su OTP.',
                    });
                    this.countOtpBloquedo++;
                    break;
                case '0000':
                    res.status(406).json({
                        codigoResultado: '99',
                        descripcionResultado: 'Error generico del sistema.',
                    });
                    break;
                default:
                    res.status(common_1.HttpStatus.OK).json({
                        codigoResultado: '00',
                        descripcionResultado: 'OK',
                        sfaToken: 'Aee4-y0-50y-s4baler0',
                    });
                    this.countClaveBloqueda = 1;
                    this.countOtpBloquedo = 1;
                    break;
            }
        }
    }
    ValidarClave(req, res) {
        const clave = req.body.clave;
        if (this.countClaveBloqueda > 3) {
            res.status(406).json({
                codigoResultado: '06',
                descripcionResultado: 'La clave se encuentra bloqueada.',
            });
        }
        if (clave == '0000') {
            res.status(406).json({
                codigoResultado: '05',
                descripcionResultado: 'La clave ingresada es incorrecta.',
            });
            this.countClaveBloqueda++;
        }
        else {
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                sfaToken: 'Aee4-y0-50y-s4baler0',
            });
            this.countClaveBloqueda = 1;
        }
    }
    async getConfiguracionSfa(headers, res) {
        const error98 = {
            status: 406,
            codigoResultado: '98',
            descripcionResultado: 'No mostrar enrolamiento',
        };
        const error99 = {
            status: 406,
            codigoResultado: '99',
            descripcionResultado: 'Error al obtener configuracion',
        };
        const typeResponse = 0;
        try {
            const usuario = await this.getUsuario(headers.authorization);
            await this.lowdbService.initDatabase('./src/modules/sfa-APPWEB-mock/json/sfa-usuario.json');
            if (typeResponse === 98) {
                throw error98;
            }
            if (typeResponse === 99) {
                throw error99;
            }
            const sfaUsuario = await this.lowdbService.find({ cuil: usuario.cuil }, 'sfa-usuario');
            const typeSFA = 4;
            const sfaDisponibles = [];
            switch (typeSFA) {
                case 0:
                    sfaDisponibles.push('OTP_SMS');
                    break;
                case 1:
                    sfaDisponibles.push('OTP_EMAIL');
                    break;
                case 2:
                    sfaDisponibles.push('OTP_SOFT_TOKEN');
                    break;
                case 3:
                    sfaDisponibles.push('OTP_SMS');
                    sfaDisponibles.push('OTP_EMAIL');
                    break;
                case 4:
                    sfaDisponibles.push('OTP_SMS');
                    sfaDisponibles.push('OTP_SOFT_TOKEN');
                    break;
                case 5:
                    sfaDisponibles.push('OTP_SOFT_TOKEN');
                    sfaDisponibles.push('OTP_EMAIL');
                    break;
                case 6:
                    sfaDisponibles.push('OTP_SOFT_TOKEN');
                    sfaDisponibles.push('OTP_EMAIL');
                    sfaDisponibles.push('OTP_SMS');
                    break;
            }
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                sfaDisponibles: sfaDisponibles,
                tieneSFAViejo: sfaUsuario.tieneSFAViejo,
                habilitarEnrolamiento: sfaUsuario.habilitarEnrolamiento,
            });
        }
        catch (error) {
            res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    solicitudOTPEnrolamiento(req, res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error generico',
                });
                break;
        }
    }
    async mostrarSFAEnrolamiento(headers, req, res) {
        const error99 = {
            status: 406,
            codigoResultado: '99',
            descripcionResultado: 'Error genérico.',
        };
        const typeResponse = 0;
        try {
            if (typeResponse === 99) {
                throw error99;
            }
            const usuarioLogeado = await this.getUsuario(headers.authorization);
            await this.lowdbService.initDatabase('./src/modules/sfa-APPWEB-mock/json/sfa-usuario.json');
            const sfaUsuarios = await this.lowdbService.findAll('sfa-usuario');
            const index = sfaUsuarios.findIndex((sfaUsuario) => usuarioLogeado.cuil === sfaUsuario.cuil);
            sfaUsuarios[index].habilitarEnrolamiento = req.body.habilitado;
            await this.lowdbService.getDb().set('sfa-usuario', sfaUsuarios).write();
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
            });
        }
        catch (error) {
            res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    validarOtpEnrolamiento(req, res) {
        const codigoOTP = req.body.otp;
        const clave = req.body.clave;
        if (this.countClaveBloqueda > 3) {
            res.status(406).json({
                codigoResultado: '06',
                descripcionResultado: 'La clave se encuentra bloqueada.',
            });
        }
        if (clave === '0000') {
            res.status(406).json({
                codigoResultado: '05',
                descripcionResultado: 'La clave ingresada es incorrecta.',
            });
            this.countClaveBloqueda++;
        }
        else {
            switch (codigoOTP) {
                case '1111':
                    res.status(406).json({
                        codigoResultado: '26',
                        descripcionResultado: 'Codigo incorrecto. Vuelva a ingresar su OTP.',
                    });
                    break;
                case '0000':
                    res.status(406).json({
                        codigoResultado: '99',
                        descripcionResultado: 'Error generico del sistema.',
                    });
                    break;
                default:
                    res.status(common_1.HttpStatus.OK).json({
                        codigoResultado: '00',
                        descripcionResultado: 'OK',
                        sfaToken: 'Aee4-y0-50y-s4baler0',
                    });
                    this.countClaveBloqueda = 1;
                    break;
            }
        }
    }
    enrolarSFA(req, res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    estado: 'VE',
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    estado: 'AP',
                });
                break;
            case 2:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error generico.',
                });
                break;
        }
    }
    desenrolarSFA(req, res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res
                    .status(200)
                    .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                break;
            case 1:
                res.status(406).send();
                break;
            default:
                res.status(500).send();
                break;
        }
    }
    getConfiguracionSFAByEntidad(req, res) {
        const typeResponse = 0;
        const typeSFA = 4;
        const sfaId = [];
        switch (typeSFA) {
            case 0:
                sfaId.push('OTP_SMS');
                break;
            case 1:
                sfaId.push('OTP_EMAIL');
                break;
            case 2:
                sfaId.push('OTP_SOFT_TOKEN');
                break;
            case 3:
                sfaId.push('OTP_SMS');
                sfaId.push('OTP_EMAIL');
                break;
            case 4:
                sfaId.push('OTP_SMS');
                sfaId.push('OTP_SOFT_TOKEN');
                break;
            case 5:
                sfaId.push('OTP_SOFT_TOKEN');
                sfaId.push('OTP_EMAIL');
                break;
            case 6:
                sfaId.push('OTP_SOFT_TOKEN');
                sfaId.push('OTP_EMAIL');
                sfaId.push('OTP_SMS');
                break;
        }
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    sfaId: sfaId,
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '58',
                    descripcionResultado: 'Error generico.',
                });
                break;
            case 2:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error generico.',
                });
                break;
        }
    }
    getDetalleSFA(req, res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    estado: 'VE',
                    tipoDeAutenticacion: 'OTP_SMS',
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    estado: 'AP',
                    tipoDeAutenticacion: 'OTP_SMS',
                });
                break;
            case 2:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    estado: 'RE',
                    tipoDeAutenticacion: 'OTP_SMS',
                });
                break;
            case 3:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '59',
                    descripcionResultado: 'No esta enrolado.',
                });
                break;
            case 4:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error generico.',
                });
                break;
        }
    }
    modificatTipoSFA(req, res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error generico.',
                });
                break;
        }
    }
    async getUsuario(authorization) {
        await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
        const aliasUsuarioLogueado = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(authorization);
        const usuario = await this.lowdbService.find({ alias: aliasUsuarioLogueado }, 'usuarios');
        return usuario;
    }
    descargaFormulario(req, res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error generico.',
                });
                break;
        }
    }
    desvincularSFa(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res
                    .status(200)
                    .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                break;
            case 1:
                res.status(406).send();
                break;
            default:
                res.status(500).send();
                break;
        }
    }
};
__decorate([
    (0, common_1.Post)('/sfa/alias'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SfaAPPWEBMockController.prototype, "obtenerSfaAlias", null);
__decorate([
    (0, common_1.Post)('/sfa'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SfaAPPWEBMockController.prototype, "obtenerSfaSinAlias", null);
__decorate([
    (0, common_1.Post)('/sfa/auth'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SfaAPPWEBMockController.prototype, "obtenerSfaConSesionActiva", null);
__decorate([
    (0, common_1.Get)('/sfa/otp'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SfaAPPWEBMockController.prototype, "obtenerCodigoOtp", null);
__decorate([
    (0, common_1.Post)('/sfa/otp'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "validarOtp", null);
__decorate([
    (0, common_1.Post)('/clave'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "ValidarClave", null);
__decorate([
    (0, common_1.Get)('/sfa/configuracion'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SfaAPPWEBMockController.prototype, "getConfiguracionSfa", null);
__decorate([
    (0, common_1.Post)('/otp/solicitud'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "solicitudOTPEnrolamiento", null);
__decorate([
    (0, common_1.Post)('/sfa/enrolamiento/habilitacion'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SfaAPPWEBMockController.prototype, "mostrarSFAEnrolamiento", null);
__decorate([
    (0, common_1.Post)('/otp'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "validarOtpEnrolamiento", null);
__decorate([
    (0, common_1.Post)('/sfa/enrolamiento'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "enrolarSFA", null);
__decorate([
    (0, common_1.Delete)('/sfa/enrolamiento'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "desenrolarSFA", null);
__decorate([
    (0, common_1.Get)('/sfa/configuracion/banco'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "getConfiguracionSFAByEntidad", null);
__decorate([
    (0, common_1.Get)('/sfa/detalle'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "getDetalleSFA", null);
__decorate([
    (0, common_1.Put)('sfa'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "modificatTipoSFA", null);
__decorate([
    (0, common_1.Put)('/sfa/formulario/descarga'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "descargaFormulario", null);
__decorate([
    (0, common_1.Post)('/sfa/soft-token/desvinculacion'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SfaAPPWEBMockController.prototype, "desvincularSFa", null);
SfaAPPWEBMockController = __decorate([
    (0, common_1.Controller)('/sfa-APPWEB/rest-api'),
    __metadata("design:paramtypes", [lowdb_service_1.LowdbService])
], SfaAPPWEBMockController);
exports.SfaAPPWEBMockController = SfaAPPWEBMockController;
//# sourceMappingURL=sfa-APPWEB-mock.controller.js.map