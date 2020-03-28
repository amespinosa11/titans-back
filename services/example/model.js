const db = require("../../config");

class ExampleModel {

    async getExample() {
        const example = await db.select('*').from('usuario_empresa');
        return example;
    }

}

module.exports = ExampleModel;