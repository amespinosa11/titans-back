const SQS = require('./services/sqs/sqs');
const sqs = new SQS();

const CronJob = require('cron').CronJob;

const estrategiaModel = require('./services/estrategia/model');
const EstrategiaModel = new estrategiaModel();

// Encolar mensajes
const encolarMensajes = async(mensaje, cola) => {
    let a = await sqs.sendMessage(mensaje,cola);
    console.log('Encolar mensaje ',a);
    return a;
}

const desencolarMensajes = async(cola) => {
    let a = await sqs.receiveMessage(cola);
    console.log('Desencolar mensaje ',a);
}

const obtenerCantidadMensajes = async(cola) => {
    let a = await sqs.getQueueMessages(cola);
    console.log('Cantidad mensajes ',a);
}

const eliminarMensaje = async(cola,receipt) => {
    let a = await sqs.deleteMessage(cola,receipt);
    console.log(a);
}

const obtenerPruebasPendientes = async() => {
    const pruebas = await EstrategiaModel.getPendingTests();
    if(pruebas.length > 0) {
        let prueba = pruebas[0];
        let fallo = false;
        for(let i = 0; i < prueba.cantidadEjecuciones && !fallo; i++) {
            let encolar = await encolarMensajes(prueba, `${process.env.ROOT_QUEUE}/${prueba.herramienta}`)
            if(encolar.code !== 100) {
                await EstrategiaModel.actualizarEstadoPrueba(prueba.idPrueba, 'pendiente');
                fallo = true;
            }
        }
    }
}

const job = new CronJob('0 */1 * * * *', async() => {
    console.log('*** Vamos a procesar pruebas ***');
    obtenerPruebasPendientes();
});

job.start();


//encolarMensajes('Hello Home2!', '');
//obtenerCantidadMensajes('');
//desencolarMensajes(``);
//eliminarMensaje('', '');