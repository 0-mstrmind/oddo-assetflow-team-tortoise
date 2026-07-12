export default {
  template: "rest-api",

  language: "javascript",
  architecture: "modular",

  database: {
    provider: "mongodb",
    client: "mongoose"
  },
  features: {
    resourceGenerator: true,
  },
  
  validation: "joi",
  srcDir: "src",
};
