const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')
const { getDestination } = require('@sap-cloud-sdk/connectivity')

module.exports = function odataProxyDestination(destinationName) {

    if (!destinationName) {
        throw new Error('destinationName é obrigatório')
    }

    return async function (req, res) {
        const authHeader = req.headers.authorization
        const jwt = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
        const isBatch = req.originalUrl.endsWith('/$batch')
        try {
            // const destination = await getDestinationCache(); 
            const response = await executeHttpRequest({ destinationName, jwt },
                {
                    method: req.method,
                    url: req.originalUrl,
                    //   headers: req.headers,
                    headers: {
                         'content-type': req.headers['content-type'],
                        'accept': req.headers['accept'],
                        'dataserviceversion': req.headers['dataserviceversion'],
                        'maxdataserviceversion': req.headers['maxdataserviceversion']
                    },

                    // 🔥 BODY RAW
                    data: isBatch ? req.body : undefined
                },
                { fetchCsrfToken: false }
            )

            const status = Number.isInteger(response.status) && response.status >= 100 ? response.status : 200

            res.status(status)

            Object.entries(response.headers || {}).forEach(([k, v]) =>
                res.setHeader(k, v)
            )
            if (req.originalUrl.endsWith('/$count')) {
                res.type('text/plain')
                return res.send(String(response.data))
            }
            res.send(response.data)

        } catch (err) {
            console.error(err)
            res.status(502).send('Erro no proxy OData via Destination')
        }
    }
}
