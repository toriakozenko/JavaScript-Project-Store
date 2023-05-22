// Create Store

function createStore(reducer){
  let state = reducer(undefined, {});
  let cbs = [];                   
  
  const getState  = () => state;          
  const subscribe = cb => (cbs.push(cb), () => cbs = cbs.filter(c => c !== cb));
                          
  const dispatch  = action => { 
    if (typeof action === 'function'){
        return action(dispatch, getState) 
    }
    const newState = reducer(state, action) 
    if (newState !== state){ 
        state = newState 
        for (let cb of cbs)  cb() 
    }
  }
  
  return {
    getState, 
    dispatch,
    subscribe 
  }
}


//promiseReducer

function promiseReducer( state = {}, {type, promiseName, status, payload, error}){
  if (type === 'PROMISE'){
    return {
      ...state,
      state: {[promiseName]: {status, payload, error}}
    } 
  }
  return state;
}

const actionPending  = (promiseName) => {
  return {
  promiseName,
  type: 'PROMISE', 
  status: 'PENDING'}
};

const actionFulfilled = (promiseName, payload) => {
  return {
    promiseName,
    type: 'PROMISE', 
    status: 'FULFILLED', 
    payload}
};

const actionRejected  = (promiseName, error) => {
  return {
    promiseName,
    type: 'PROMISE', 
    status: 'REJECTED',  
    error}
}


const actionPromise = (promiseName, promise) => {
  return async dispatch => { 
    dispatch(actionPending(promiseName)); 
    try{
        const payload = await promise; 
        dispatch(actionFulfilled(promiseName, payload)); 
        return payload; 
    }
    catch (error){
        dispatch(actionRejected(promiseName, error)); 
    }
  }
};
  




// // для розкодовки токена

function jwtDecode(token) {
  try {
  const newToken = token.split('.');
  const partSecond = newToken[1];
  const decodedToken = atob(partSecond);
  
  return JSON.parse(decodedToken);
  }
  catch(error) {
    console.log('undefined')
  }
}

// actionСreaters 

const actionAuthLogin = (token) => {
  return {
    type: 'AUTH_LOGIN', 
    token
 }
};

const actionAuthLogout = ()=> {
  return {
    type: 'AUTH_LOGOUT'
  };
};

// authReducer

const authReducer = function (state = {}, {token, type}) {
  if (type === 'AUTH_LOGIN') {
      const payload = jwtDecode(token);
      localStorage.setItem('token', token); 
    return {
      token,
      payload
    };
    } else if (type = 'AUTH_LOGOUT'){
      localStorage.removeItem('token'); 
    return {};
  } else {
    return state;
  }
};



// екшони

// додавання товару
const actionCartAdd = (good, count = 1) => {
  return {
    type: 'CART_ADD', 
    count, 
    good
  }
};

//Зменшення кількості товару
const actionCartSub = (good, count = 1) => {
  return {
    type: 'CART_SUB', 
    count, 
    good
  }
};

//Видалення товару
const actionCartDel = (good) => {
  return {
    type: 'CART_DEL', 
    good
  }
};

//Задання кількості товару
const actionCartSet = (good, count = 1) => {
  return {
    type: 'CART_SET', 
    count, 
    good
  }
};

//Очищення кошика
const actionCartClear = () => {
  return {
    type: 'CART_CLEAR'
  }
};



// cartReducer
const store = createStore(cartReducer)

store.subscribe(() => console.log(store.getState())) //

console.log(store.getState()) //{}

store.dispatch(actionCartAdd({_id: 'пиво', price: 50}))
// {пиво: {good: {_id: 'пиво', price: 50}, count: 1}}
store.dispatch(actionCartAdd({_id: 'чіпси', price: 75}))
// {
    // пиво: {good: {_id: 'пиво', price: 50}, count: 1},
    // чіпси: {good: {_id: 'чіпси', price: 75}, count: 1},
//}
store.dispatch(actionCartAdd({_id: 'пиво', price: 50}, 5))
// {
    // пиво: {good: {_id: 'пиво', price: 50}, count: 6},
    // чіпси: {good: {_id: 'чіпси', price: 75}, count: 1},
//}

store.dispatch(actionCartSet({_id: 'чіпси', price: 75}, 2))
// {
    // пиво: {good: {_id: 'пиво', price: 50}, count: 6},
    // чіпси: {good: {_id: 'чіпси', price: 75}, count: 2},
//}

store.dispatch(actionCartSub({_id: 'пиво', price: 50}, 4))
// {
    // пиво: {good: {_id: 'пиво', price: 50}, count: 2},
    // чіпси: {good: {_id: 'чіпси', price: 75}, count: 2},
//}

store.dispatch(actionCartDel({_id: 'чіпси', price: 75}))
// {
    // пиво: {good: {_id: 'пиво', price: 50}, count: 2},
//}

store.dispatch(actionCartClear()) // {}


function cartReducer (state = {}, {type, count, good}) {
 
  if (type === 'CART_ADD') {

   const existingGood = state[good._id];

   if (existingGood) {
      return {
        ...state,
        [good._id]: {...state[good._id], count: state[good._id].count + count}
      }
    }
    return {
      ...state,
      [good._id]: {
        count,
        good
      }
    } 
  };
  
  if (type === 'CART_SUB') {
   
    if (count <= 0) {
      const {[good._id]: deletedItem, ...rest } = state;
      return {
        ...rest,
        };
    }
    return {
      ...state,
      [good._id]: {...state[good._id],  count: state[good._id].count - count}
    }
  };
   

  if (type === 'CART_DEL') {
    const {[good._id]: deletedItem, ...rest } = state;
    return {
      ...rest
    }
  };

  if (type === 'CART_SET') {
    if (count <= 0) {
      const {[good._id]: deletedItem, ...rest } = state;
    return {
      ...rest
    }};
    if (count > 0) {
      return {
        ...state,
        [good._id]: {...state[good._id], count}
      }
    }
    return {
    ...state,
    [good._id]: {
      count,
      good,
    }};
  }

  if (type === 'CART_CLEAR') {
    return {};
  };
};



