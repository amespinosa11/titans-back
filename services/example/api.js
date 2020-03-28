const express = require("express");
const router  = express.Router();
const exampleModel = require('./model');
const ExampleModel = new exampleModel();

router.get("/", async (req, res) => {
    let exampleData = await ExampleModel.getExample();
    console.log(exampleData);
    res.send(exampleData)
});

module.exports = router;