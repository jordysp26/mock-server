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
exports.CuentasAPPWEBMockController = void 0;
const common_1 = require("@nestjs/common");
const lowdb_service_1 = require("../../lowdb/lowdb.service");
const fechas_1 = require("../../utils/functions/fechas");
const formatNumber_1 = require("../../utils/functions/formatNumber");
const getUserNameFromJWTToken_1 = require("../../utils/functions/getUserNameFromJWTToken");
let CuentasAPPWEBMockController = class CuentasAPPWEBMockController {
    constructor(lowdbService) {
        this.lowdbService = lowdbService;
    }
    async initMovimientosConformados() {
        try {
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/movimientos-conformados.json');
            const movimientos = await this.lowdbService.findAll('movimientosConformados');
            movimientos.forEach((movimiento) => {
                movimiento.datos.forEach((item) => {
                    item.fecha = (0, fechas_1.randomDate)();
                });
            });
            await this.lowdbService
                .getDb()
                .set('movimientosConformados', movimientos)
                .write();
        }
        catch (error) {
            console.log('error al actualizar fechas: ', error);
        }
    }
    async initMovimientosPendientes() {
        try {
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/movimientos-pendientes.json');
            const movimientos = await this.lowdbService.findAll('movimientosPendientes');
            movimientos.forEach((movimiento) => {
                movimiento.datos.forEach((item) => {
                    item.fechaMov = (0, fechas_1.randomDate)();
                });
            });
            await this.lowdbService
                .getDb()
                .set('movimientosPendientes', movimientos)
                .write();
        }
        catch (error) {
            console.log('error al actualizar fechas: ', error);
        }
    }
    async initSaldosHistoricos() {
        try {
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/saldos-historicos.json');
            const saldosHistoricos = await this.lowdbService.findAll('saldosHistoricos');
            saldosHistoricos.forEach((saldoHistorico) => {
                saldoHistorico.saldos.forEach((item) => {
                    item.fecha = (0, fechas_1.randomDate)();
                });
            });
            await this.lowdbService
                .getDb()
                .set('saldosHistoricos', saldosHistoricos)
                .write();
        }
        catch (error) {
            console.log('error al actualizar fechas: ', error);
        }
    }
    async addFieldToObjectJson(field, module, entity) {
        try {
            await this.lowdbService.initDatabase(`./src/modules/${module}-APPWEB-mock/json/${entity}.json`);
            const cuentas = await this.lowdbService.findAll('cuentasPorCuit');
            cuentas.forEach((cuenta) => {
                cuenta.datos.forEach((item) => {
                    item[field] = true;
                });
            });
            await this.lowdbService.getDb().set('cuentasPorCuit', cuentas).write();
        }
        catch (error) {
            console.log('error al agregar campo adicional: ', error);
        }
    }
    async getCuentas(headers, req, res) {
        const typeResponse = 0;
        const pageNumber = parseInt(req.query.pageNumber.toString()) + 1;
        const records = parseInt(req.query.records.toString());
        const cuit = headers.cuit;
        const body = req.body;
        const error34 = {
            status: 406,
            codigoResultado: '34',
            descripcionResultado: 'Error al cargar cuentas',
        };
        const error40 = {
            status: 406,
            codigoResultado: '40',
            descripcionResultado: 'No se han obtenido cuentas',
        };
        try {
            if (typeResponse >= 2) {
                throw error34;
            }
            if (typeResponse >= 1) {
                throw error40;
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/cuentas-por-cuit.json');
            const cuentasPorCuit = await this.lowdbService.find({ cuit }, 'cuentasPorCuit');
            if (body.numero && body.referencia) {
                let query = null;
                query = this.extraerDatosFiltro(body);
                cuentasPorCuit.datos = cuentasPorCuit.datos.filter((item) => Object.keys(query).every((key) => {
                    if (item[key]) {
                        return (item[key].toLowerCase().indexOf(query[key].toLowerCase()) > -1);
                    }
                }));
            }
            if (cuentasPorCuit.datos.length) {
                const cantidadTotal = cuentasPorCuit.datos.length;
                const cantidadPaginas = Math.ceil(cantidadTotal / records);
                const cuentasPorCuitFiltrados = cuentasPorCuit.datos.slice(records * (pageNumber - 1), records * pageNumber);
                await this.lowdbService.initDatabase('./src/modules/usuarios-APPWEB-mock/json/usuarios.json');
                const aliasUsuarioLogueado = (0, getUserNameFromJWTToken_1.getUserNameFromJWTToken)(headers.authorization);
                const usuario = await this.lowdbService.find({ alias: aliasUsuarioLogueado }, 'usuarios');
                cuentasPorCuitFiltrados.forEach((cuenta) => {
                    cuenta.enviador = cuenta.enviadores.includes(usuario.cuil);
                });
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    paginasTotales: cantidadPaginas,
                    cuentas: cuentasPorCuitFiltrados.map((data) => {
                        const { puedeTransferir, limite, enviadores, firmantes } = data, datosCuenta = __rest(data, ["puedeTransferir", "limite", "enviadores", "firmantes"]);
                        return datosCuenta;
                    }),
                });
            }
            else {
                throw error40;
            }
        }
        catch (error) {
            res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    extraerDatosFiltro(body) {
        let searchListaNumero = null;
        let searchListaReferencia = null;
        let searchList = null;
        let numero = null;
        let referencia = null;
        if (body.numero.includes('-')) {
            searchListaNumero = body.numero.toString().split('-');
        }
        else {
            searchListaNumero = [body.numero];
        }
        if (body.referencia.includes('-')) {
            searchListaReferencia = body.referencia.toString().split('-');
        }
        else {
            searchListaReferencia = [body.referencia];
        }
        searchList = [...searchListaNumero, ...searchListaReferencia];
        searchList = searchList
            .filter((item, index) => {
            if (searchList.indexOf(item) == index) {
                return item;
            }
        })
            .map((item) => {
            return item.trim();
        });
        const regex = /^[0-9]*$/;
        searchList.forEach((item) => {
            if (regex.test(item)) {
                numero = item;
            }
            else {
                referencia = item;
            }
        });
        const query = { nroCuenta: '', referencia: '' };
        if (numero) {
            query.nroCuenta = numero;
        }
        else {
            delete query.nroCuenta;
        }
        if (referencia) {
            query.referencia = referencia;
        }
        else {
            delete query.referencia;
        }
        return query;
    }
    async obtenerMovimientosConformados(headers, req, res) {
        const nroCuenta = req.body.nroCuenta;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '29',
                    descripcionResultado: 'Error. Descargue el archivo.',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/movimientos-conformados.json');
            const cuit = headers.cuit;
            const proximo = parseInt(req.body.proximo) + 1;
            const records = 20;
            const movimientos = await this.lowdbService.find({ cuit, nroCuenta }, 'movimientosConformados');
            if (!movimientos) {
                throw {
                    status: 406,
                    codigoResultado: '31',
                    descripcionResultado: 'No se han obtenido movimientos',
                };
            }
            if (req.body.fechaDesde && req.body.fechaHasta) {
                const fechaDesdeDate = new Date(req.body.fechaDesde);
                const fechaHastaDate = new Date(req.body.fechaHasta);
                movimientos.datos = movimientos.datos.filter((movimiento) => {
                    const fecha = new Date(movimiento.fecha);
                    return fecha >= fechaDesdeDate && fecha <= fechaHastaDate;
                });
            }
            if (req.body.tipoMovimiento !== 'TODOS') {
                let tipoMovimiento;
                if (req.body.tipoMovimiento === 'DEBITO') {
                    tipoMovimiento = 'D';
                }
                else if (req.body.tipoMovimiento === 'CREDITO') {
                    tipoMovimiento = 'C';
                }
                movimientos.datos = movimientos.datos.filter((movimiento) => {
                    return movimiento.tipoMovimiento === tipoMovimiento;
                });
            }
            if (req.body.importeMin || req.body.importeMax) {
                const importeMin = req.body.importeMin ? req.body.importeMin : '0';
                const importeMax = req.body.importeMax
                    ? req.body.importeMax
                    : '99999999999999';
                movimientos.datos = movimientos.datos.filter((movimiento) => {
                    return (Math.abs((0, formatNumber_1.formatNumber)(movimiento.importe)) >=
                        (0, formatNumber_1.formatNumber)(importeMin) &&
                        Math.abs((0, formatNumber_1.formatNumber)(movimiento.importe)) <=
                            (0, formatNumber_1.formatNumber)(importeMax));
                });
            }
            const longitudTotal = movimientos.datos.length;
            if (movimientos.datos.length) {
                movimientos.datos = movimientos.datos.slice(records * (proximo - 1), records * proximo);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    proximo: proximo.toString(),
                    masRegistros: longitudTotal > records * proximo ? true : false,
                    movimientos: movimientos.datos,
                    servicioActual: 'mock',
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '31',
                    descripcionResultado: 'No se han obtenido movimientos',
                };
            }
        }
        catch (error) {
            res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async obtenerMovimientosDiferidos(headers, req, res) {
        const pageNumber = parseInt(req.query.pageNumber.toString()) + 1;
        const cuentaNro = req.body.cuentaNro;
        const cuit = headers.cuit;
        const records = 10;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al buscar movimientos pendientes',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/movimientos-pendientes.json');
            const movimientos = await this.lowdbService.find({ cuentaNro, cuit }, 'movimientosPendientes');
            if (!movimientos) {
                throw {
                    status: 406,
                    codigoResultado: '31',
                    descripcionResultado: 'No se han obtenido movimientos',
                };
            }
            if (req.body.fechaDesde && req.body.fechaHasta) {
                const fechaDesdeDate = new Date(req.body.fechaDesde);
                const fechaHastaDate = new Date(req.body.fechaHasta);
                movimientos.datos = movimientos.datos.filter((movimiento) => {
                    const fecha = new Date(movimiento.fechaMov);
                    return fecha >= fechaDesdeDate && fecha <= fechaHastaDate;
                });
            }
            if (req.body.tipoMovimiento !== 'TODOS') {
                let tipoMovimiento;
                if (req.body.tipoMovimiento === 'DEBITO') {
                    tipoMovimiento = 'D';
                }
                else if (req.body.tipoMovimiento === 'CREDITO') {
                    tipoMovimiento = 'C';
                }
                movimientos.datos = movimientos.datos.filter((movimiento) => {
                    return movimiento.debitoCredito === tipoMovimiento;
                });
            }
            if (req.body.importeDesde || req.body.importeHasta) {
                const importeDesde = req.body.importeDesde
                    ? req.body.importeDesde
                    : '0';
                const importeHasta = req.body.importeHasta
                    ? req.body.importeHasta
                    : '99999999999999';
                movimientos.datos = movimientos.datos.filter((movimiento) => {
                    return (Math.abs(movimiento.monto) >= (0, formatNumber_1.formatNumber)(importeDesde) &&
                        Math.abs(movimiento.monto) <= (0, formatNumber_1.formatNumber)(importeHasta));
                });
            }
            const cantidadTotal = movimientos.datos.length;
            const cantidadPaginas = Math.ceil(cantidadTotal / records);
            if (movimientos.datos.length) {
                movimientos.datos = movimientos.datos.slice(records * (pageNumber - 1), records * pageNumber);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    movimientosPendientes: movimientos.datos,
                    paginasTotales: cantidadPaginas,
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '31',
                    descripcionResultado: 'No se han obtenido movimientos',
                };
            }
        }
        catch (error) {
            res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    descargaArchivoMovimientos(req, res) {
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
    descargaArchivoPendientes(req, res) {
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
    descargaDetalleMovimientos(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '01',
                    descripcionResultado: 'OK',
                    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '00',
                    descripcionResultado: 'Error al obtener movimientos',
                });
                break;
        }
    }
    descargaDetalleMovimientosPendientes(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '01',
                    descripcionResultado: 'OK',
                    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                });
                break;
            case 1:
                res.status(406).json({
                    codigoResultado: '00',
                    descripcionResultado: 'Error al obtener movimientos',
                });
                break;
        }
    }
    async getCuentasForConsultaSaldos(headers, req, res) {
        const cuit = headers.cuit;
        const records = 10;
        const pageNumber = parseInt(req.query.pageNumber.toString()) + 1;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al buscar cuentas para saldos saldos del dia',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/saldos-del-dia.json');
            const saldos = await this.lowdbService.find({
                cuit,
            }, 'saldosDelDia');
            if (saldos) {
                const cantidadTotal = saldos.cuentas.length;
                const cantidadPaginas = Math.ceil(cantidadTotal / records);
                saldos.cuentas = saldos.cuentas.slice(records * (pageNumber - 1), records * pageNumber);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '200',
                    descripcionResultado: 'OK',
                    saldos: saldos.cuentas,
                    paginasTotales: cantidadPaginas,
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '34',
                    descripcionResultado: 'No se obtuvieron cuentas para saldos del dia',
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
    async consultaSaldosDia(headers, req, res) {
        const typeResponse = 0;
        const cuit = headers.cuit;
        const searchByCuentas = req.body.cuentas;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/saldos-actuales.json');
            const saldosActuales = await this.lowdbService.find({ cuit }, 'saldosActuales');
            if (!saldosActuales) {
                throw 'error';
            }
            saldosActuales.saldos = saldosActuales.saldos.filter((saldo) => {
                const res = searchByCuentas.find((cuenta) => {
                    return (saldo.cuenta.tipoCuentaId === cuenta.tipoCuentaId &&
                        saldo.cuenta.numeroCuenta === cuenta.numeroCuenta);
                });
                return res !== undefined;
            });
            if (saldosActuales.saldos) {
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '200',
                    descripcionResultado: 'ok',
                    saldos: saldosActuales.saldos,
                });
            }
            else {
                throw 'error';
            }
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener saldo de las cuenta',
            });
        }
    }
    descargaArchivoSaldosDelDia(req, res) {
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
    async consultaSaldosHistoricosDia(headers, req, res) {
        const cuit = headers.cuit;
        const records = parseInt(req.query.records.toString());
        const pageNumber = parseInt(req.query.pageNumber.toString()) + 1;
        const typeResponse = 0;
        try {
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/saldos-historicos.json');
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al buscar cuentas para saldos saldos del dia',
                };
            }
            const saldosHistoricos = await this.lowdbService.find({ cuit }, 'saldosHistoricos');
            if (!saldosHistoricos) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al buscar cuentas para saldos saldos del dia',
                };
            }
            if (req.body.fecha) {
                const fechaParam = new Date(req.body.fecha);
                saldosHistoricos.saldos = saldosHistoricos.saldos.filter((saldo) => {
                    const fecha = new Date(saldo.fecha);
                    return fecha.toString() === fechaParam.toString();
                });
            }
            const query = this.extraerDatosFiltro(req.body);
            saldosHistoricos.saldos = saldosHistoricos.saldos.filter((item) => Object.keys(query).every((key) => {
                if (item.cuenta[key]) {
                    return (item.cuenta[key].toLowerCase().indexOf(query[key].toLowerCase()) >
                        -1);
                }
            }));
            if (req.body.tiposCuenta) {
                saldosHistoricos.saldos = saldosHistoricos.saldos.filter((saldo) => {
                    return req.body.tiposCuenta.includes(parseInt(saldo.cuenta.tipoCuenta.id));
                });
            }
            if (saldosHistoricos.saldos.length > 0) {
                const cantidadTotal = saldosHistoricos.saldos.length;
                const cantidadPaginas = Math.ceil(cantidadTotal / records);
                saldosHistoricos.saldos = saldosHistoricos.saldos.slice(records * (pageNumber - 1), records * pageNumber);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '200',
                    descripcionResultado: 'OK',
                    saldos: saldosHistoricos.saldos,
                    paginasTotales: cantidadPaginas,
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '40',
                    descripcionResultado: 'No se encontraron saldos para los filtros aplicados',
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
    descargaArchivoSaldosHistoricosPorDia(req, res) {
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
    async consultaSaldosHistoriosPorPeriodo(headers, req, res) {
        const cuit = headers.cuit;
        const records = parseInt(req.query.records.toString());
        const pageNumber = parseInt(req.query.pageNumber.toString()) + 1;
        const cuentaSearch = req.body.cuenta;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/saldos-historicos.json');
            const saldosHistoricos = await this.lowdbService.find({ cuit }, 'saldosHistoricos');
            if (!saldosHistoricos) {
                throw 'error';
            }
            if (cuentaSearch.numeroCuenta && cuentaSearch.tipoCuentaId) {
                saldosHistoricos.saldos = saldosHistoricos.saldos.filter(({ cuenta }) => {
                    return (cuenta.nroCuenta.indexOf(cuentaSearch.numeroCuenta) > -1 &&
                        cuenta.tipoCuenta.id.indexOf(cuentaSearch.tipoCuentaId) > -1);
                });
            }
            if (req.body.fechaDesde && req.body.fechaHasta) {
                const fechaDesdeDate = new Date(req.body.fechaDesde);
                const fechaHastaDate = new Date(req.body.fechaHasta);
                saldosHistoricos.saldos = saldosHistoricos.saldos.filter(({ fecha }) => {
                    const fechaSearch = new Date(fecha);
                    return (fechaSearch >= fechaDesdeDate && fechaSearch <= fechaHastaDate);
                });
            }
            const cantidadTotal = saldosHistoricos.saldos.length;
            const cantidadPaginas = Math.ceil(cantidadTotal / records);
            saldosHistoricos.saldos = saldosHistoricos.saldos.slice(records * (pageNumber - 1), records * pageNumber);
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '200',
                descripcionResultado: 'OK',
                saldos: saldosHistoricos.saldos.map((saldo) => {
                    return { saldo: saldo.saldo, fecha: saldo.fecha };
                }),
                paginasTotales: cantidadPaginas,
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al obtener saldos historicos por periodo',
            });
        }
    }
    descargaArchivoSaldosHistoricosPorPeriodo(req, res) {
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
    async getCuentasTiposPorUsuario(headers, res) {
        const cuit = headers.cuit;
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '34',
                    descripcionResultado: 'Error al cargar tipos de cuentas del usuario',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/cuentas-por-cuit.json');
            const cuentasPorCuit = await this.lowdbService.find({ cuit }, 'cuentasPorCuit');
            const tiposDeCuenta = [];
            cuentasPorCuit.datos.forEach((element) => {
                tiposDeCuenta.push(element.tipoCuenta);
            });
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                tiposCuenta: tiposDeCuenta,
            });
        }
        catch (error) {
            res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async getCuentasTipos(res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/tipos-cuenta.json');
            const tiposCuenta = await this.lowdbService.findAll('tiposCuenta');
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '00',
                descripcionResultado: 'OK',
                tiposCuenta,
            });
        }
        catch (error) {
            res.status(406).json({
                codigoResultado: '34',
                descripcionResultado: 'Error al obtener todos los tipos de cuentas',
            });
        }
    }
    async getConsultaSaldosProyectados(headers, req, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '99',
                    descripcionResultado: 'Error al cargar saldos proyectados',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/saldos-proyectados.json');
            const cuit = headers.cuit;
            const pageNumber = parseInt(req.query.pageNumber.toString()) + 1;
            const records = parseInt(req.query.records.toString());
            const body = req.body;
            const saldosProyectados = await this.lowdbService.find({ cuit }, 'saldosProyectados');
            const query = this.extraerDatosFiltro(body);
            saldosProyectados.cuentas = saldosProyectados.cuentas.filter((item) => Object.keys(query).every((key) => {
                if (item.cuenta[key]) {
                    return (item.cuenta[key].toLowerCase().indexOf(query[key].toLowerCase()) >
                        -1);
                }
            }));
            if (body.tiposCuenta.length > 0) {
                const tiposCuenta = body.tiposCuenta;
                saldosProyectados.cuentas = saldosProyectados.cuentas.filter(({ cuenta }) => {
                    return tiposCuenta.includes(parseInt(cuenta.tipoCuenta.id));
                });
            }
            if (saldosProyectados.cuentas.length) {
                const cantidadTotal = saldosProyectados.cuentas.length;
                const cantidadPaginas = Math.ceil(cantidadTotal / records);
                const saldosProyectadosFiltrados = saldosProyectados.cuentas.slice(records * (pageNumber - 1), records * pageNumber);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '200',
                    descripcionResultado: 'ok',
                    saldosProyectados: saldosProyectadosFiltrados,
                    paginasTotales: cantidadPaginas,
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '40',
                    descripcionResultado: 'No se encontraron saldos para los filtros aplicados',
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
    descargaArchivoSaldosProyectados(req, res) {
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
    async getConsultaSaldosTotales(headers, req, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/saldos-proyectados.json');
            const cuit = headers.cuit;
            const body = req.body;
            const saldosProyectados = await this.lowdbService.find({ cuit }, 'saldosProyectados');
            const query = this.extraerDatosFiltro(body);
            saldosProyectados.cuentas = saldosProyectados.cuentas.filter((item) => Object.keys(query).every((key) => {
                if (item.cuenta[key]) {
                    return (item.cuenta[key].toLowerCase().indexOf(query[key].toLowerCase()) >
                        -1);
                }
            }));
            if (body.tiposCuenta && body.tiposCuenta.length > 0) {
                const tiposCuenta = body.tiposCuenta;
                saldosProyectados.cuentas = saldosProyectados.cuentas.filter(({ cuenta }) => {
                    return tiposCuenta.includes(parseInt(cuenta.tipoCuenta.id));
                });
            }
            const totalesPesos = {
                saldo: 0,
                hoy: 0,
                a24: 0,
                a48: 0,
                noDisponible: false,
            };
            const totalesDolares = {
                saldo: 0,
                hoy: 0,
                a24: 0,
                a48: 0,
                noDisponible: false,
            };
            saldosProyectados.cuentas.forEach(({ cuenta, saldo, hoy, a24, a48 }) => {
                if (cuenta.tipoCuenta.moneda.id === 0) {
                    if (saldo === null || hoy === null || a24 === null || a48 === null) {
                        totalesPesos.noDisponible = true;
                    }
                    totalesPesos.saldo += saldo;
                    totalesPesos.hoy += hoy;
                    totalesPesos.a24 += a24;
                    totalesPesos.a48 += a48;
                }
                else if (cuenta.tipoCuenta.moneda.id === 1) {
                    if (saldo === null || hoy === null || a24 === null || a48 === null) {
                        totalesDolares.noDisponible = true;
                    }
                    totalesDolares.saldo += saldo;
                    totalesDolares.hoy += hoy;
                    totalesDolares.a24 += a24;
                    totalesDolares.a48 += a48;
                }
            });
            totalesPesos.noDisponible = this.sumarSaldos(totalesPesos) === 0;
            totalesDolares.noDisponible = this.sumarSaldos(totalesDolares) === 0;
            return res.status(common_1.HttpStatus.OK).json({
                codigoResultado: '200',
                descripcionResultado: 'ok',
                totalesPesos,
                totalesDolares,
            });
        }
        catch (error) {
            return res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error al calcular saldos proyectados',
            });
        }
    }
    sumarSaldos(totales) {
        return totales.saldo + totales.hoy + totales.a24 + totales.a48;
    }
    getConsultaSaldosConfiguracion(res) {
        const typeResponse = 0;
        switch (typeResponse) {
            case 0:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '200',
                    descripcionResultado: 'ok',
                    muestraAcuerdo: true,
                });
                break;
            case 1:
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '200',
                    descripcionResultado: 'ok',
                    muestraAcuerdo: false,
                });
                break;
            case 2:
                res.status(406).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error al obtener configuracion para mostrar acuerdo',
                });
                break;
        }
    }
    async getCuentasPropias(headers, req, res) {
        const typeResponse = 0;
        const pageNumber = parseInt(req.query.pageNumber.toString()) + 1;
        const records = parseInt(req.query.records.toString());
        const cuit = headers.cuit;
        const body = req.body;
        try {
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '34',
                    descripcionResultado: 'Error al cargar cuentas',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/cuentas-por-cuit.json');
            const cuentasPorCuit = await this.lowdbService.find({ cuit }, 'cuentasPorCuit');
            if (body.numero && body.referencia) {
                let query = null;
                query = this.extraerDatosFiltro(body);
                cuentasPorCuit.datos = cuentasPorCuit.datos.filter((item) => Object.keys(query).every((key) => {
                    if (item[key]) {
                        return (item[key].toLowerCase().indexOf(query[key].toLowerCase()) > -1);
                    }
                }));
            }
            if (cuentasPorCuit.datos.length) {
                const cantidadTotal = cuentasPorCuit.datos.length;
                const cantidadPaginas = Math.ceil(cantidadTotal / records);
                const cuentasPorCuitFiltrados = cuentasPorCuit.datos.slice(records * (pageNumber - 1), records * pageNumber);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    paginasTotales: cantidadPaginas,
                    cuentas: cuentasPorCuitFiltrados.map((datosCuentas) => {
                        const datos = __rest(datosCuentas, []);
                        return datos;
                    }),
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '03',
                    descripcionResultado: 'No se han obtenido cuentas',
                };
            }
        }
        catch (error) {
            res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    async getCuentasDebitos(headers, req, res) {
        const typeResponse = 0;
        const pageNumber = parseInt(req.query.pageNumber.toString()) + 1;
        const records = parseInt(req.query.records.toString());
        const moneda = parseInt(req.query.moneda.toString());
        const search = req.query.search.toString();
        try {
            if (typeResponse > 0) {
                throw {
                    status: 406,
                    codigoResultado: '34',
                    descripcionResultado: 'Error al cargar cuentas para transaccionar',
                };
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/cuentas-debito.json');
            let cuentasDebito = await this.lowdbService.findAll('cuentasDebito');
            if (search) {
                const query = this.extraerDatosFiltroTransf(search);
                cuentasDebito = cuentasDebito.filter((item) => Object.keys(query).every((key) => {
                    if (item[key]) {
                        return (item[key].toLowerCase().indexOf(query[key].toLowerCase()) >
                            -1 && item.tipoCuenta.moneda.id === moneda);
                    }
                }));
            }
            else {
                cuentasDebito = cuentasDebito.filter((item) => {
                    return item.tipoCuenta.moneda.id === moneda;
                });
            }
            if (cuentasDebito.length) {
                const cantidadTotal = cuentasDebito.length;
                const cantidadPaginas = Math.ceil(cantidadTotal / records);
                const cuentasDebitoFiltrados = cuentasDebito.slice(records * (pageNumber - 1), records * pageNumber);
                return res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    paginasTotales: cantidadPaginas,
                    cuentas: cuentasDebitoFiltrados,
                });
            }
            else {
                throw {
                    status: 406,
                    codigoResultado: '40',
                    descripcionResultado: 'No se han obtenido cuentas para transaccionar',
                };
            }
        }
        catch (error) {
            res.status(error.status).json({
                codigoResultado: error.codigoResultado,
                descripcionResultado: error.descripcionResultado,
            });
        }
    }
    extraerDatosFiltroTransf(search) {
        let searchListaNumero = null;
        let searchListaReferencia = null;
        let searchList = null;
        let numero = null;
        let referencia = null;
        if (search.includes('-')) {
            searchListaNumero = search.toString().split('-');
        }
        else {
            searchListaNumero = [search];
        }
        if (search.includes('-')) {
            searchListaReferencia = search.toString().split('-');
        }
        else {
            searchListaReferencia = [search];
        }
        searchList = [...searchListaNumero, ...searchListaReferencia];
        searchList = searchList
            .filter((item, index) => {
            if (searchList.indexOf(item) == index) {
                return item;
            }
        })
            .map((item) => {
            return item.trim();
        });
        const regex = /^[0-9]*$/;
        searchList.forEach((item) => {
            if (regex.test(item)) {
                numero = item;
            }
            else {
                referencia = item;
            }
        });
        const query = { nroCuenta: '', referencia: '' };
        if (numero) {
            query.nroCuenta = numero;
        }
        else {
            delete query.nroCuenta;
        }
        if (referencia) {
            query.referencia = referencia;
        }
        else {
            delete query.referencia;
        }
        return query;
    }
    async cuentasResponsablesGet(req, res) {
        const typeResponse = 0;
        try {
            if (typeResponse > 0) {
                throw 'Error';
            }
            await this.lowdbService.initDatabase('./src/modules/cuentas-APPWEB-mock/json/responsables.json');
            const responsables = await this.lowdbService.findAll('responsables');
            if (responsables) {
                res.status(common_1.HttpStatus.OK).json({
                    codigoResultado: '00',
                    descripcionResultado: 'OK',
                    responsablesCuenta: responsables,
                });
            }
            else {
                res.status(500).json({
                    codigoResultado: '99',
                    descripcionResultado: 'Error buscar permisos del usuario',
                });
            }
        }
        catch (error) {
            res.status(406).json({
                codigoResultado: '99',
                descripcionResultado: 'Error buscar permisos del usuario',
            });
        }
    }
};
__decorate([
    (0, common_1.Post)('/cuentas'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "getCuentas", null);
__decorate([
    (0, common_1.Post)('/cuenta/movimientos'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "obtenerMovimientosConformados", null);
__decorate([
    (0, common_1.Post)('/cuenta/movimientos/pendientes'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "obtenerMovimientosDiferidos", null);
__decorate([
    (0, common_1.Post)('/cuenta/movimientos/descarga'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CuentasAPPWEBMockController.prototype, "descargaArchivoMovimientos", null);
__decorate([
    (0, common_1.Post)('/cuenta/movimientos/pendientes/descarga'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CuentasAPPWEBMockController.prototype, "descargaArchivoPendientes", null);
__decorate([
    (0, common_1.Post)('/cuenta/movimiento/detalle'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CuentasAPPWEBMockController.prototype, "descargaDetalleMovimientos", null);
__decorate([
    (0, common_1.Post)('/cuenta/movimiento/pendiente/detalle'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CuentasAPPWEBMockController.prototype, "descargaDetalleMovimientosPendientes", null);
__decorate([
    (0, common_1.Get)('/cuentas/saldos/apertura'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "getCuentasForConsultaSaldos", null);
__decorate([
    (0, common_1.Post)('/cuentas/saldos/actuales'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "consultaSaldosDia", null);
__decorate([
    (0, common_1.Post)('/cuentas/saldos/dia/descarga'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CuentasAPPWEBMockController.prototype, "descargaArchivoSaldosDelDia", null);
__decorate([
    (0, common_1.Post)('/cuentas/saldos/historicos/dia'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "consultaSaldosHistoricosDia", null);
__decorate([
    (0, common_1.Post)('cuentas/saldos/historicos/dia/descarga'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CuentasAPPWEBMockController.prototype, "descargaArchivoSaldosHistoricosPorDia", null);
__decorate([
    (0, common_1.Post)('/cuentas/saldos/historicos/periodo'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "consultaSaldosHistoriosPorPeriodo", null);
__decorate([
    (0, common_1.Post)('/cuentas/saldos/historicos/periodo/descarga'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CuentasAPPWEBMockController.prototype, "descargaArchivoSaldosHistoricosPorPeriodo", null);
__decorate([
    (0, common_1.Get)('/cuentas/usuario/tipos'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "getCuentasTiposPorUsuario", null);
__decorate([
    (0, common_1.Get)('/cuentas/tipos'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "getCuentasTipos", null);
__decorate([
    (0, common_1.Post)('/cuentas/saldos/proyectados'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "getConsultaSaldosProyectados", null);
__decorate([
    (0, common_1.Post)('/cuentas/saldos/proyectados/descarga'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CuentasAPPWEBMockController.prototype, "descargaArchivoSaldosProyectados", null);
__decorate([
    (0, common_1.Post)('/cuentas/saldos/proyectados/totales'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "getConsultaSaldosTotales", null);
__decorate([
    (0, common_1.Get)('/cuentas/saldos/configuracion'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CuentasAPPWEBMockController.prototype, "getConsultaSaldosConfiguracion", null);
__decorate([
    (0, common_1.Post)('/cuentas/transferencias'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "getCuentasPropias", null);
__decorate([
    (0, common_1.Get)('/cuentas/transaccion'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "getCuentasDebitos", null);
__decorate([
    (0, common_1.Get)('/cuentas/responsables'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CuentasAPPWEBMockController.prototype, "cuentasResponsablesGet", null);
CuentasAPPWEBMockController = __decorate([
    (0, common_1.Controller)('cuentas-APPWEB/rest-api'),
    __metadata("design:paramtypes", [lowdb_service_1.LowdbService])
], CuentasAPPWEBMockController);
exports.CuentasAPPWEBMockController = CuentasAPPWEBMockController;
//# sourceMappingURL=cuentas-APPWEB-mock.controller.js.map