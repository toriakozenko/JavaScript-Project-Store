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

const cartReducer = function (state, ) {
  if (type === 'CART_ADD') {
    return {
      ...state,

    }
  }

};