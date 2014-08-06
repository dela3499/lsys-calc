class Lsys
  constructor: (params = {}) ->
    @setParams(params)
  setParams: (@params = @params) -> this
  getDrawPath: ->
    {
      x: [1,2,3],
      y: [1,2,3]
    }
  