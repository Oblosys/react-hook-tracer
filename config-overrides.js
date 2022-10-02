/* eslint-disable */
const { removeModuleScopePlugin, override, babelInclude } = require('customize-cra')
const path = require('path')

// Unpleasant react-app-rewired & customize-cra hack to let the CRA dev-server work directly with the package sources
// in packages/react-hook-tracer/src. Only used for the demo.

module.exports = function (config, env) {
  return Object.assign(
    config,
    override(
      removeModuleScopePlugin(),
      babelInclude([path.resolve('src'), path.resolve('packages/react-hook-tracer/src/')]),
    )(config, env),
  )
}
