import cds from '@sap/cds';
import { Service, Request } from "@sap/cds";


module.exports = (services: Service) => {
    services.on("checkService", async (req: any) => {
        const { data } = req
        const { serviceName, top } = data
        try {
            const middlewareApi = await cds.connect.to('middleware-api');
            const tx = middlewareApi.tx(req.query)
            return await tx.send({path: `${serviceName}?$top=${top}`, method: 'GET'});
        } catch (error: any) {
            console.error(error);
            return req.reject(error.response.status, error.message);
        }
    })
}
