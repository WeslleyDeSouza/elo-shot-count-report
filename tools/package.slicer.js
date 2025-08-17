const fs = require("fs");
const path = require("path");

const mode = "api"; // default api
const subPath = process.argv.includes("--deployment") ? ".." : "";

const filePath = path.resolve(__dirname, subPath, "package.json");
const rawdata = fs.readFileSync(filePath);
let json = JSON.parse(rawdata);

const requirements = {
  app: [
    "@angular",
    "sdk-ui",
    "auth-ui",
    "@angular-eslint",
    "@angular-devkit",
    "@nx/angular",
    "@popperjs",
    "bootstrap",
    "zone.js",
    "@ngx",
    "angular-cacheable",
    "ng-zorro-antd",
    "animate.css",
    "mdb-angular-ui-kit",
    "ngx-quill",
    "quill",
    "jest-preset-angular",
    "sortablejs",
    "@fullcalendar",
    "apexcharts",
    "ng-apexcharts",
  ],
  mobile: ["@ionic", "@capacitor", "@nxtend"],
  api: [
    "puppeteer",
    "cookie-session",
    "cookie-parser",
    "nodemailer",
    "passport-jwt",
    "@nest",
    "nrwl",
    "mysql",
    "sqlite3",
    "pg",
    "nodemailer",
    "passport",
    "passport-jwt",
    "tslib",
    "typeorm",
    "bexio",
    "class-transformer",
    "class-validator",
    "cookie-parser",
    "@types",
    "multer",
    "multer-gridfs-storage",
    "@types/multer-gridfs-storage",
    "mongoose",
    "mongo-gridfs",
    "amqplib",
    "amqp-connection-manager",
    "nginx-builder",
    "twilio",
    "cache-manager",
  ],
};

// Skip front end package.json
if (mode === "api") {
  json.name = json.name + "-sliced-api";
  let result = {};
  let exclude = [...requirements.app, ...requirements.mobile].toString();
  for (let key in json.dependencies) {
    if (!exclude.includes(key.split("/")[0])) {
      result[key] = json.dependencies[key];
    }
  }
  json.dependencies = result;

  result = {};
  for (let key in json.devDependencies) {
    if (!exclude.includes(key.split("/")[0])) {
      result[key] = json.devDependencies[key];
    }
  }
  json.devDependencies = result;

  //fs.unlinkSync(path.resolve(__dirname, 'package.json'));
  fs.writeFileSync(filePath, JSON.stringify(json), "utf8");
}
else if (mode === "app") {
  let result = {};
  let exclude = [...requirements.api, requirements.mobile].toString();
  for (let key in json.dependencies) {
    if (!exclude.includes(key)) {
      result[key] = json.dependencies[key];
    }
  }
  json.dependencies = result;

  result = {};
  for (let key in json.devDependencies) {
    if (!exclude.includes(key)) {
      result[key] = json.devDependencies[key];
    }
  }
  json.devDependencies = result;

  fs.writeFileSync(filePath, JSON.stringify(json), "utf8");
}

console.log("slicer:done", filePath);
