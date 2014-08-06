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