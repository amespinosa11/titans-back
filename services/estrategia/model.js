const db = require("../../config");
const fs = require('file-system');
const moment = require('moment');

class EstrategiaModel {

    async obtenerEstadisticas() {
        try {
            let totales = await db('estrategia').count('id_estrategia', {as: 'totales'});
            let estrategias = await db.select('id_estrategia').from('estrategia');
            let estadisticas = await this.resutadosEstadisticas(estrategias, totales);
            return {code: 200, data: estadisticas};
        } catch (error) {
            console.log(error);
            throw({code: 500, error: error});
        }
    }

    async resutadosEstadisticas(estrategias, totales) {
        let res = {
            totales: totales.length > 0 ? parseInt(totales[0].totales) : 0,
            pendientes : 0,
            enCola : 0,
            enEjecucion : 0,
            fallidas : 0,
            satisfactorias : 0
        }
        for(let estrategia of estrategias) {
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
        
        for(let resultado of resultados) {
            pendiente = resultado.estado === 'pendiente' ? pendiente + 1 : pendiente;
            enCola = resultado.estado === 'en cola' ? enCola + 1 : enCola;
            enEjecucion = resultado.estado === 'en ejecucion' ? enEjecucion + 1 : enEjecucion;
            fallido = resultado.estado === 'fallida' ? fallido + 1 : fallido;
            satisfactorio = resultado.satisfactorio === 'satisfactoria' ? satisfactorio + 1 : satisfactorio;
        }

        if(pendiente > resultados.length/2 ) {
            return 'pendiente';
        } else if(enCola > resultados.length/2) {
            return 'enCola';
        } else if(enEjecucion > resultados.length/2) {
            return 'enEjecucion';
        } else if(fallido > 1) {
            return 'fallida'
        } else if(satisfactorio === resultados.length) {
            return 'satisfactoria';
        }
    }

    async insertEstrategia(estrategia) {
        try {
            // Primero se debe insertar la estrategia
            const nuevaEstrategia = await db('estrategia').returning('id_estrategia').insert(estrategia.estrategia);
            console.log('RESULTADO AL CREAR ESTRATEGIA : ', nuevaEstrategia);

            if(nuevaEstrategia.length > 0) {
                // Se deben recorrer las pruebas para insertar cada una
                for(let prueba of estrategia.pruebas) {
                    prueba.id_estrategia = nuevaEstrategia[0];
                    let p = await this.insertPrueba(prueba);
                    console.log('ESTO ES P : ', p);
                }
                let mensaje = {code: 200, message: "Estrategía creada con exito"};

                return mensaje;
            }
            return {code: 500, message: "Error al crear estrategía"};
        } catch (error) {
            console.log(error);
            throw({code: 500, message: "Error al crear estrategía", error: error}); 
            //return {code: 500, message: "Error al crear estrategía", error: error};
        }
    }

    async insertPrueba(prueba) {
        try {
            let nuevaPrueba = {
                tipo: prueba.tipo,
                herramienta: prueba.herramienta,
                modo: prueba.modo,
                descripcion: prueba.descripcion,
                cantidad_ejecuciones: prueba.cantidad_ejecuciones,
                fecha_ejecucion: prueba.fecha_ejecucion,
                fecha_finalizacion: prueba.fecha_finalizacion,
                estado: 'pendiente',
                tiempo_ejecucion: 0,
                id_estrategia : prueba.id_estrategia
            } 
            // Si viene una matriz se debe insertar primero
            if(prueba.matrizPrueba) {
                let matriz = await this.insertMatrizPrueba(prueba.matrizPrueba);
                nuevaPrueba.id_matriz_prueba = matriz.length > 0 ? matriz[0] : null;
            }
            // Se debe agregar prueba
            let idPrueba = await db('prueba').returning('id_prueba').insert(nuevaPrueba);
            console.log('RESULTADO AL CREAR PRUEBA : ', idPrueba);
            idPrueba = idPrueba.length > 0 ? idPrueba[0] : null;
            // Si vienen scripts se deben agregar
            for(let script of prueba.scripts) {
                script.id_prueba = idPrueba;
                await this.insertScript(script);
            }
            // Si vienen parametros se deben agregar
            for(let parametro of prueba.parametros) {
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
            const nuevaMatriz = await db('matriz_prueba').returning('id_matriz_prueba').insert(matrizPrueba);
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
            this.saveFile(script.script_file);
            script.script_file = 'prueba.spec.js';
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

    saveFile(file) {
        const base64Data = file.replace(/^data:text\/javascript;base64,/, "");
        let f = new Buffer(base64Data, 'base64');
        // Falta colocar nombre de script unico
        fs.writeFile("../files/prueba.spec.js", f, 'base64', function(err) {
            console.log(err);
        });
    }

    async getPendingTests() {
        let pruebasMandar = [];
        const ahora = moment().subtract(2, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        const despues = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        let tests = await db.select('*').from('prueba').whereRaw(`estado='pendiente'AND fecha_ejecucion BETWEEN ? and ?`, [ahora,despues])
        .limit(1);


        let prueba = null;
        if(tests.length > 0) {
            let test = tests[0];
            // cambiar estado
            let estado = await this.actualizarEstadoPrueba(test.id_prueba, 'enCola');
            // Buscar info de matriz de prueba
            const matriz = await db.select('*').from('matriz_prueba').where('id_matriz_prueba', test.id_matriz_prueba);
            console.log(matriz);
            // Buscar si tiene scripts
            if(parseInt(test.cantidad_ejecuciones) === 0) {
                // Busco todos los scripts
                let scripts = await this.processScripts(test, matriz[0]);
                pruebasMandar = scripts;
                //console.log(scripts);
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
        console.log('PRUEBAS A MANDAR ', pruebasMandar);
        return pruebasMandar;
    }

    async processScripts(test, matriz) {
        let pruebas = [];
        const scripts = await db.select('*').from('script').where('id_prueba', test.id_prueba);
        let prueba = null;
        for(let script of scripts) {
            prueba = {
                idPrueba: test.id_prueba,
                esScript: true,
                cantidadEjecuciones: parseInt(script.cant_ejecuciones),
                scriptFile: script.script_file,
                tipo: test.tipo,
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

}

module.exports = EstrategiaModel;