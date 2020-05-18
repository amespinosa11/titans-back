const db = require("../../config");
const fs = require('file-system');
const moment = require('moment');

class EstrategiaModel {

    async obtenerEstadisticas() {
        try {
            let totales = await db('estrategia').count('id_estrategia', { as: 'totales' });
            let estrategias = await db.select('id_estrategia').from('estrategia');
            let estadisticas = await this.resutadosEstadisticas(estrategias, totales);
            return { code: 200, data: estadisticas };
        } catch (error) {
            console.log(error);
            throw ({ code: 500, error: error });
        }
    }

    async resutadosEstadisticas(estrategias, totales) {
        let res = {
            totales: totales.length > 0 ? parseInt(totales[0].totales) : 0,
            pendientes: 0,
            enCola: 0,
            enEjecucion: 0,
            fallidas: 0,
            satisfactorias: 0
        }
        for (let estrategia of estrategias) {
            let estado = await this.establecerEstadoEstrategia(estrategia);
            res.pendientes = estado == 'pendiente' ? res.pendientes + 1 : res.pendientes;
            res.enCola = estado === 'enCola' ? res.enCola + 1 : res.enCola;
            res.enEjecucion = estado === 'enEjecucion' ? res.enEjecucion + 1 : res.enEjecucion;
            res.fallidas = estado === 'fallida' ? res.fallidas + 1 : res.fallidas;
            res.satisfactorias = estado === 'satisfactoria' ? res.satisfactorias + 1 : res.satisfactorias;
        }
        return res;
    }

    async establecerEstadoEstrategia(estrategia) {
        let resultados = await db('estrategia')
            .join('prueba', 'estrategia.id_estrategia', '=', 'prueba.id_estrategia')
            .where('estrategia.id_estrategia', estrategia.id_estrategia)
            .select('prueba.estado');
        // Pendiente > 50%
        // EnCola > 50%
        // EnEjecucion > 50%
        // Fallido No hay pendientes y 1 > es fallido
        // Satisfactorio 100%    
        let pendiente = 0;
        let enCola = 0;
        let enEjecucion = 0;
        let fallido = 0;
        let satisfactorio = 0;

        console.log(estrategia, resultados);
        for (let resultado of resultados) {
            pendiente = resultado.estado === 'PENDIENTE' ? pendiente + 1 : pendiente;
            enCola = resultado.estado === 'EN_COLA' ? enCola + 1 : enCola;
            enEjecucion = resultado.estado === 'EN_EJECUCION' ? enEjecucion + 1 : enEjecucion;
            fallido = resultado.estado === 'FALLIDA' ? fallido + 1 : fallido;
            satisfactorio = resultado.satisfactorio === 'SATISFACTORIA' ? satisfactorio + 1 : satisfactorio;
        }

        if (pendiente > resultados.length / 2) {
            return 'pendiente';
        } else if (enCola > resultados.length / 2) {
            return 'enCola';
        } else if (enEjecucion > resultados.length / 2) {
            return 'enEjecucion';
        } else if (fallido > 1) {
            return 'fallida'
        } else if (satisfactorio === resultados.length) {
            return 'satisfactoria';
        }
    }

    async getEstrategiasConEstado() {
        const strategies = await db.select('*').from('estrategia');
        for (let estrategia of strategies) {
            let estado = await this.establecerEstadoEstrategia(estrategia);
            console.log(estado);
            estrategia.estado = estado;
        }
        return strategies;
    }

    async insertEstrategia(estrategia) {
        try {
            // Primero se debe insertar la estrategia
            const nuevaEstrategia = await db('estrategia').returning('id_estrategia').insert({
                id_aplicacion: parseInt(estrategia.id_aplicacion),
                descripcion: estrategia.descripcion
            });
            console.log('RESULTADO AL CREAR ESTRATEGIA : ', nuevaEstrategia);

            if (nuevaEstrategia.length > 0) {
                // Se deben recorrer las pruebas para insertar cada una
                for (let prueba of estrategia.pruebas) {
                    prueba.id_estrategia = nuevaEstrategia[0];
                    let p = await this.insertPrueba(prueba);
                    console.log('ESTO ES P : ', p);
                }
                let mensaje = { code: 200, message: "Estrategía creada con exito" };

                return mensaje;
            }
            return { code: 500, message: "Error al crear estrategía" };
        } catch (error) {
            console.log(error);
            throw ({ code: 500, message: "Error al crear estrategía", error: error });
            //return {code: 500, message: "Error al crear estrategía", error: error};
        }
    }

