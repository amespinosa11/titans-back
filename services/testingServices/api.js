const express = require("express");
const router  = express.Router();
const status = require('http-status');
const testingModel = require('./model');
const TestingModel = new testingModel();

router.get("/getVersions", async (req, res) => {
    try {
        let versions = await TestingModel.getVersions();
        console.log(versions);
        res.status(status.OK).json({code: 200, data: versions});
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "Vesriones no encontradas"});
    }  
});
router.get("/getApplications", async (req, res) => {
    try {
        let applications = await TestingModel.getApplications();
        console.log(applications);
        res.status(status.OK).json({code: 200, data: applications});
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "Aplicaciones no encontradas"});
    }
});
router.get("/getToolsAvailable", async (req, res) => {
    try {
        let toolsAvailable = await TestingModel.getToolsAvailable();
        console.log(toolsAvailable);
        res.status(status.OK).json({code: 200, data: toolsAvailable});
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "Herramientas no encontradas"});
    }    
});
router.get("/getTypeOfTests", async (req, res) => {
    try {
        let typeOfTests = await TestingModel.getTypeOfTests();
        console.log(typeOfTests);
        res.status(status.OK).json({code: 200, data: typeOfTests});
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "Test no encontrados"});
    }
});
router.get("/getStrategies", async (req, res) => {
    try {
        let strategies = await TestingModel.getStrategies();
        console.log(strategies);
        res.status(status.OK).json({code: 200, data: strategies});  
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "Registros no encontrados"});
    }
});

router.get("/getBrowserMatrices/:tipo_aplicacion", async (req, res) => {
    try {
        console.log(req.params.tipo_aplicacion);
        let result = await TestingModel.getBrowserMatrices(req.params.tipo_aplicacion);
        console.log(result);
        res.status(status.OK).json({code: 200, data: result}); 
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "Registros no encontrados"});
    }
});

router.get("/getTestsAndTools/:tipo_aplicacion", async (req, res) => {
    try {
        console.log(req.params.tipo_aplicacion);
        let result = await TestingModel.getTestsAndTools(req.params.tipo_aplicacion);
        console.log(result);
        res.status(status.OK).json({code: 200, data: result});  
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "Registros no encontrados"});
    }
});

router.get("/getScriptsAvailable/:tipo_prueba/:herramienta", async (req, res) => {
    try {
        console.log(req.params.tipo_prueba);
        console.log(req.params.herramienta);
        let result = await TestingModel.getScriptsAvailable(req.params.tipo_prueba,req.params.herramienta);
        console.log(result);
        res.status(status.OK).json({code: 200, data: result}); 
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "No hay scripts disponibles"});
    }
});


router.get("/getTestState/:testId", async (req, res) => {
    try {
        console.log(req.params.testId);
        let state = await TestingModel.getTestState(req.params.testId);
        res.status(status.OK).json({code: 200, data: state});
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "Registros no encontrados"});
    }
});
router.get("/getTestResult/:testId", async (req, res) => {
    try {
        console.log(req.params.testId);
        let result = await TestingModel.getTestResult(req.params.testId);
        console.log(result);
        res.status(status.OK).json({code: 200, data: result});  
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({code: 500, error: "Registros no encontrados"});
    }  
});

router.post('/usuario', function (req, res) {
    console.log(req.body);
    res.send('POST request to homepage')
});

module.exports = router;