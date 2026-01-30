const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')
const { getDestination } = require('@sap-cloud-sdk/connectivity')

module.exports = function odataProxyDestination(destinationName) {

    if (!destinationName) {
        throw new Error('destinationName é obrigatório')
    }
 
    return async function (req, res) {
        const authHeader = req.headers.authorization
        const jwt = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
        try {
            // const destination = await getDestinationCache(); 
            const response = await executeHttpRequest({ destinationName, jwt },
                {
                    method: req.method,
                    url: req.originalUrl,
                    //   headers: req.headers,
                    //   data: req.body
                },
                { fetchCsrfToken: false }
            )

            res.status(response.status)

            Object.entries(response.headers || {}).forEach(([k, v]) =>
                res.setHeader(k, v)
            )

            res.send(response.data)

        } catch (err) {
            console.error(err)
            res.status(502).send('Erro no proxy OData via Destination')
        }
    }
}
