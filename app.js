const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const routes = require("./services/example/api")
const estrategiaRoutes = require("./services/estrategia/api")

app.use("/testingTool", routes);
app.use("/estrategias", estrategiaRoutes);


app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