    async insertPrueba(prueba) {
        try {
            let nuevaPrueba = {
                id_tipo_prueba_herramienta: prueba.id_tipo_herramienta_prueba,
                modo: prueba.modo.toUpperCase(),
                descripcion: prueba.descripcion,
                cantidad_ejecuciones: prueba.cantidad_ejecuciones,
                fecha_ejecucion: prueba.fecha_ejecucion,
                fecha_finalizacion: prueba.fecha_finalizacion,
                estado: 'PENDIENTE',
                tiempo_ejecucion: 0,
                id_estrategia: prueba.id_estrategia
            }

            // Se debe agregar prueba
            let idPrueba = await db('prueba').returning('id_prueba').insert(nuevaPrueba);
            console.log('RESULTADO AL CREAR PRUEBA : ', idPrueba);
            idPrueba = idPrueba.length > 0 ? idPrueba[0] : null;

            // Si vienen matrices de prueba se deben insertar primero. Recorrido.
            for (let matrizFront of prueba.matrizPrueba) {
                let matriz = await this.insertMatrizPrueba(matrizFront);
                let idMatriz = matriz.length > 0 ? matriz[0] : null;
                // Se debe insertar los ids de matriz y la prueba en tabla intermedia
                let inter = await this.insertarMatrizPruebaIntermedio(idPrueba, idMatriz);
                console.log('RESULTADO AL AGREGAR INTERMEDIO MATRIZ - PRUEBA', inter);
            }

            // Si vienen scripts se deben agregar
            for (let script of prueba.scripts) {
                script.id_prueba = idPrueba;
                await this.insertScript(script);
            }
            // Si vienen parametros se deben agregar
            for (let parametro of prueba.parametros) {
                parametro.id_prueba = idPrueba;
                await this.insertParametro(parametro);
            }
            return 1;
        } catch (error) {
            console.log('Error al crear prueba : ', error);
            throw error;
        }
    }

