import cds from '@sap/cds';
import { Service, Request } from "@sap/cds";


module.exports = (services: Service) => {
    services.on("checkService", async (req: Request) => {
        const { data } = req
        const { serviceName, top } = data
        try {
            const middlewareApi = await cds.connect.to('middleware-api');
            const tx = middlewareApi.tx(req.query)
            const results = await  tx.send({path: `${serviceName}?$top=${top}`, method: 'GET'});
            return results;
        } catch (error: any) {
            console.error(error);
            return req.reject(error.response.status, error.message);
        }
    })
}
