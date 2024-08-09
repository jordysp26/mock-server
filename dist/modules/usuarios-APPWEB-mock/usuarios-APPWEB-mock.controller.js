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
exports.UsuariosAPPWEBMockController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const lowdb_service_1 = require("../../lowdb/lowdb.service");
const getUserNameFromJWTToken_1 = require("../../utils/functions/getUserNameFromJWTToken");
let UsuariosAPPWEBMockController = class UsuariosAPPWEBMockController {
    constructor(lowdbService) {
        this.lowdbService = lowdbService;
        this.countResendEmail = 1;
        this.countIntentosCambioClave = 0;
    }
    async postUsuarioSesion(req, res) {
        const usuario = req.body.usuario;
        switch (usuario) {
            case 'usuarioerroneo':
                res.status(406).json({
                    codigoResultado: '05',
                    descripcionResultado: 'Datos ingresados incorrectos',
                    mostrarCaptcha: false,
                });
                break;
            case 'requierecaptcha':
                res.status(406).json({
                    codigoResultado: '02',
                    descripcionResultado: 'Datos ingresados incorrectos, requiere captcha',
                    mostrarCaptcha: true,
                });
                break;
            case 'passwordvencida':
                res.status(406).json({
                    codigoResultado: '07',
                    descripcionResultado: 'Posee la clave vencida',
                    mostrarCaptcha: false,
                });
                break;
            case 'sesionactiva':
                res.status(406).json({
                    codigoResultado: '08',
                    descripcionResultado: 'Ya posee una sesion activa',
                    mostrarCaptcha: false,
                });
                break;
            case 'usuariobloqueado':
                res.status(406).json({
                    codigoResultado: '06',
                    descripcionResultado: 'El usuario se encuentra bloqueado',
                    mostrarCaptcha: false,
                });
                break;
            default:
                try {
                    await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
                    const usuarios = await this.lowdbService.findAll('usuarios');
                    const usuarioEncontrado = usuarios.find((element) => {
                        return element.alias === usuario;
                    });
                    console.log('usuarioEncontrado: ', usuarioEncontrado);
                    if (usuarioEncontrado) {
                        console.log('paso1');
                        const miusuario = {
                            codigoResultado: '00',
                            descripcionResultado: 'OK',
                            jwtToken: usuarioEncontrado.jwtToken + '-' + 123456,
                            jwtTokenRefresh: usuarioEncontrado.jwtTokenRefresh + '-' + 123456,
                            timeExpireSeconds: usuarioEncontrado.timeExpireSeconds,
                            nombreApellido: `${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido}`,
                            alias: usuarioEncontrado.alias,
                            ultimaConexion: new Date(),
                        };
                        console.log('miusuario: ', miusuario);
                        return res.status(common_1.HttpStatus.OK).json(miusuario);
                    }
                    else {
                        console.log('paso2');
                        res.status(common_1.HttpStatus.OK).json({
                            codigoResultado: '00',
                            descripcionResultado: 'OK',
                            jwtToken: usuarios[0].jwtToken + '-' + (0, crypto_1.randomUUID)(),
                            jwtTokenRefresh: usuarios[0].jwtTokenRefresh + '-' + (0, crypto_1.randomUUID)(),
                            timeExpireSeconds: usuarios[0].timeExpireSeconds,
                            nombreApellido: `${usuarios[0].nombre} ${usuarios[0].apellido}`,
                            alias: usuarios[0].alias,
                            ultimaConexion: new Date(),
                        });
                    }
                }
                catch (error) {
                    return res.status(406).json({
                        codigoResultado: '99',
                        descripcionResultado: 'Error en el login',
                    });
                }
                break;
        }
    }
    deleteUsuarioSesion(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al realizar logout',
                });
                break;
        }
    }
    async postSesionToken(req, res) {
        const jwtRefresh = req.headers.authorization;
        const typeResponse = 0;
        if (typeResponse > 0) {
            throw 'Error';
        }
        try {
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const usuarios = await this.lowdbService.findAll('usuarios');
            const usuarioEncontrado = usuarios.find((element) => {
                return (element.jwtTokenRefresh ===
                    (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(jwtRefresh).toLocaleUpperCase());
            });
            if (usuarioEncontrado) {
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    jwtToken: usuarioEncontrado.jwtToken + '-' + (0, crypto_1.randomUUID)(),
                    jwtTokenRefresh: usuarioEncontrado.jwtTokenRefresh + '-' + (0, crypto_1.randomUUID)(),
                    timeExpireSeconds: 90,
                });
            }
            else {
                throw 'Error';
            }
        }
        catch (error) {
            res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al refrescar token',
            });
        }
    }
    async getEmpresas(req, res) {
        const jwtToken = req.headers.authorization;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const aliasUsuarioLogueado = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(jwtToken);
            const usuario = await this.lowdbService.find({ alias: aliasUsuarioLogueado }, 'usuarios');
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/empresas.json');
            const empresas = await this.lowdbService.findAll('empresas');
            const empresasDelUsuario = empresas.filter((empresa) => {
                return usuario.empresas.some((data) => {
                    return data.cuit === empresa.cuit;
                });
            });
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '200',
                descripcionResultado: 'OK',
                empresas: empresasDelUsuario,
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener empresas',
            });
        }
    }
    getConfiguracionClave(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    longMaxPass: 12,
                    longMinPass: 8,
                    minusMinPass: 2,
                    mayusMinPass: 2,
                    numMinPass: 2,
                    caracteresEspecialesPass: '!#$/=_-.+*&@?¿¡',
                    maxCaractRepetidos: 2,
                    resultCode: 'RESULTADO_OK',
                    resultDescription: '',
                });
                break;
            case 1:
                res
                    .status(406)
                    .send('{"codigoResultado":"99","descripcionResultado":"Error al obtener reglas de contraseña"}');
                break;
        }
    }
    putClave(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    emailEnviado: 'm*******li@mail.com.ar',
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al confirmar contraseña',
                });
                break;
        }
    }
    postGenerateNuevoCodigoCiu(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    email: 'm*******li@mail.com.ar',
                    telefono: null,
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    email: null,
                    telefono: '11*******78',
                });
                break;
            case 2:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al generar clave ciu',
                });
                break;
        }
    }
    postCalveCiu(req, res) {
        const cuil = req.body.cuil;
        const ciu = req.body.ciu;
        const customResponse = {
            codigoResultado: '00',
            descripcionResultado: 'OK',
        };
        if (cuil === '20000000001') {
            customResponse.vinculaEmpresa = 'plazosfijos3';
        }
        else {
            customResponse.vinculaEmpresa = null;
        }
        if (ciu === '00000') {
            res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al verificar clave ciu',
                mostrarCaptcha: true,
            });
        }
        else {
            res.status(common_1.HttpStatus.OK).json(customResponse);
        }
    }
    getFormato(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    longMinUsuario: 2,
                    longMaxUsuario: 12,
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener reglas de contraseña',
                });
                break;
        }
    }
    postValidUsuarioNoUnificado(req, res) {
        const usuario = req.body.alias;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            switch (usuario) {
                case 'link12':
                    res
                        .status(common_1.HttpStatus.OK)
                        .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                    break;
                case 'red00':
                    res
                        .status(common_1.HttpStatus.OK)
                        .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                    break;
                case 'mail1':
                    res
                        .status(common_1.HttpStatus.OK)
                        .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                    break;
                case 'plazosfijos3':
                    res
                        .status(common_1.HttpStatus.OK)
                        .json({ codigoResultado: '00', descripcionResultado: 'OK' });
                    break;
                default:
                    res.status(302).json({
                        codigoResultado: '21',
                        descripcionResultado: 'Este nombre de usuario no está disponible. Escribí otro o seleccionalo de la lista',
                        usuariosSugeridos: ['mail1', 'red00', 'link12'],
                    });
                    break;
            }
        }
        catch (error) {
            res.status(406).json({
                codigoResultado: '05',
                descripcionResultado: 'Error al validar usuario',
            });
        }
    }
    postValidClave(res) {
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
                    descripcionResultado: 'Error al confirmar contraseña',
                });
                break;
        }
    }
    async postValidAlias(req, res) {
        const cuil = req.body.cuil;
        const alias = req.body.alias;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const usuarios = await this.lowdbService.findAll('usuarios');
            const usuarioEncontrado = usuarios.find((usuario) => {
                if (alias) {
                    return usuario.cuil === cuil && usuario.alias === alias;
                }
                else {
                    return usuario.cuil === cuil;
                }
            });
            if (usuarioEncontrado) {
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    email: 'm*********o@gmail.com',
                });
            }
            else {
                throw 'Error';
            }
        }
        catch (error) {
            res.status(406).json({
                codigoResultado: '05',
                descripcionResultado: 'Error al validar usuario',
            });
        }
    }
    postRecupero(req, res) {
        const cuit = req.body.cuit;
        switch (cuit) {
            case '30000000007':
                res
                    .status(406)
                    .json({ codigoResultado: '05', descripcionResultado: 'Error' });
                break;
            default:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    email: 'm*******li@mail.com.ar',
                    jwtReenvio: 'asd123',
                });
                break;
        }
    }
    postReenvioEmail(res) {
        if (this.countResendEmail > 3) {
            res.status(406).json({
                codigoResultado: '30',
                descripcionResultado: 'Ya no puede reenviar el mail.',
            });
            this.countResendEmail = 1;
        }
        else {
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                jwtReenvio: 'asd124',
            });
            this.countResendEmail++;
        }
    }
    postClaveRecupero(req, res) {
        const cuit = req.body.cuit;
        switch (cuit) {
            case '30000000007':
                res
                    .status(406)
                    .json({ codigoResultado: '05', descripcionResultado: 'Error' });
                break;
            default:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    email: 'm*********o@gmail.com',
                });
                break;
        }
    }
    postSesionZombie(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    jwt: 'fasdfasdfasd',
                });
                break;
            case 1:
                res
                    .status(406)
                    .json({ codigoResultado: '99', descripcionResultado: 'Error' });
                break;
        }
    }
    async getUsuarioInfo(req, res) {
        const jwtToken = req.headers.authorization;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const aliasUsuarioLogueado = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(jwtToken);
            const usuarioEncontrado = await this.lowdbService.find({ alias: aliasUsuarioLogueado }, 'usuarios');
            if (usuarioEncontrado) {
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    nombreYapellido: `${usuarioEncontrado.detalleDatosCompletos.nombre} ${usuarioEncontrado.detalleDatosCompletos.apellido}`,
                    cuil: usuarioEncontrado.detalleDatosCompletos.cuil,
                    avatar: usuarioEncontrado.detalleDatosCompletos.avatar,
                    celular: usuarioEncontrado.detalleDatosCompletos.celular,
                    prefijoCelular: usuarioEncontrado.detalleDatosCompletos.prefijoCelular,
                    email: usuarioEncontrado.detalleDatosCompletos.email,
                    usuario: usuarioEncontrado.detalleDatosCompletos.usuario,
                    datosContactoPendientes: usuarioEncontrado.detalleDatosCompletos.datosContactoPendientes,
                });
            }
            else {
                throw 'Error';
            }
        }
        catch (error) {
            res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al buscar datos del usuario',
            });
        }
    }
    async getConfiguracionDatos(req, res) {
        const jwtToken = req.headers.authorization;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const aliasUsuarioLogueado = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(jwtToken);
            const usuarioEncontrado = await this.lowdbService.find({ alias: aliasUsuarioLogueado }, 'usuarios');
            if (usuarioEncontrado) {
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    puedeModificarDatos: usuarioEncontrado.puedeModificarDatosPersonales,
                });
            }
            else {
                throw 'Error';
            }
        }
        catch (error) {
            res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error buscar permisos del usuario',
            });
        }
    }
    modificarEmailUsuario(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al actualizar el email',
                });
                break;
            case 2:
                res.status(500).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error genérico al actualizar email',
                });
                break;
        }
    }
    modificarTelefonoUsuario(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al actualizar el celular',
                });
                break;
            case 2:
                res.status(500).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error genérico al actualizar celular',
                });
                break;
        }
    }
    putValidClaveSFA(res) {
        let typeResponse = 0;
        if (this.countIntentosCambioClave > 2) {
            typeResponse = 2;
        }
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    email: 'm*******li@mail.com.ar',
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '05',
                    descripcionResultado: 'Los datos ingresados son incorrectos.',
                });
                this.countIntentosCambioClave++;
                break;
            case 2:
                res.status(406).json({
                    codigoResultado: '06',
                    descripcionResultado: 'El usuario se encuentra bloqueado.',
                });
                typeResponse = 0;
                break;
            case 3:
                res.status(500).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error generico al confirmar contraseña',
                });
                break;
        }
    }
    modificarAliasUsuarioTandem(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al modificar nombre usuario',
                });
                break;
        }
    }
    getConfiguracionUnificacion(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    unificado: true,
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    unificado: false,
                });
                break;
            case 2:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error generico',
                });
                break;
        }
    }
};
__decorate([
    (0, common_1.Post)('/usuario/sesion'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsuariosAPPWEBMockController.prototype, "postUsuarioSesion", null);
__decorate([
    (0, common_1.Delete)('/usuario/sesion'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "deleteUsuarioSesion", null);
__decorate([
    (0, common_1.Post)('/usuario/sesion/token'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsuariosAPPWEBMockController.prototype, "postSesionToken", null);
__decorate([
    (0, common_1.Get)('/usuario/empresas'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsuariosAPPWEBMockController.prototype, "getEmpresas", null);
__decorate([
    (0, common_1.Get)('/usuario/clave/formato'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "getConfiguracionClave", null);
__decorate([
    (0, common_1.Put)('/usuario/clave'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "putClave", null);
__decorate([
    (0, common_1.Post)('/usuario/clave/ciu/generacion'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "postGenerateNuevoCodigoCiu", null);
__decorate([
    (0, common_1.Post)('/usuario/clave/ciu'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "postCalveCiu", null);
__decorate([
    (0, common_1.Get)('/usuario/formato'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "getFormato", null);
__decorate([
    (0, common_1.Post)('/usuario'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "postValidUsuarioNoUnificado", null);
__decorate([
    (0, common_1.Post)('/usuario/clave'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "postValidClave", null);
__decorate([
    (0, common_1.Post)('/usuario/alias'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsuariosAPPWEBMockController.prototype, "postValidAlias", null);
__decorate([
    (0, common_1.Post)('/usuario/recupero'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "postRecupero", null);
__decorate([
    (0, common_1.Post)('/usuario/recupero/reenvio'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "postReenvioEmail", null);
__decorate([
    (0, common_1.Post)('/usuario/clave/recupero'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "postClaveRecupero", null);
__decorate([
    (0, common_1.Post)('/usuario/sesion/zombie'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "postSesionZombie", null);
__decorate([
    (0, common_1.Get)('/usuario'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsuariosAPPWEBMockController.prototype, "getUsuarioInfo", null);
__decorate([
    (0, common_1.Get)('/usuario/configuracion/datos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsuariosAPPWEBMockController.prototype, "getConfiguracionDatos", null);
__decorate([
    (0, common_1.Put)('/usuario/email'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "modificarEmailUsuario", null);
__decorate([
    (0, common_1.Put)('/usuario/telefono'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "modificarTelefonoUsuario", null);
__decorate([
    (0, common_1.Put)('/usuario/clave/sfa'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "putValidClaveSFA", null);
__decorate([
    (0, common_1.Put)('/usuario'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "modificarAliasUsuarioTandem", null);
__decorate([
    (0, common_1.Get)('/usuario/configuracion/unificacion'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosAPPWEBMockController.prototype, "getConfiguracionUnificacion", null);
UsuariosAPPWEBMockController = __decorate([
    (0, common_1.Controller)('usuarios-APPWEB/rest-api'),
    __metadata("design:paramtypes", [lowdb_service_1.LowdbService])
], UsuariosAPPWEBMockController);
exports.UsuariosAPPWEBMockController = UsuariosAPPWEBMockController;
//# sourceMappingURL=usuarios-APPWEB-mock.controller.js.map