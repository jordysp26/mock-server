import { ConfiguracionAPPWEBMockModule } from './modules/configuracion-APPWEB-mock/configuracion-APPWEB-mock.module';
import { CuentasAPPWEBMockModule } from './modules/cuentas-APPWEB-mock/cuentas-APPWEB-mock.module';
import { FirmasAPPWEBMockModule } from './modules/firmas-APPWEB-mock/firmas-APPWEB-mock.module';
import { SfaAPPWEBMockModule } from './modules/sfa-APPWEB-mock/sfa-APPWEB-mock.module';
import { TransferenciasAPPWEBMockModule } from './modules/transferencias-APPWEB-mock/transferencias-APPWEB-mock.module';
import { UsuariosAPPWEBMockModule } from './modules/usuarios-APPWEB-mock/usuarios-APPWEB-mock.module';

export const moduleMocks = [
  ConfiguracionAPPWEBMockModule,
  CuentasAPPWEBMockModule,
  SfaAPPWEBMockModule,
  TransferenciasAPPWEBMockModule,
  UsuariosAPPWEBMockModule,
  FirmasAPPWEBMockModule,
];
