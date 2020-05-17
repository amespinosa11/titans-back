const SQS = require('./services/sqs/sqs');
const sqs = new SQS();

const CronJob = require('cron').CronJob;

const estrategiaModel = require('./services/estrategia/model');
const EstrategiaModel = new estrategiaModel();

// Encolar mensajes
const encolarMensajes = async (mensaje, cola, typeApp) => {

    let a = await sqs.sendMessage(mensaje, cola, typeApp);
    console.log('Encolar mensaje ', a);

    return a;
}

const desencolarMensajes = async (cola) => {
    let a = await sqs.receiveMessage(cola);
    console.log('Desencolar mensaje ', a);
}

const obtenerCantidadMensajes = async (cola) => {
    let a = await sqs.getQueueMessages(cola);
    console.log('Cantidad mensajes ', a);
}

const eliminarMensaje = async (cola, receipt) => {
    let a = await sqs.deleteMessage(cola, receipt);
    console.log(a);
}

const obtenerPruebasPendientes = async (typeTest, queue) => {
    const pruebas = await EstrategiaModel.getPendingTests(typeTest);
    console.log('PRUEBAS : ', pruebas);
    for (let prueba of pruebas) {
        let fallo = false;
        for (let i = 0; i < prueba.cantidadEjecuciones && !fallo; i++) {
            let encolar = await encolarMensajes(prueba, queue, typeTest)
            if (encolar.code !== 100) {
                await EstrategiaModel.actualizarEstadoPrueba(prueba.idPrueba, 'PENDIENTE');
                fallo = true;
            }
        }
    }
}

const job = new CronJob('*/20 * * * * *', async () => {
    console.log('*** Vamos a procesar pruebas ***');
    obtenerPruebasPendientes('WEB', '');
    obtenerPruebasPendientes('MOVIL', '');
});

job.start();


//encolarMensajes('Hello Home2!', '');
//obtenerCantidadMensajes('');
//desencolarMensajes(``);
//eliminarMensaje('', '');