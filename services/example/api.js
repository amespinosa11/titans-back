const express = require("express");
const router  = express.Router();
const testingModel = require('./model');
const TestingModel = new testingModel();

router.get("/getVersions", async (req, res) => {

    let versions = await TestingModel.getVersions();
    console.log(versions);
    res.send(versions)
    
});
router.get("/getApplications", async (req, res) => {

    let applications = await TestingModel.getApplications();
    console.log(applications);
    res.send(applications)
    
});
router.get("/getToolsAvailable", async (req, res) => {

    let toolsAvailable = await TestingModel.getToolsAvailable();
    console.log(toolsAvailable);
    res.send(toolsAvailable)
    
});
router.get("/getTypeOfTests", async (req, res) => {

    let typeOfTests = await TestingModel.getTypeOfTests();
    console.log(typeOfTests);
    res.send(typeOfTests)    
});
router.get("/getStrategies", async (req, res) => {

    let strategies = await TestingModel.getStrategies();
    console.log(strategies);
    res.send(strategies)    
});

router.get("/getTestState/:testId", async (req, res) => {
    
    console.log(req.params.testId);
    let state = await TestingModel.getTestState(req.params.testId);
    console.log(state);
    res.send(state)   
});
router.get("/getTestResult/:testId", async (req, res) => {
    
    console.log(req.params.testId);
    let result = await TestingModel.getTestResult(req.params.testId);
    console.log(result);
    res.send(result)   
});

router.post('/usuario', function (req, res) {
    console.log(req.body);
    res.send('POST request to homepage')
});

module.exports = router