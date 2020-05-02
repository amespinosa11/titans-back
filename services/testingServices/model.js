const db = require("../../config");

class TestingModel {

    async getVersions() {
        const versions = await db.select('*').from('version');
        return versions;
    }

    async getApplications() {
        let apps = [];//armar trama de respuesta por aplicación
        let result = [];//resultado global de la consulta
        var positionResult = 0

        const applications = await db.select('*').from('aplicacion');

        for (let application of applications) {
            //console.log(application);
            const versionsApp = await db.select('*').from('version').where('id_aplicacion', application.id_aplicacion);
            //console.log(versionsApp);

            apps = {
                id_aplicacion: application.id_aplicacion,
                nombre: application.nombre,
                tipo: application.tipo,
                url: application.url,
                apk: application.apk,
                versions: versionsApp
            }
            result[positionResult++] = apps
        }
        console.log(result);
        return result;
    }

    async getStrategies() {
        const strategies = await db.select('*').from('estrategia');
        return strategies;
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

    async getTestsAndTools(typeApp) {
        const testAndtoolsAvailable = await db.select('*').from('tipo_prueba_herramienta').where('tipo_aplicacion', typeApp);
        return testAndtoolsAvailable;
    }

    async getToolsAvailable() {
        const toolsAvailable = await db.select('herramienta').from('prueba');
        return toolsAvailable;
    }

    async getBrowserMatrices(typeApp) {
        const matricesAndBrowsersAvailable = await db.select('*').from('matriz_tipoapp').where('tipo_aplicacion', typeApp);
        return matricesAndBrowsersAvailable;
    }

    async getScriptsAvailable(testType, typeTool) {
        let testAndtoolAvailable = await db.from('tipo_prueba_herramienta').where('tipo_prueba', testType).andWhere('herramienta', '=', typeTool).first()
        console.log(testAndtoolAvailable);

        if (testAndtoolAvailable.length == 0) {
            throw error
        }

        //console.log(testAndtoolAvailable.id_tipo_prueba_herramienta);
        let scripts = await db.select('*').from('script').where('id_tipo_prueba_herramienta', testAndtoolAvailable.id_tipo_prueba_herramienta);
        //console.log(scripts.length);

        if (scripts.length == 0) {
            throw error
        }
        return scripts;
    }

    async getScriptsNotTestType(testType) {
        let testAndtoolAvailable = await db.from('tipo_prueba_herramienta').whereNull('herramienta').andWhere('tipo_prueba', '=', testType).first()
        //console.log(testAndtoolAvailable);

        if (testAndtoolAvailable.length == 0) {
            throw error
        }

        //console.log(testAndtoolAvailable.id_tipo_prueba_herramienta);
        let scripts = await db.select('*').from('script').where('id_tipo_prueba_herramienta', testAndtoolAvailable.id_tipo_prueba_herramienta);
        //console.log(scripts.length);

        if (scripts.length == 0) {
            throw error
        }
        return scripts;
    }

    async getAllScripts() {
        let scripts = await db.select('*').from('script');
        console.log(scripts);

        if (scripts.length == 0) {
            throw error
        }
        return scripts;
    }

    async getAddTest(params) {
        /*ejemplo del insert aun no funcional porque no se evaluan excepciones*/
        const toolsAvailable = await db.insert([{ x: 20 }, { y: 30 }, { x: 10, y: 20 }])
        return toolsAvailable;
    }

}

module.exports = TestingModel;