    async insertMatrizPrueba(matrizPrueba) {
        try {
            matrizPrueba.tipo_aplicacion = matrizPrueba.tipo_aplicacion.toUpperCase();
            const nuevaMatriz = await db('matriz_tipoapp').returning('id_matriz_tipoapp').insert(matrizPrueba);
            console.log('RESULTADO AL CREAR MATRIZ DE PRUEBA : ', nuevaMatriz);
            return nuevaMatriz;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async insertParametro(parametro) {
        try {
            let nuevoParametro = await db('parametro').returning('id_parametro').insert(parametro);
            console.log('RESULTADO AL CREAR PARAMETRO : ', nuevoParametro);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async insertScript(script) {
        try {
            //script.script_file = '';
            if (script.script_file.includes('base64')) {
                this.saveFile(script.script_file, script.descripcion);
            }
            const nom = moment().format('YYYY-MM-DD HH:mm');
            script.script_file = `${script.descripcion}-${moment(nom).toDate().getTime()}.spec.js`;
            let nuevoScript = await db('script').returning('id_script').insert(script);
            console.log('RESULTADO AL CREAR SCRIPT : ', nuevoScript);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async insertResultado(resultado) {
        try {
            const nuevoResultado = await db('resultado').returning('id_resultado').insert(resultado);
            console.log('RESULTADO AL CREAR RESULTADO : ', nuevoResultado);
            return nuevoResultado;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    saveFile(file, descripcion) {
        const base64Data = file.replace(/^data:text\/javascript;base64,/, "");
        let f = new Buffer(base64Data, 'base64');
        // Falta colocar nombre de script unico
        const nom = moment().format('YYYY-MM-DD HH:mm');
        const nombreScript = `${descripcion}-${moment(nom).toDate().getTime()}.spec.js`;
        fs.writeFile(`../files/${nombreScript}`, f, 'base64', function (err) {
            console.log(err);
        });
        //return nombreScript;
    }

    async getAppData(idTest, idStrategy) {

        let tests = await db.select('*').from('aplicacion')
            .join('estrategia', 'aplicacion.id_aplicacion', '=', 'estrategia.id_aplicacion')
            .whereRaw('estrategia.id_estrategia = ?', [idStrategy]);

        let pruebas = [];
        const scripts = await db.select('*').from('script').where('id_prueba', idTest);
        let prueba = null;
        for (let script of scripts) {
            prueba = {
                idPrueba: idTest,
                esScript: true,
                cantidadEjecuciones: parseInt(script.cant_ejecuciones),
                scriptFile: script.script_file,
                apkAdress: tests[0].apk
            }
            pruebas.push(prueba);
        }
        return pruebas;
    }


async getPendingTests(typeTest){
    let pruebasMandar = [];
    const ahora = moment().subtract(2, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    const despues = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    let tests = await db.select('*').from('prueba')
        .join('tipo_prueba_herramienta', 'tipo_prueba_herramienta.id_tipo_prueba_herramienta', '=', 'prueba.id_tipo_prueba_herramienta')
        .whereRaw(`estado='PENDIENTE'AND fecha_ejecucion BETWEEN ? and ?`, [ahora, despues])
        .limit(1);

    let prueba = null;

    if (tests.length > 0) {
        let test = tests[0];

        if (typeTest == "MOVIL") {
            await this.actualizarEstadoPrueba(test.id_prueba, 'EN_COLA');

            let prueba1 = await this.getAppData(test.id_prueba, test.id_estrategia);
            return prueba1 !== undefined ? prueba1 : [];
        }
        else {

            // cambiar estado
            await this.actualizarEstadoPrueba(test.id_prueba, 'EN_COLA');
            // Buscar info de matriz de prueba
            const matrices = await db.select('*').from('matriz_tipoapp_prueba')
                .join('matriz_tipoapp', 'matriz_tipoapp_prueba.id_matriz_tipoapp', '=', 'matriz_tipoapp.id_matriz_tipoapp')
                .where('id_prueba', test.id_prueba);
            // Buscar si tiene scripts
            if (parseInt(test.cantidad_ejecuciones) === 0) {
                // Busco todos los scripts
                for (let ma of matrices) {
                    let scripts = await this.processScripts(test, ma);
                    pruebasMandar = pruebasMandar.concat(scripts);
                }
            } else {
                // Armar la prueba 
                prueba = {
                    idPrueba: test.id_prueba,
                    esScript: false,
                    cantidadEjecuciones: parseInt(test.cantidad_ejecuciones),
                    scriptFile: '',
                    tipo: test.tipo,
                    herramienta: test.herramienta,
                    modo: test.modo,
                    navegador: matriz[0].navegador,
                    resolucion: matriz[0].resolucion
                }
                pruebasMandar.push(prueba);
            }
        }
        return pruebasMandar;
    }
    return pruebasMandar;
}

async processScripts(test, matriz) {
    let pruebas = [];
    const scripts = await db.select('*').from('script').where('id_prueba', test.id_prueba);
    let prueba = null;
    for (let script of scripts) {
        prueba = {
            idPrueba: test.id_prueba,
            esScript: true,
            cantidadEjecuciones: parseInt(script.cant_ejecuciones),
            scriptFile: script.script_file,
            tipo: test.tipo_prueba,
            herramienta: test.herramienta,
            modo: test.modo,
            navegador: matriz.navegador,
            resolucion: matriz.resolucion
        }
        pruebas.push(prueba);
    }
    return pruebas;
}

async actualizarEstadoPrueba(idPrueba, estado) {
    const actualizarEstado = await db('prueba')
        .where('id_prueba', '=', idPrueba)
        .update({
            estado: estado,
            thisKeyIsSkipped: undefined
        });
    console.log('ESTADO: ', actualizarEstado);
}

async insertarMatrizPruebaIntermedio(idPrueba, idMatriz){
    const objMatrizPrueba = {
        id_prueba: idPrueba,
        id_matriz_tipoapp: idMatriz
    }
    const interMatrizPrueba = await db('matriz_tipoapp_prueba').returning('id_matriz_tipoapp_prueba')
        .insert(objMatrizPrueba);
    console.log('RESULTADO AL CREAR INTER : ', interMatrizPrueba);
}

async insertarResultadoPrueba(resultado) {
    const nuevoResultado = await db('resultado').returning('id_resultado').insert(resultado);
    return nuevoResultado.length > 0 ? { code: 200, message: "Resultado creado con exito" }
    : { code: 500, message: "No fue posible crear el resultado" };
}

async obtenerResultadosEstrategia(idEstrategia) {
    console.log(idEstrategia);
    const results = await db('resultado')
    .join('prueba', 'resultado.id_prueba', '=', 'prueba.id_prueba')
    .where('prueba.id_estrategia', '=', idEstrategia)
    .select('resultado.*')

    for(let result of results) {
        if(result.tipo === 'LOG') {
            result.data = JSON.parse(fs.readFileSync(result.url,'utf8'));
        }
    }
    console.log(results);
    return results;
}

}

module.exports = EstrategiaModel;