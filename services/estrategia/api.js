const express = require("express");
const router  = express.Router();
const status = require('http-status');
const estrategiaModel = require('./model');
const EstrategiaModel = new estrategiaModel();


router.post("/", async (req, res) => {
    try {
        let estrategia = await EstrategiaModel.insertEstrategia(req.body);
        res.status(status.OK).json(estrategia);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json(error);
    }  
});

router.get("/estadisticas", async(req,res) => {
    try {
        let estadisticas = await EstrategiaModel.obtenerEstadisticas();
        res.status(status.OK).json(estadisticas);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json(error);
    }
});

router.post("/estado_prueba", async(req, res) => {
    try {
        let estado = await EstrategiaModel.actualizarEstadoPrueba(req.body.idPrueba, req.body.estado);
        res.status(status.OK).json({code: 200, message: 'Estado actualizado'});
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json(error);
    }
})

router.get('/estragias_general', async(req,res) => {
    try {
        let estadisticas = await EstrategiaModel.getEstrategiasConEstado();
        res.status(status.OK).json(estadisticas);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json(error);
    }
});

router.post("/resultado", async (req, res) => {
    try {
        let resultado = await EstrategiaModel.insertarResultadoPrueba(req.body);
        res.status(status.OK).json(resultado);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json(error);
    }  
});

router.get("/resultado/:idEstrategia", async (req, res) => {
    try {
        let resultados = await EstrategiaModel.obtenerResultadosEstrategia(req.params.idEstrategia);
        res.status(status.OK).json(resultados);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json(error);
    }  
});

module.exports = router;