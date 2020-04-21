const express = require('express');
const app = express();

const cors = require('cors');
const bodyParser = require("body-parser");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({origin: 'http://localhost:4200'}));

// Routes
const testingRoutes = require("./services/testingServices/api")
const estrategiaRoutes = require("./services/estrategia/api")

app.use("/testingTool", testingRoutes);
app.use("/estrategias", estrategiaRoutes);


app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
