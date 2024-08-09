"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionAPPWEBMockModule = void 0;
const common_1 = require("@nestjs/common");
const configuracion_APPWEB_mock_controller_1 = require("./configuracion-APPWEB-mock.controller");
const lowdb_service_1 = require("../../lowdb/lowdb.service");
let ConfiguracionAPPWEBMockModule = class ConfiguracionAPPWEBMockModule {
};
ConfiguracionAPPWEBMockModule = __decorate([
    (0, common_1.Module)({
        controllers: [configuracion_APPWEB_mock_controller_1.ConfiguracionAPPWEBMockController],
        providers: [lowdb_service_1.LowdbService],
    })
], ConfiguracionAPPWEBMockModule);
exports.ConfiguracionAPPWEBMockModule = ConfiguracionAPPWEBMockModule;
//# sourceMappingURL=configuracion-APPWEB-mock.module.js.map