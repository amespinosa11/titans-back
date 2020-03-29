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
})

module.exports = router;