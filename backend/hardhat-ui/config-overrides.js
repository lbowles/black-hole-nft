const { removeModuleScopePlugin, babelInclude } = require("customize-cra")
const path = require("path")

module.exports = function override(config, env) {
  config = removeModuleScopePlugin()(config, env)

  config = babelInclude([path.resolve("src"), path.resolve("../types"), path.resolve("../deployments")])(config, env)

  return config
}
