const cds         = require('@sap/cds')
const express     = require('express')
const helmet      = require('helmet')
const cors        = require('cors');
const cov2ap       = require('@sap/cds-odata-v2-adapter-proxy')
const cds_swagger = require ('cds-swagger-ui-express')
const passport    = require("passport");
const { XssecPassportStrategy, XsuaaService } = require("@sap/xssec");
const { getServices, loadEnv } = require('@sap/xsenv');
const odataProxyDestination = require ('./odata-proxy');

//var bodyParser = require('body-parser')
global.__base     = __dirname + "/"

process.on('uncaughtException', function (err) {
    console.error(err.name + ': ' + err.message, err.stack.replace(/.*\n/, '\n')) // eslint-disable-line
})
  
//cds.on('bootstrap', app => app.use(proxy({path: 'v2', port: process.env.PORT || 4004 })))
cds.on("bootstrap", (app) => app.use(cov2ap()));
/**
 * Security middleware
 */
if(process.env.NODE_ENV !== 'test'){
  loadEnv();
  let { xsuaa } = getServices({ xsuaa: { tag: 'xsuaa' } });
  const authService = new XsuaaService(xsuaa) // or: IdentityService, XsaService, UaaService ...
  passport.use(new XssecPassportStrategy(authService));

}
// delegate to default server.js:
module.exports = async (o) => {
    o.port      = process.env.PORT || 4004    
    const app = cds.app = o.app || express()     
    app.use(helmet());
    app.use(cors());
    app.use(cds_swagger({    
      "basePath": "/$api-docs", // the root path to mount the middleware on
      "diagram": true, // whether to render the YUML diagram
      
    }))
    app.use(passport.initialize());
    app.use(passport.authenticate('JWT', { session: false }));
    
    app.use(require('express-status-monitor')())    
    app.use('/sap/opu/odata', odataProxyDestination(process.env.API_MIDDLEWARE_DESTINATION || 'middleware-api-destination'))
    cds.emit ('bootstrap', app)              //> before bootstrapping
    app.baseDir       = o.baseDir
    o.app             = app        
    o.app.httpServer  = await cds.server(o)  
    
    return o.app.httpServer
}  