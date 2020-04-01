const SQS = require('./services/sqs/sqs');
const sqs = new SQS();

// Encolar mensajes
const encolarMensajes = async(mensaje, cola) => {
    let a = await sqs.sendMessage(mensaje,cola);
    console.log('Encolar mensaje ',a);
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

//encolarMensajes('Hello Home2!', '');
//obtenerCantidadMensajes('');
//desencolarMensajes('');
//eliminarMensaje('', '');