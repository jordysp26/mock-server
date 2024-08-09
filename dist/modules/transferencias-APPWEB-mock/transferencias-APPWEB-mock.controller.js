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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferenciasAPPWEBMockController = void 0;
const common_1 = require("@nestjs/common");
const lowdb_service_1 = require("../../lowdb/lowdb.service");
const fechas_1 = require("../../utils/functions/fechas");
const getUserNameFromJWTToken_1 = require("../../utils/functions/getUserNameFromJWTToken");
const random_1 = require("../../utils/functions/random");
const formatNumber_1 = require("../../utils/functions/formatNumber");
let TransferenciasAPPWEBMockController = class TransferenciasAPPWEBMockController {
    constructor(lowdbService) {
        this.lowdbService = lowdbService;
    }
    async initTransferencias() {
        try {
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
            const transferencias = await this.lowdbService.findAll('transferencias');
            transferencias.forEach((transferencia) => {
                transferencia.fechaCarga = (0, fechas_1.randomDate)();
            });
            await this.lowdbService
                .getDb()
                .set('transferencias', transferencias)
                .write();
        }
        catch (error) {
            console.log('error al actualizar fechas: ', error);
        }
    }
    async cargaTransferenciaIndividual(headers, req, res) {
        const cbuCredito = req.body.cbucredito;
        const concepto = req.body.concepto;
        const motivoID = req.body.motivoID;
        const enviarMail = req.body.enviarMail;
        const fechaImputacion = req.body.fechaImputacion;
        const importe = req.body.importe;
        const mail = req.body.mail;
        const tipo = req.body.modulo;
        const nroCuentaDebito = req.body.nroCuentaDebito;
        const referencia = req.body.referencia;
        const tipoCuentaCredito = req.body.tipoCuentaCredito;
        const tipoCuentaDebito = req.body.tipoCuentaDebito;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error interno';
            }
            const transferencia = {};
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/tipos-cuenta.json');
            const tipoCuenta = await this.lowdbService.find({
                id: tipoCuentaCredito,
            }, 'tiposCuenta');
            transferencia.tipoCuenta = tipoCuenta;
            transferencia.nroTransferencia = '' + new Date().getTime();
            transferencia.numeroCuentaDebito = nroCuentaDebito;
            transferencia.tipoCuentaDebitoId = tipoCuentaDebito;
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/destinatarios.json');
            const destinatarios = await this.lowdbService.findAll('destinatarios');
            const destinatario = destinatarios.find((dato) => {
                return (dato.cbu.indexOf(cbuCredito) > -1 &&
                    dato.tipoCuenta.id == tipoCuentaCredito);
            });
            transferencia.nombreDestinatario = destinatario.destinatario;
            transferencia.fechaCarga = (0, fechas_1.randomDate)(0);
            transferencia.fechaImputacion = tipo === 'TOFF' ? fechaImputacion : '';
            transferencia.importe = importe;
            await this.lowdbService.initDatabase(`./src/modules/configuracion-APPWEB-mock/json/conceptos-${tipo === 'TON' ? 'ton' : 'toff'}.json`);
            const conceptos = await this.lowdbService.findAll(`conceptos${tipo === 'TON' ? tipo : 'TOFF'}`);
            const _a = conceptos.find((concepto) => {
                return concepto.conceptoId === motivoID;
            }), { descripcion } = _a, datosCon = __rest(_a, ["descripcion"]);
            transferencia.concepto = concepto;
            transferencia.motivo = descripcion;
            transferencia.referencia = referencia;
            transferencia.estadoName = 'Pendiente de firma';
            transferencia.estadoCode = 'FP';
            transferencia.cbuDestinatario = cbuCredito;
            transferencia.numeroCuentaCredito = destinatario.numeroCuenta;
            transferencia.cuitCuentaCredito = destinatario.titulares[0].numeroClave;
            transferencia.firmas = [];
            transferencia.tipo = tipo;
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
            await this.lowdbService.add(transferencia, 'transferencias');
            return res.json({
                codigoResultado: '01',
                descripcionResultado: 'ok',
                operacionEstado: {
                    nroOperacion: transferencia.nroTransferencia,
                    estado: transferencia.estadoCode,
                },
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al cargar transferencia',
            });
        }
    }
    async transferenciaFirma(headers, req, res) {
        const cuit = headers.cuit;
        const operaciones = req.body.operaciones;
        const operacionesResponse = [];
        const notRetry = {
            '01': {
                codigoResultado: '01',
                descripcionResultado: 'Parámetros ingresados incorrectos',
            },
            '31': {
                codigoResultado: '31',
                descripcionResultado: 'No existen datos para la consulta realizada',
            },
            '73': {
                codigoResultado: '73',
                descripcionResultado: 'La transferencia se firmó correctamente, pero la cuenta seleccionada no dispone de fondos suficientes. ',
            },
        };
        const retry = {
            '99': {
                codigoResultado: '99',
                descripcionResultado: 'Error al firmar transferencia',
            },
        };
        const allSuccess = true;
        const allErrorsRetry = false;
        const totalSuccess = 2;
        const totalRetry = 1;
        const error01 = Object.assign({ status: 406 }, notRetry['01']);
        const error31 = Object.assign({ status: 406 }, notRetry['31']);
        const error73 = Object.assign({ status: 406 }, notRetry['73']);
        const error99 = Object.assign({ status: 500 }, retry['99']);
        const typeResponse = 0;
        try {
            let response;
            const usuario = await this.getUsuario(headers.authorization);
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
            if (typeResponse === 1) {
                throw error01;
            }
            if (typeResponse === 2) {
                throw error31;
            }
            if (typeResponse === 3 || allErrorsRetry) {
                throw error99;
            }
            if (typeResponse === 4) {
                throw error73;
            }
            for (let index = 0; index < operaciones.length; index++) {
                const transferencias = await this.lowdbService.findAll('transferencias');
                const operacion = operaciones[index];
                const transferencia = transferencias.find((transferencia) => transferencia.nroTransferencia == operacion.nroOperacion);
                response = null;
                if (allSuccess || index < totalSuccess) {
                    response = await this.firmarTransferencia(transferencia, usuario, cuit);
                    await this.actualizarBD('transferencias', transferencias);
                    operacionesResponse.push(response);
                }
                else {
                    const codigo = index < totalSuccess + totalRetry
                        ? retry['99']
                        : notRetry[Reflect.ownKeys(notRetry)[(index + 1) % Reflect.ownKeys(notRetry).length]];
                    operacionesResponse.push(Object.assign(Object.assign({}, codigo), { nroOperacion: operacion.nroOperacion, estado: null }));
                }
            }
            return res.status(200).json({
                codigoResultado: '00',
                descripcionResultado: 'ok',
                operaciones: operacionesResponse,
            });
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async transferenciaEnvio(headers, req, res) {
        const operaciones = req.body.operaciones;
        const operacionesResponse = [];
        const resultadosEnvio = {
            enviada: {
                estadoCode: 'EN',
                estadoName: 'Enviado',
                codigoResultado: '00',
                descripcionResultado: 'Transferencia enviada',
            },
            pendiente: {
                estadoCode: 'PE',
                estadoName: 'Pendiente',
                codigoResultado: '97',
                descripcionResultado: 'Transferencia pendiente de acreditación',
            },
            noEnviada: {
                estadoCode: 'PE',
                estadoName: 'Pendiente',
                codigoResultado: '90',
                descripcionResultado: 'Transferencia no enviada',
            },
        };
        let resultadoEnvio = null;
        const error65 = {
            status: 406,
            codigoResultado: '65',
            descripcionResultado: 'Límite superado',
        };
        const error73 = {
            status: 406,
            codigoResultado: '73',
            descripcionResultado: 'La transferencia no se pudo enviar porque la cuenta seleccionada no dispone de fondos suficientes. ',
        };
        const error99 = {
            status: 500,
            codigoResultado: '99',
            descripcionResultado: 'No pudimos realizar la operación',
        };
        const typeResponse = 0;
        const someError = false;
        try {
            if (typeResponse === 1) {
                throw error65;
            }
            if (typeResponse === 2) {
                throw error99;
            }
            if (typeResponse === 3) {
                throw error73;
            }
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
            for (let index = 0; index < operaciones.length; index++) {
                const transferencias = await this.lowdbService.findAll('transferencias');
                const operacion = operaciones[index];
                const transferencia = transferencias.find((transferencia) => transferencia.nroTransferencia == operacion.nroOperacion);
                if (index === 0 || !someError) {
                    resultadoEnvio = resultadosEnvio.enviada;
                }
                else {
                    const nroEnvio = someError ? Math.floor(Math.random() * 3 + 1) : 1;
                    if (nroEnvio === 2) {
                        const codigoError = Math.floor(Math.random() * 2 + 1) === 1 ? '98' : '99';
                        resultadoEnvio = resultadosEnvio.noEnviada;
                        resultadosEnvio.noEnviada.codigoResultado = codigoError;
                    }
                    else {
                        resultadoEnvio = resultadosEnvio.pendiente;
                    }
                }
                const response = await this.enviarTransferencia(transferencia, resultadoEnvio);
                this.actualizarBD('transferencias', transferencias);
                operacionesResponse.push(response);
            }
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'ok',
                operaciones: operacionesResponse,
            });
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async obtieneConsultaAgenda(req, res) {
        const pageNumber = parseInt(req.query.pageNumber) + 1;
        const records = parseInt(req.query.records);
        const body = req.body;
        const typeResponse = 0;
        try {
            if (typeResponse === 1) {
                throw {
                    status: 406,
                    codigoResultado: '31',
                    descripcionResultado: 'No tenes destinatarios agendados',
                };
            }
            if (typeResponse === 2) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener destinatarios',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/tipos-cuenta.json');
            const tiposCuenta = await this.lowdbService.findAll('tiposCuenta');
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/destinatarios.json');
            let destinatarios = await this.lowdbService.findAll('destinatarios');
            if (body.bancoDestino) {
                let bancoDestino;
                if (body.bancoDestino.toString().charAt(0) !== '0') {
                    bancoDestino = '0' + body.bancoDestino.toString();
                }
                else {
                    bancoDestino = body.bancoDestino;
                }
                destinatarios = destinatarios.filter((dato) => {
                    return dato.bancoId.toString().indexOf(bancoDestino) > -1;
                });
            }
            if (body.estados && body.estados.length > 0 && body.estados.length < 3) {
                destinatarios = destinatarios.filter((dato) => {
                    let estado;
                    switch (dato.estado.toString()) {
                        case 'Activa':
                            estado = 'VE';
                            break;
                        case 'Eliminada':
                            estado = 'BA';
                            break;
                        case 'Pendiente':
                            estado = 'AP';
                            break;
                        case 'Rechazada':
                            estado = 'RE';
                            break;
                    }
                    return body.estados.includes(estado);
                });
            }
            if (body.campoOrden && body.orden && body.campoOrden !== 'FECHA') {
                switch (body.campoOrden) {
                    case 'ESTADO':
                        destinatarios = destinatarios.sort((a, b) => a.estado < b.estado ? 1 : -1);
                        break;
                    case 'DESTINATARIO':
                        destinatarios = destinatarios.sort((a, b) => a.destinatario < b.destinatario ? 1 : -1);
                        break;
                }
                if (body.orden === 'DESC') {
                    destinatarios = destinatarios.reverse();
                }
            }
            if (body.referencia) {
                let lista = [];
                if (body.referencia.includes('-')) {
                    lista = body.referencia
                        .toString()
                        .split('-')
                        .map((item) => item.trim());
                    const tipoCuentaEncontrada = tiposCuenta.find((tipoCuenta) => lista.some((element) => {
                        return (tipoCuenta.descripcionCorta.toLowerCase() ===
                            element.toLowerCase());
                    }));
                    if (tipoCuentaEncontrada) {
                        const i = lista.indexOf(tipoCuentaEncontrada.descripcionCorta);
                        if (i !== -1) {
                            lista.splice(i, 1);
                        }
                        destinatarios = this.buscarDestinatarios(lista, destinatarios);
                    }
                    else {
                        destinatarios = this.buscarDestinatarios(lista, destinatarios);
                    }
                }
                else {
                    destinatarios = destinatarios.filter((dato) => {
                        var _a;
                        return (((_a = dato.referencia) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase().indexOf(body.referencia.toString().toLowerCase())) > -1 ||
                            dato.destinatario
                                .toString()
                                .toLowerCase()
                                .indexOf(body.referencia.toString().toLowerCase()) > -1);
                    });
                }
            }
            if (destinatarios.length > 0) {
                const cantidadTotal = destinatarios.length;
                const cantidadPaginas = Math.ceil(cantidadTotal / records);
                const destfiltrados = destinatarios.slice(records * (pageNumber - 1), records * pageNumber);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '200',
                    descripcionResultado: 'ok',
                    destinatarios: destfiltrados.map((_a) => {
                        var { bancoId, fechaAdhesion, titulares, numeroCuenta } = _a, datos = __rest(_a, ["bancoId", "fechaAdhesion", "titulares", "numeroCuenta"]);
                        return datos;
                    }),
                    paginasTotales: cantidadPaginas,
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '31',
                    descripcionResultado: 'No encontramos resultados',
                };
            }
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    getComprobantesTransacciones(req, res) {
        const error99 = {
            status: 406,
            codigoResultado: '99',
            descripcionResultado: 'Ocurrió un problema al realizar la descarga. Intentalo de nuevo en unos minutos.',
        };
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw error99;
            }
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            });
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    getUnicoComprobanteTransaccion(req, res) {
        const error99 = {
            status: 406,
            codigoResultado: '99',
            descripcionResultado: 'Ocurrió un problema al realizar la descarga. Intentalo de nuevo en unos minutos.',
        };
        const transaccion = req.query.transaccion;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw error99;
            }
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            });
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    descargaArchivoConsultaAgenda(req, res) {
        const formato = req.body.formato;
        switch (formato) {
            case 'TXT':
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    url: 'https://filesamples.com/samples/document/txt/sample1.txt',
                });
                break;
            case 'CSV':
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    url: 'https://filesamples.com/samples/document/csv/sample1.csv',
                });
                break;
            case 'PDF':
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                });
                break;
        }
    }
    async getAprobador(headers, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error interno';
            }
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const aliasUsuarioLogueado = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(headers.authorization);
            const aprobador = await this.lowdbService.find({ alias: aliasUsuarioLogueado }, 'usuarios');
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                apruebaDestinatario: aprobador.puedeAprobarDestinatarios,
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener los permisos de aprobador para el usuario',
            });
        }
    }
    async modificarDestinatario(cbu, tipoCuentaId, req, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error interno';
            }
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/destinatarios.json');
            let destinatarios = await this.lowdbService.findAll('destinatarios');
            let destinatarioAModificar = {};
            let index;
            destinatarios = destinatarios.filter((destinatario) => {
                if (destinatario.cbu === cbu &&
                    destinatario.tipoCuenta.id === tipoCuentaId) {
                    destinatarioAModificar = destinatario;
                    index = destinatarios.findIndex((x) => x === destinatario);
                }
                return (destinatario.cbu !== cbu ||
                    destinatario.tipoCuenta.id !== tipoCuentaId);
            });
            destinatarioAModificar.email = req.body.email;
            destinatarioAModificar.referencia = req.body.referencia;
            destinatarios.splice(index, 0, destinatarioAModificar);
            await this.lowdbService
                .getDb()
                .set('destinatarios', destinatarios)
                .write();
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
            });
        }
        catch (error) {
            switch (typeResponse) {
                case 1:
                    res.status(500).json({
                        codigoResultado: '99',
                        descripcionResultado: 'Error genérico',
                    });
                    break;
                case 2:
                    res.status(406).json({
                        codigoResultado: '99',
                        descripcionResultado: 'Error genérico',
                    });
                    break;
            }
        }
    }
    async obtieneDatosCbu(req, res) {
        var _a;
        const body = req.body;
        const typeResponse = 0;
        const error39 = {
            status: 406,
            codigoResultado: '39',
            descripcionResultado: 'Error al obtener datos del cbu 39',
        };
        const error42 = {
            status: 406,
            codigoResultado: '42',
            descripcionResultado: 'El CBU ya se encuentra agendado',
        };
        try {
            if (typeResponse === 1) {
                throw {
                    status: 500,
                    codigoResultado: '500',
                    descripcionResultado: 'Error al obtener datos del cbu 500',
                };
            }
            else if (body.cbu === '0290000000000000000000') {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener datos del cbu',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/destinatarios.json');
            const destinatariosDatabase = await this.lowdbService.findAll('destinatarios');
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/datos-cbu-cuenta-services.json');
            const cuentaServicesData = await this.lowdbService.find(body.cbu ? { cbu: body.cbu } : { alias: body.alias }, 'datosCbuCuentaServices');
            if (body.alias && !cuentaServicesData) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener datos del cbu',
                };
            }
            const destinatarioFound = destinatariosDatabase.filter((dest) => (body.cbu && dest.cbu === body.cbu) ||
                (body.alias && dest.alias === body.alias));
            if ((_a = destinatarioFound[0]) === null || _a === void 0 ? void 0 : _a.cbu.startsWith('072')) {
                if (destinatarioFound.length === 2) {
                    throw error42;
                }
                else if (destinatarioFound.length === 1) {
                    if ((cuentaServicesData === null || cuentaServicesData === void 0 ? void 0 : cuentaServicesData.datosCuentas.length) === 1) {
                        throw error42;
                    }
                    else {
                        if (cuentaServicesData) {
                            cuentaServicesData.datosCuentas.forEach((c) => {
                                c.agendado =
                                    c.tipoCuenta.id === destinatarioFound[0].tipoCuenta.id;
                            });
                            return res.status(common_1.HttpStatus.OK).json({
                                codigoResultado: '200',
                                descripcionResultado: 'ok',
                                cbu: cuentaServicesData.cbu,
                                datosCuentas: cuentaServicesData.datosCuentas,
                            });
                        }
                        else {
                            throw error39;
                        }
                    }
                }
                else {
                    if (cuentaServicesData) {
                        cuentaServicesData.datosCuentas.forEach((c) => {
                            c.agendado = false;
                        });
                        return res.status(common_1.HttpStatus.OK).json({
                            codigoResultado: '200',
                            descripcionResultado: 'ok',
                            cbu: cuentaServicesData.cbu,
                            datosCuentas: cuentaServicesData.datosCuentas,
                        });
                    }
                    else {
                        throw error39;
                    }
                }
            }
            else {
                if (destinatarioFound.length > 0) {
                    throw error42;
                }
                else {
                    if (cuentaServicesData) {
                        cuentaServicesData.datosCuentas.forEach((c) => {
                            c.agendado = false;
                        });
                        return res.status(common_1.HttpStatus.OK).json({
                            codigoResultado: '200',
                            descripcionResultado: 'ok',
                            cbu: cuentaServicesData.cbu,
                            datosCuentas: cuentaServicesData.datosCuentas,
                        });
                    }
                    else {
                        throw error39;
                    }
                }
            }
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async agendarDestinatario(req, res) {
        const agregarDestinatariosInfo = req.body.agregarDestinatariosInfo;
        const typeResponse = 0;
        try {
            if (typeResponse === 1) {
                throw 'Error';
            }
            for (const destinatarioInfo of agregarDestinatariosInfo) {
                const cbu = destinatarioInfo.cbu;
                const alias = destinatarioInfo.alias;
                const email = destinatarioInfo.email;
                const nroDocumento = destinatarioInfo.nroDocumento;
                const referencia = destinatarioInfo.referencia;
                const tipoCuentaId = destinatarioInfo.tipoCuentaId;
                const tipoDocumento = destinatarioInfo.tipoDocumento;
                const titularCuenta = destinatarioInfo.titularCuenta;
                const numeroCuenta = destinatarioInfo.nroCuenta;
                const destinatario = {};
                destinatario.destinatario = titularCuenta;
                destinatario.bancoId = cbu.substr(0, 3);
                destinatario.cbu = cbu;
                destinatario.alias = alias;
                destinatario.referencia = referencia;
                destinatario.estado = 'Pendiente';
                destinatario.email = email;
                destinatario.numeroCuenta = numeroCuenta;
                if (destinatario.bancoId === '000') {
                    destinatario.banco = 'Cuenta virtual';
                }
                else {
                    await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/bancos.json');
                    const banco = await this.lowdbService.find((banco) => {
                        return banco.codigoBCRA.endsWith(destinatario.bancoId);
                    }, 'bancos');
                    destinatario.banco = banco.nombre;
                }
                await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/tipos-cuenta.json');
                const tipoCuenta = await this.lowdbService.find({
                    id: tipoCuentaId,
                }, 'tiposCuenta');
                destinatario.tipoCuenta = tipoCuenta;
                destinatario.fechaAdhesion = (0, fechas_1.getFecha)();
                const cantTitulares = (0, random_1.getRandomInt)(1, 3);
                destinatario.titulares = [];
                for (let i = 0; i < cantTitulares; i++) {
                    if (i === 0) {
                        destinatario.titulares.push({
                            tipoClave: tipoDocumento,
                            numeroClave: nroDocumento,
                            nombreApellido: destinatario.destinatario,
                        });
                    }
                    else {
                        destinatario.titulares.push({
                            tipoClave: 'CUIT',
                            numeroClave: '3000000001' + i,
                            nombreApellido: 'Bruno Marte',
                        });
                    }
                }
                await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/destinatarios.json');
                await this.lowdbService.add(destinatario, 'destinatarios');
            }
            return res.json({ codigoResultado: '00', descripcionResultado: 'OK' });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al agendar destinatario',
            });
        }
    }
    async getDetalleCbu(req, res) {
        const typeResponse = 0;
        const cbu = req.body.cbu;
        const tipoCuentaId = req.body.tipoCuenta;
        try {
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/destinatarios.json');
            if (typeResponse === 1) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al buscar detalle',
                };
            }
            const destinatarios = await this.lowdbService.findAll('destinatarios');
            const destinatario = destinatarios.find((destinatario) => {
                return (destinatario.cbu.indexOf(cbu) > -1 &&
                    destinatario.tipoCuenta.id == tipoCuentaId);
            });
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/datos-cbu-cuenta-services.json');
            const datosCbuCuentas = await this.lowdbService.findAll('datosCbuCuentaServices');
            let informado = false;
            for (const datoCuenta of datosCbuCuentas) {
                if (datoCuenta.cbu.indexOf(destinatario.cbu) > -1) {
                    informado = true;
                }
            }
            if (destinatario) {
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    destinatarioDetalle: {
                        nombreBanco: destinatario.banco,
                        tipoCuenta: destinatario.tipoCuenta,
                        cbu: destinatario.cbu,
                        fechaAdhesion: destinatario.fechaAdhesion,
                        email: destinatario.email,
                        referencia: destinatario.referencia,
                        estado: destinatario.estado,
                        titulares: destinatario.titulares,
                        informado: informado,
                        numeroCuenta: destinatario.numeroCuenta,
                    },
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '35',
                    descripcionResultado: 'No esta agendado',
                };
            }
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async descargaDetalleDestinatario(req, res) {
        const error99 = {
            status: 406,
            codigoResultado: '99',
            descripcionResultado: 'Ocurrió un problema al realizar la descarga. Intentalo de nuevo en unos minutos.',
        };
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw error99;
            }
            res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            });
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async getAgendaDestinatarios(req, res) {
        const typeResponse = 0;
        try {
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/destinatarios.json');
            if (typeResponse === 1) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al buscar destinatario por cbu',
                };
            }
            if (req.body.cbu === '0290000000000000000000') {
                throw {
                    status: 406,
                    codigoResultado: '36',
                    descripcionResultado: 'CBU invalido',
                };
            }
            let destinatarios = await this.lowdbService.findAll('destinatarios');
            destinatarios = destinatarios.filter((destinatario) => {
                if (req.body.cbu) {
                    return destinatario.cbu.indexOf(req.body.cbu) > -1;
                }
                else {
                    return destinatario.alias === req.body.alias;
                }
            });
            if (destinatarios.length === 0) {
                throw {
                    status: 406,
                    codigoResultado: '35',
                    descripcionResultado: 'Destinatario no agendado',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/datos-cbu-cuenta-services.json');
            const datosCbuCuentas = await this.lowdbService.findAll('datosCbuCuentaServices');
            const destinatarioDetalles = [];
            let informado;
            destinatarios.forEach((destinatario) => {
                informado = false;
                for (const datoCuenta of datosCbuCuentas) {
                    if (datoCuenta.cbu.indexOf(destinatario.cbu) > -1) {
                        informado = true;
                    }
                }
                destinatarioDetalles.push({
                    nombreBanco: destinatario.banco,
                    tipoCuenta: destinatario.tipoCuenta,
                    cbu: destinatario.cbu,
                    fechaAdhesion: destinatario.fechaAdhesion,
                    email: destinatario.email,
                    referencia: destinatario.referencia,
                    estado: destinatario.estado,
                    titulares: destinatario.titulares,
                    informado: informado,
                    numeroCuenta: destinatario.numeroCuenta,
                });
            });
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                destinatarioDetalles: destinatarioDetalles,
            });
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    eliminarDestinatario(res) {
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
    async aprobarDestinatariosAgenda(req, res) {
        const destinatariosSearch = req.body.destinatarios;
        const typeResponse = 0;
        try {
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/destinatarios.json');
            if (typeResponse > 0) {
                throw 'Error';
            }
            let destinatarios = await this.lowdbService.findAll('destinatarios');
            destinatariosSearch.forEach((destinatario) => {
                const destinatarioFound = destinatarios.find((dato) => {
                    return (dato.cbu.indexOf(destinatario.cbu) > -1 &&
                        dato.tipoCuenta.id.indexOf(destinatario.tipoCuentaId) > -1);
                });
                destinatarios = destinatarios.filter((dato) => {
                    return !(dato.cbu.indexOf(destinatario.cbu) > -1 &&
                        dato.tipoCuenta.id.indexOf(destinatario.tipoCuentaId) > -1);
                });
                destinatarioFound.estado = 'Activa';
                destinatarios.push(destinatarioFound);
            });
            await this.lowdbService
                .getDb()
                .set('destinatarios', destinatarios)
                .write();
            return res.json({ codigoResultado: '00', descripcionResultado: 'ok' });
        }
        catch (error) {
            if (typeResponse === 1) {
                return res.status(406).json({
                    codigoResultado: '98',
                    descripcionResultado: 'Error al aprobar destinatario/s',
                });
            }
            else {
                return res.status(500).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al aprobar destinatario/s',
                });
            }
        }
    }
    async consultaTransferencias(req, res) {
        const pageNumber = parseInt(req.query.pageNumber) + 1;
        const records = parseInt(req.query.records);
        const body = req.body;
        const typeResponse = 0;
        try {
            if (typeResponse === 1) {
                throw {
                    status: 406,
                    codigoResultado: '31',
                    descripcionResultado: 'No encontramos resultados',
                };
            }
            if (typeResponse === 2) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener transferencias',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
            const transferencias = await this.lowdbService.findAll('transferencias');
            let transferenciasCuentaTipo = [];
            if (body.nroCuenta && body.tipoCuenta) {
                transferenciasCuentaTipo = transferencias.filter((transferencia) => {
                    return (transferencia.numeroCuentaDebito === body.nroCuenta &&
                        transferencia.tipoCuentaDebitoId === body.tipoCuenta);
                });
            }
            transferenciasCuentaTipo = transferenciasCuentaTipo.filter((transferencia) => body.tipoTransferencia === transferencia.tipo);
            if (body.fechaDesde && body.fechaHasta) {
                const fechaDesdeDate = new Date(body.fechaDesde)
                    .toISOString()
                    .slice(0, 10);
                const fechaHastaDate = new Date(body.fechaHasta)
                    .toISOString()
                    .slice(0, 10);
                transferenciasCuentaTipo = transferenciasCuentaTipo.filter((transferencia) => {
                    const fecha = new Date(transferencia.fechaCarga)
                        .toISOString()
                        .slice(0, 10);
                    return fecha >= fechaDesdeDate && fecha <= fechaHastaDate;
                });
            }
            if (body.importeMinimo || body.importeMaximo) {
                const importeMin = body.importeMinimo ? body.importeMinimo : '0';
                const importeMax = body.importeMaximo
                    ? body.importeMaximo
                    : '9999999999,99';
                transferenciasCuentaTipo = transferenciasCuentaTipo.filter((transferencia) => {
                    return (transferencia.importe >= (0, formatNumber_1.formatNumber)(importeMin) &&
                        transferencia.importe <= (0, formatNumber_1.formatNumber)(importeMax));
                });
            }
            if (body.estados && body.estados.length > 0) {
                transferenciasCuentaTipo = transferenciasCuentaTipo.filter((dato) => {
                    return body.estados.includes(dato.estadoCode);
                });
            }
            if (body.campoOrden && body.orden) {
                switch (body.campoOrden) {
                    case 'IMPORTE':
                        transferenciasCuentaTipo = transferenciasCuentaTipo.sort((a, b) => Number(a.importe) - Number(b.importe));
                        break;
                    case 'NOMBRE_DESTINATARIO':
                        transferenciasCuentaTipo = transferenciasCuentaTipo.sort((a, b) => a.nombreDestinatario < b.nombreDestinatario ? 1 : -1);
                        break;
                    case 'FECHA_CARGA':
                        transferenciasCuentaTipo = transferenciasCuentaTipo.sort((a, b) => a.fechaCarga < b.fechaCarga ? 1 : -1);
                        break;
                }
                if (body.orden === 'DESC') {
                    transferenciasCuentaTipo = transferenciasCuentaTipo.reverse();
                }
            }
            if (body.cbuDestinatario && body.tipoCuentaDestinatario) {
                transferenciasCuentaTipo = transferenciasCuentaTipo.filter((dato) => {
                    return (body.cbuDestinatario === dato.cbuDestinatario &&
                        body.tipoCuentaDestinatario === dato.tipoCuenta.id);
                });
            }
            if (body.nroTransferencia) {
                transferenciasCuentaTipo = transferencias.filter((transferencia) => {
                    return body.nroTransferencia === transferencia.nroTransferencia;
                });
            }
            if (transferenciasCuentaTipo.length > 0) {
                const cantidadTotal = transferenciasCuentaTipo.length;
                const cantidadPaginas = Math.ceil(cantidadTotal / records);
                const destfiltrados = transferenciasCuentaTipo.slice(records * (pageNumber - 1), records * pageNumber);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '200',
                    descripcionResultado: 'ok',
                    transferencias: destfiltrados.map((transferencia) => {
                        return {
                            nroTransferencia: transferencia.nroTransferencia,
                            nombreDestinatario: transferencia.nombreDestinatario,
                            cbuDestinatario: transferencia.cbuDestinatario,
                            fechaCarga: transferencia.fechaCarga,
                            importe: transferencia.importe,
                            concepto: transferencia.concepto,
                            fechaImputacion: transferencia.fechaImputacion,
                            referencia: transferencia.referencia,
                            estadoCode: transferencia.estadoCode,
                            estadoName: transferencia.estadoName,
                            cuitCuentaCredito: transferencia.cuitCuentaCredito,
                            cuentaCredito: transferencia.numeroCuentaCredito,
                            tipoCuentaCredito: transferencia.tipoCuenta.descripcionCorta,
                        };
                    }),
                    paginasTotales: cantidadPaginas,
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '31',
                    descripcionResultado: 'No encontramos resultados',
                };
            }
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async modificarTransferenciaTOFF(nroTran, req, res) {
        const newDate = req.body.fechaImputacion;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al modificar la fecha de imputacion',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
            let transferencias = await this.lowdbService.findAll('transferencias');
            let transferenciaAModificar = {};
            let index;
            transferencias = transferencias.filter((transferencia) => {
                if (transferencia.nroTransferencia === nroTran) {
                    transferenciaAModificar = transferencia;
                    index = transferencias.findIndex((x) => x === transferencia);
                }
                return transferencia.nroTransferencia !== nroTran;
            });
            transferenciaAModificar.fechaImputacion = newDate;
            transferencias.splice(index, 0, transferenciaAModificar);
            await this.lowdbService
                .getDb()
                .set('transferencias', transferencias)
                .write();
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
            });
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async getFirmantesDetalleTransferencia(headers, req, res) {
        const cuit = headers.cuit;
        const nroTran = req.body.nroTran;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener tipo de acciones de transferencia',
                };
            }
            const firmantesDatos = [];
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
            const transferencias = await this.lowdbService.findAll('transferencias');
            const nroCtaDebito = transferencias.find((transferencia) => transferencia.nroTransferencia == nroTran).numeroCuentaDebito;
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/cuentas-por-cuit.json');
            const cuentasDeLaEmpresa = await this.lowdbService.find({ cuit }, 'cuentasPorCuit');
            const firmantes = cuentasDeLaEmpresa.datos.find((dato) => dato.nroCuenta === nroCtaDebito).firmantes;
            await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
            const usuarios = await this.lowdbService.findAll('usuarios');
            firmantes.forEach((firmante) => {
                const usuarioEncontrado = usuarios.find((usuario) => usuario.cuil === firmante);
                firmantesDatos.push({
                    usuarioId: (0, random_1.getRandomInt)(1, 10).toString(),
                    nombre: usuarioEncontrado.nombre,
                    apellido: usuarioEncontrado.apellido,
                    tipoDocumento: 'CUIL',
                    documento: usuarioEncontrado.cuil,
                });
            });
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                firmantes: firmantesDatos,
            });
        }
        catch (error) {
            return res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async obtenerLimitesTransferencias(headers, req, res) {
        const cuit = headers.cuit;
        const cuenta = req.query.cuenta.toString();
        const tipoCuenta = req.query.tipoCuenta.toString();
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error generico';
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/cuentas-por-cuit.json');
            const cuentasPorCuit = await this.lowdbService.find({ cuit }, 'cuentasPorCuit');
            const cuentaPorCuit = cuentasPorCuit.datos.find((item) => {
                return (item.nroCuenta.indexOf(cuenta) > -1 &&
                    item.tipoCuenta.id.indexOf(tipoCuenta) > -1);
            });
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                limite: cuentaPorCuit.limite,
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al consultar limite de cuenta',
            });
        }
    }
    getConfiguracion(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    habTrxFuturas: true,
                    horaCierre: '18:00',
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    habTrxFuturas: false,
                    horaCierre: '14:00',
                });
                break;
            case 2:
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener configuracion',
                });
                break;
        }
    }
    async obtenerComprobanteTransferencias(headers, nroTransferencia, req, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error interno';
            }
            await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
            const transferencia = await this.lowdbService.find({ nroTransferencia: Number(nroTransferencia) }, 'transferencias');
            const cbuShort = transferencia.cbuDestinatario.slice(0, 3);
            await this.lowdbService.initDatabase('./src/modules/configuracion-APPWEB-mock/json/bancos.json');
            const bancos = await this.lowdbService.findAll('bancos');
            const banco = bancos.find((banco) => banco.codigoBCRA.indexOf(cbuShort) > -1);
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/tipos-cuenta.json');
            const tiposCuenta = await this.lowdbService.findAll('tiposCuenta');
            const tipoCuentaDebito = tiposCuenta.find((tipoCuenta) => tipoCuenta.id.indexOf(transferencia.tipoCuentaDebitoId) > -1);
            const transfDto = this.getMapTransferencia(transferencia, banco.nombre, tipoCuentaDebito.descripcion);
            return res.status(common_1.HttpStatus.OK).json(Object.assign({ codigoResultado: '00', descripcionResultado: 'OK' }, transfDto));
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al consultar limite de cuenta',
            });
        }
    }
    getMapTransferencia(transferencia, banco, tipoCuentaDebito) {
        return {
            nroTransferencia: transferencia.nroTransferencia,
            tipoTransferencia: transferencia.tipo === 'TON' ? 'Inmediata' : 'Programada',
            fechaCarga: this.reFormatDate(transferencia.fechaCarga),
            fechaImputacion: this.reFormatDate(transferencia.fechaImputacion),
            fechaHoraEnvio: '16/10/2022 14:45',
            ordenante: 'Ordenante',
            cuitCuentaDebito: '30359964001',
            banco: banco,
            tipoCuentaDebito: tipoCuentaDebito,
            nroCuentaDebito: transferencia.numeroCuentaDebito,
            destinatario: transferencia.nombreDestinatario,
            cuitCuentaCredito: transferencia.cuitCuentaCredito,
            tipoCuentaCredito: transferencia.tipoCuenta.descripcion,
            nroCuentaCredito: transferencia.numeroCuentaCredito,
            cbuDestinatario: transferencia.cbuDestinatario,
            importe: '$ ' + transferencia.importe,
            estado: transferencia.estadoName,
            concepto: transferencia.concepto,
            referencia: transferencia.referencia,
            solicitante: 'Enzo Fernandez',
            fechaHoraConsulta: '16/10/2022 14:45',
        };
    }
    reFormatDate(fecha) {
        if (fecha) {
            const fechaAux = fecha.split('-');
            return fechaAux[2] + '/' + fechaAux[1] + '/' + fechaAux[0];
        }
        else {
            return null;
        }
    }
    extraerDatosFiltroDestinatarios(searchList) {
        const query = { destinatario: '', referencia: '' };
        query.destinatario = searchList[0].trim();
        query.referencia = searchList[1].trim();
        return query;
    }
    buscarDestinatarios(listaSearch, destinatarios) {
        if (listaSearch.length > 1) {
            const query = this.extraerDatosFiltroDestinatarios(listaSearch);
            destinatarios = destinatarios.filter((item) => Object.keys(query).every((key) => {
                return item[key].toLowerCase() === query[key].toLowerCase();
            }));
        }
        else {
            destinatarios = destinatarios.filter((dato) => {
                return (dato.referencia
                    .toString()
                    .toLowerCase()
                    .indexOf(listaSearch[0].toString().toLowerCase()) > -1 ||
                    dato.destinatario
                        .toString()
                        .toLowerCase()
                        .indexOf(listaSearch[0].toString().toLowerCase()) > -1);
            });
        }
        return destinatarios;
    }
    async getUsuario(authorization) {
        await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
        const aliasUsuarioLogueado = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(authorization);
        const usuario = await this.lowdbService.find({ alias: aliasUsuarioLogueado }, 'usuarios');
        return usuario;
    }
    async firmarTransferencia(transferencia, usuario, cuit) {
        transferencia.firmas.push(usuario.cuil);
        const cuentaEmpresa = await this.cuentaEmpresa(cuit, transferencia.numeroCuentaDebito);
        const firmaCompleta = transferencia.firmas.length === cuentaEmpresa.firmantes.length;
        transferencia.estadoCode = firmaCompleta ? 'FC' : 'FP';
        transferencia.estadoName = firmaCompleta
            ? transferencia.tipo === 'TON'
                ? 'Pendiente de envío'
                : 'Firmado'
            : 'Pendiente de firma';
        return {
            codigoResultado: '00',
            descripcionResultado: 'OK',
            nroOperacion: transferencia.nroTransferencia,
            estado: transferencia.estadoCode,
        };
    }
    async enviarTransferencia(transferencia, resultadoSeleccionado) {
        if (resultadoSeleccionado.estadoCode && resultadoSeleccionado.estadoName) {
            transferencia.estadoCode = resultadoSeleccionado.estadoCode;
            transferencia.estadoName = resultadoSeleccionado.estadoName;
        }
        return {
            codigoResultado: resultadoSeleccionado.codigoResultado,
            descripcionResultado: resultadoSeleccionado.descripcionResultado,
            nroOperacion: transferencia.nroTransferencia,
            estado: transferencia.estadoCode,
        };
    }
    async actualizarBD(key, value) {
        await this.lowdbService.initDatabase('./src/modules/transferencias-APPWEB-mock/json/transferencias.json');
        await this.lowdbService.getDb().set(key, value).write();
    }
    async cuentaEmpresa(cuit, numeroCuenta) {
        await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/cuentas-por-cuit.json');
        const empresa = await this.lowdbService.find({ cuit }, 'cuentasPorCuit');
        const cuentaEmpresa = empresa.datos.find((cuentaEmpresa) => cuentaEmpresa.nroCuenta === numeroCuenta);
        return cuentaEmpresa;
    }
    isFirmaCompleta(firmantes, firmas) {
        const completaEsquema = firmantes.every((element) => {
            return firmas.includes(element);
        });
    }
    eliminaTransferencia(req, res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    operaciones: [],
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al intentar eliminar las transferencias',
                });
                break;
        }
    }
};
__decorate([
    (0, common_1.Post)('/transferencia'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "cargaTransferenciaIndividual", null);
__decorate([
    (0, common_1.Post)('/transferencia/firma'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "transferenciaFirma", null);
__decorate([
    (0, common_1.Post)('/transferencia/envio'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "transferenciaEnvio", null);
__decorate([
    (0, common_1.Post)('/agenda/destinatarios'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "obtieneConsultaAgenda", null);
__decorate([
    (0, common_1.Post)('/descarga/comprobantes'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TransferenciasAPPWEBMockController.prototype, "getComprobantesTransacciones", null);
__decorate([
    (0, common_1.Get)('/descarga/comprobante/:transaccion'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TransferenciasAPPWEBMockController.prototype, "getUnicoComprobanteTransaccion", null);
__decorate([
    (0, common_1.Post)('/agenda/descarga'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TransferenciasAPPWEBMockController.prototype, "descargaArchivoConsultaAgenda", null);
__decorate([
    (0, common_1.Get)('/transferencia/configuracion/usuario'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "getAprobador", null);
__decorate([
    (0, common_1.Put)('/agenda/destinatario/:tipoCuenta/:cbu'),
    __param(0, (0, common_1.Param)('cbu')),
    __param(1, (0, common_1.Param)('tipoCuenta')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "modificarDestinatario", null);
__decorate([
    (0, common_1.Post)('/agenda/cuentas'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "obtieneDatosCbu", null);
__decorate([
    (0, common_1.Post)('/agenda/destinatario'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "agendarDestinatario", null);
__decorate([
    (0, common_1.Post)('/agenda/destinatario/detalle'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "getDetalleCbu", null);
__decorate([
    (0, common_1.Post)('/agenda/destinatario/detalle/descarga'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "descargaDetalleDestinatario", null);
__decorate([
    (0, common_1.Post)('/agenda/cbu/destinatarios'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "getAgendaDestinatarios", null);
__decorate([
    (0, common_1.Post)('/agenda/destinatario/baja'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TransferenciasAPPWEBMockController.prototype, "eliminarDestinatario", null);
__decorate([
    (0, common_1.Post)('/agenda/destinatario/aprobacion'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "aprobarDestinatariosAgenda", null);
__decorate([
    (0, common_1.Post)('/transferencias'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "consultaTransferencias", null);
__decorate([
    (0, common_1.Put)('/transferencia/:nroTran'),
    __param(0, (0, common_1.Param)('nroTran')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "modificarTransferenciaTOFF", null);
__decorate([
    (0, common_1.Post)('/transferencia/firmantes'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "getFirmantesDetalleTransferencia", null);
__decorate([
    (0, common_1.Get)('/transferencias/limite'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "obtenerLimitesTransferencias", null);
__decorate([
    (0, common_1.Get)('transferencias/configuracion'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TransferenciasAPPWEBMockController.prototype, "getConfiguracion", null);
__decorate([
    (0, common_1.Get)('/transferencia/:transaccion/comprobante'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Param)('transaccion')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasAPPWEBMockController.prototype, "obtenerComprobanteTransferencias", null);
__decorate([
    (0, common_1.Post)('/transferencia/eliminar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TransferenciasAPPWEBMockController.prototype, "eliminaTransferencia", null);
TransferenciasAPPWEBMockController = __decorate([
    (0, common_1.Controller)('transferencias-APPWEB/rest-api'),
    __metadata("design:paramtypes", [lowdb_service_1.LowdbService])
], TransferenciasAPPWEBMockController);
exports.TransferenciasAPPWEBMockController = TransferenciasAPPWEBMockController;
//# sourceMappingURL=transferencias-APPWEB-mock.controller.js.map