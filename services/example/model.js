const db = require("../../config");

class TestingModel {

    async getVersions() {
        const versions = await db.select('version').from('aplicacion');
        return versions;
    }

    async getApplications() {
        const applications = await db.select('*').from('aplicacion');
        return applications;
    }

    async getStrategies() {
        const strategies = await db.select('*').from('estrategia');
        return strategies
    }

    async getTypeOfTests() {
        const testsType = await db.select('tipo').from('prueba');
        return testsType
    }

    async getTestState(testId) {
        const state = await db.select('estado').from('prueba').where('id_prueba', testId);
        return state
    }

    async getTestResult(testId) {
        const result = await db.select('*').from('resultado').where('id_prueba', testId);
        return result
    }

    async getToolsAvailable() {
        const toolsAvailable = await db.select('herramienta').from('prueba');     
        return toolsAvailable;
    }

    async getAddTest(params) {
        /*ejemplo del insert aun no funcional porque no se evaluan excepciones*/
        const toolsAvailable = await db.insert([{x: 20}, {y: 30},  {x: 10, y: 20}])   
        return toolsAvailable;
    }

}

module.exports = TestingModel;