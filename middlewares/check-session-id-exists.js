"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSessionIdExists = checkSessionIdExists;
async function checkSessionIdExists(request, response) {
    let sessionId = request.cookies.sessionId;
    if (!sessionId) {
        return response.status(401).send({
            error: 'Unauthorized'
        });
    }
}
