flatten = (array) ->
  " return array of all values in array (without any subarrays) "
  out = []
  for e in array
    if e instanceof Array or e instanceof Object
      out = out.concat(flatten(e))
    else
      out.push(e)
  return out
  
unique = (array) -> 
  " Return array without duplicate elements "  
  output = {}
  output[array[key]] = array[key] for key in [0...array.length]
  value for key, value of output

getKeys = (objects) ->
  " Get all keys found in provided array of objects "
  keys = []
  for object in objects
    keys.push(key) for key of object
  return unique(keys)
    
objectDiff = (a, b) ->
  " Return array of top-level properties which differ between objects a and b "
  diff = []
  keys = getKeys([a,b])
  for k in keys
    if a[k] instanceof Object and b[k] instanceof Object
      diff.push k if objectDiff(a[k],b[k]).length > 0
    else
      diff.push(k) if a[k] != b[k]
  return flatten(diff)

foundIn = (matches, array) ->
  " return true if any matches are found in array "
  for match in matches 
    if match in array
      return true
  return false # if no matches

clone = (obj) ->
  " Clone (deep copy) an object "
  " http://coffeescriptcookbook.com/chapters/classes_and_objects/cloning "
  if not obj? or typeof obj isnt 'object'
    return obj

  if obj instanceof Date
    return new Date(obj.getTime()) 

  if obj instanceof RegExp
    flags = ''
    flags += 'g' if obj.global?
    flags += 'i' if obj.ignoreCase?
    flags += 'm' if obj.multiline?
    flags += 'y' if obj.sticky?
    return new RegExp(obj.source, flags) 

  newInstance = new obj.constructor()

  for key of obj
    newInstance[key] = clone obj[key]

  return newInstance