import content from './slices/content.js'
import user from './slices/user.js'

const store = RTK.configureStore({
  reducer: {
    content,
    user,
  },
  devTools: true,
})

const useSubscribe = (reducerName, callback) => {
  let currVal = getNestedValue(store.getState(), reducerName)
  const subs = () =>
    store.subscribe(() => {
      const preVal = currVal
      currVal = getNestedValue(store.getState(), reducerName)
      if (preVal === currVal) return

      if (typeof currVal === 'object' && typeof preVal === 'object' && deepEqual(currVal, preVal)) return

      const isPromise = callback(currVal)
      if (isPromise instanceof Promise) Promise.resolve(isPromise)
    })
  return subs()
}
const useSelector = (callback) => callback(store.getState())
const useDispatch = (func) => store.dispatch(func)

function deepEqual(obj1, obj2) {
  const {keys} = Object,
    typeObj1 = typeof obj1,
    typeObj2 = typeof obj2
  return obj1 && obj2 && typeObj1 === 'object' && typeObj1 === typeObj2
    ? keys(obj1).length === keys(obj2).length && keys(obj1).every((key) => deepEqual(obj1[key], obj2[key]))
    : obj1 === obj2
}

const getNestedValue = (obj, path) => {
  const pList = path.split('.')
  const len = pList.length
  for (let i = 0; i < len - 1; i++) {
    const elem = pList[i]
    if (obj[elem]) obj = obj[elem]
  }

  return obj[pList[len - 1]]
}

export {useSubscribe, useSelector, useDispatch}
