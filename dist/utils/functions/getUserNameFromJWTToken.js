"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserNameFromJWTToken = void 0;
function getUserNameFromJWTToken(token) {
    return token.split(' ')[1].split('-')[0].toLowerCase();
}
exports.getUserNameFromJWTToken = getUserNameFromJWTToken;
//# sourceMappingURL=getUserNameFromJWTToken.js.map