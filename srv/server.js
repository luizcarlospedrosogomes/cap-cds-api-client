const cds         = require('@sap/cds')
const Sdk         = require('@dynatrace/oneagent-sdk')
const express     = require('express')
const helmet      = require('helmet')
const cors        = require('cors');
const DynaT       = Sdk.createInstance()
const cov2ap       = require('@sap/cds-odata-v2-adapter-proxy')
const requireDir  = require('require-dir');
const cds_swagger = require ('cds-swagger-ui-express')
const passport    = require("passport");
const { XssecPassportStrategy, XsuaaService } = require("@sap/xssec");
const { getServices, loadEnv } = require('@sap/xsenv');
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
    
    cds.emit ('bootstrap', app)              //> before bootstrapping
    app.baseDir       = o.baseDir
    o.app             = app        
    o.app.httpServer  = await cds.server(o)  
    
    return o.app.httpServer
}  