// if (process.env.NODE_ENV !== "production") {
require("dotenv").config();
// }
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("./config/config");
const index = require("./routes/index");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./redacreDoc.json");
const WebSocket = require("ws");

const fs = require("fs");
const http = require("http");
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

//GeojsonData

const villageGeoData = JSON.parse(
  fs.readFileSync(
    __dirname + "/seed/popeye-village-balluta.geojson",
    "utf-8"
  )
);

const lunchGeoData = JSON.parse(
  fs.readFileSync(__dirname + "/seed/lunch.geojson", "utf-8")
);



const VillageCoordinates = villageGeoData.features[0].geometry.coordinates;
const lunchCoordinates = lunchGeoData.features[0].geometry.coordinates;



app.use(cors());

const PORT = process.env.PORT || 4600;

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(__dirname, "public")));

// api documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/", index);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Red Acre Challenge ",
  });
});

//websocket
wss.on("connection", (ws) => {
  console.log("connected to client");
  let i = 0;

  ws.on("message", (data) => {
    console.log(`client has sent us: ${data}`);

    const receivedData = JSON.parse(data.toString());
    try {
      switch (receivedData.data.channel) {
        case "House -> Office":
          if (i === VillageCoordinates.length - 1) return "";
          ws.send(JSON.stringify(VillageCoordinates[i]));
          i++;
          break;
        case "Office -> Lunch":
          if (i === lunchCoordinates.length - 1) return "";
          ws.send(JSON.stringify(lunchCoordinates[i]));
          i++;
          break;
        case "Lunch -> Office":
          if (i === lunchCoordinates.length - 1) return "";
          ws.send(
            JSON.stringify(lunchCoordinates[lunchCoordinates.length - 1 - i])
          );
          i++;
          break;
        case "Office -> House":
          if (i === villageCoordinates.length - 1) return "";
          ws.send(
            JSON.stringify(
              villageCoordinates[villageCoordinates.length - 1 - i]
            )
          );
          i++;
          break;
        default:
          throw new Error(`Invalid channel: ${receivedData.data.channel}`);
      }
    } catch (e) {
      console.error(
        `Something went wrong while sending a message: ${e.message}`
      );
    }
  });

  //handle client disconnect
  ws.on("close", () => {
    console.log("client disconnected");
  });

  //error handle
  ws.onerror = function () {
    console.log("Some Error occured");
  };
});

// catch 404 and forward to error handler
// Handle unhandled routes
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

server.listen(PORT, () => console.log(`listening on port: ${PORT}`));
module.exports = app;
