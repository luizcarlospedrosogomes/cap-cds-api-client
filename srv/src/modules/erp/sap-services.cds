@path: '/sap-services'
service sapService @(requires: 'authenticated-user') {
    @cds.persistence.skip
    function checkService(serviceName: String, top: Integer) returns String
}