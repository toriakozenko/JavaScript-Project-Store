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
// const store = createStore(cartReducer)

// store.subscribe(() => console.log(store.getState())) //

// console.log(store.getState()) //{}

// store.dispatch(actionCartAdd({_id: 'пиво', price: 50}))
// // {пиво: {good: {_id: 'пиво', price: 50}, count: 1}}
// store.dispatch(actionCartAdd({_id: 'чіпси', price: 75}))
// // {
//     // пиво: {good: {_id: 'пиво', price: 50}, count: 1},
//     // чіпси: {good: {_id: 'чіпси', price: 75}, count: 1},
// //}
// store.dispatch(actionCartAdd({_id: 'пиво', price: 50}, 5))
// // {
//     // пиво: {good: {_id: 'пиво', price: 50}, count: 6},
//     // чіпси: {good: {_id: 'чіпси', price: 75}, count: 1},
// //}

// store.dispatch(actionCartSet({_id: 'чіпси', price: 75}, 2))
// // {
//     // пиво: {good: {_id: 'пиво', price: 50}, count: 6},
//     // чіпси: {good: {_id: 'чіпси', price: 75}, count: 2},
// //}

// store.dispatch(actionCartSub({_id: 'пиво', price: 50}, 4))
// // {
//     // пиво: {good: {_id: 'пиво', price: 50}, count: 2},
//     // чіпси: {good: {_id: 'чіпси', price: 75}, count: 2},
// //}

// store.dispatch(actionCartDel({_id: 'чіпси', price: 75}))
// // {
//     // пиво: {good: {_id: 'пиво', price: 50}, count: 2},
// //}

// store.dispatch(actionCartClear()) // {}


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



//GraphQL запити

//Запит на перелiк кореневих категорій

const gqlRootCats = () => gql(`
query categories{
  CategoryFind(query: "[{\"parent\": null}]"){
    _id,
    name
}
}
`);

const actionRootCats = () =>
  actionPromise('rootCats', gqlRootCats());


//Запит для отримання однієї категорії з товарами та картинками
const gqlOneCatWithGoods = (id) => gql(`
query oneCatWithGoods {
  CategoryFindOne(query: "[{ _id: ${id} }]"  )
  {
      _id,
      name 
    goods {
        _id,
         name,
         images {
          url
        }
      }
  }
}
`);
 

const actionOneCatWithGoods = () =>
  actionPromise('oneCatWithGoods', gqlOneCatWithGoods(id));

// query: "[{\"_id\":\"62ce8a8fb74e1f5f2ec1a0ec\"}]"


//Запит на отримання товару з описом та картинками
const gqlOneGood = (id) => gql(`
query oneGood {
  GoodFindOne(query: "[{\"_id\": ${id}}]")
  {
      _id
      name
      description
      images {
        url
      }
    }
  }
`);

const actionGoodFindOne = () =>
  actionPromise('goodFindOne', gqlOneGood(id));

// query: "[{\"_id\":\"62cf2979b74e1f5f2ec1a0ef\"}]"



//Запит на реєстрацію

const gqlUserUpsert = (login, password) => gql(`
mutation register($login:String, $password: String){
  UserUpsert(user: {login: ${login}, password: ${password}}){
    _id 
    login 
    createdAt
  }
}
`);

const actionUserUpsert = (login, password) =>
  actionPromise('registration', gqlUserUpsert({login, password}));

// login 'lola', password 'lala'
// повернулось {
//   "data": {
//     "UserUpsert": {
//       "_id": "646fb6af6ad1742358aefb95",
//       "login": "lola",
//       "createdAt": "1685042863000"
//     }
//   }
// }


//Запит на логін

const gqlQueryLogin = (login, password) => gql(`
query login($login: String, $password: String){
  login(login: ${login}, password: ${password})
}
`);

const actionQueryLogin = () =>
  actionPromise('login', gqlQueryLogin({login, password}));

// повернуло {
//   "data": {
//     "login": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOiI2NDZmYjQ2NDZhZDE3NDIzNThhZWZiOTQiLCJsb2dpbiI6ImxvbCIsImFjbCI6WyI2NDZmYjQ2NDZhZDE3NDIzNThhZWZiOTQiLCJ1c2VyIl19LCJpYXQiOjE2ODUwNDMwNTh9.aHLdCd19vbHzuh02OmknHj34MUIWKWvhbj2hLFkCEyw"
//   }
// }


//Запит історії замовлень

const gqlQueryHistoryOrder = () => gql(`
query historyOrder{
  OrderFind(query: "[{}]") {
     _id
     total
  }
}
`);

const actionQueryHistoryOrder = () =>
  actionPromise('order history', gqlQueryHistoryOrder());

// {
//   "data": {
//     "OrderFind": []
//   }
// }

//Запит на оформлення замовлення

const gqlOrderUpsert  = (goods) => gql(`
mutation newOrder($goods: [OrderGoodInput]) {
  OrderUpsert(order: {orderGoods: ${goods}) {
    _id,
    createdAt,
    total
		orderGoods {
    _id
  	count
  
}
  }
}
`);

const actionOrderUpsert  = () =>
  actionPromise('new order', gqlOrderUpsert());

  
  // {
  //   "goods": [
  //     {
  //       "good": 
  //      {"_id": "62cf2979b74e1f5f2ec1a0ef"},
  //       "count": 1
  //     }
  //   ]
  // }









//getGql

const url = "http://shop-roles.node.ed.asmer.org.ua/graphql";
const gql = getGQL(url);

function getGQL(url = "http://shop-roles.node.ed.asmer.org.ua/graphql") {
  return async function gql(query, variables = {}) {
    const bodyJson = {
      query: query,
      variables: variables
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (typeof localStorage !== 'undefined' && localStorage.authToken) {
      headers.Authorization = "Bearer " + localStorage.authToken;
    }

    const fetchSettings = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyJson)
    };

    try {
      const response = await fetch(url, fetchSettings);
      const data = await response.json();

      if (response.ok) {
        return data; 
      } else {
        throw new Error('Request failed with status ' + response.status);
      }
    } catch (error) {
      throw new Error('Error: ' + error.message);
    }
  };
}



//localStoredReducer

function localStoredReducer(originalReducer, localStorageKey) {
  let initialState = true;

  return function wrapper(state, action) {
    if (initialState) {
      initialState = false;
      const keyData = localStorage.getItem(localStorageKey);

      if (keyData !== null && keyData !== {}) {
        return JSON.parse(keyData);
      }
    }

    const newState = originalReducer(state, action);
    localStorage.setItem(localStorageKey, JSON.stringify(newState));
    return newState;
  };
}

// const store = createStore(localStoredReducer(cartReducer, 'cart'))
// store.subscribe(() => console.log(store.getState()));
// store.dispatch(actionCartAdd({ _id: 'пиво', price: 50 }));
// store.dispatch(actionCartAdd({ _id: 'чіпси', price: 75 }));