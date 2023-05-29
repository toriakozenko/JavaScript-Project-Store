// CONSTS
const aside = document.querySelector(".aside");
const categoriesList = document.querySelector(".good-categories");
const main = document.querySelector(".main-content");



const reducers = {
  promise: promiseReducer,
  auth: localStoredReducer(authReducer, 'authToken'),
  cart: localStoredReducer(cartReducer, 'cart'), 
};

const actionPromise = (promiseName, promise) => {
  return async dispatch => { 
    dispatch(actionPending(promiseName)); 
    try{
      const payload = await promise; 
      // console.log("payload", payload)
      dispatch(actionFulfilled(promiseName, payload)); 
      return payload; 
    }
    catch (error){
      dispatch(actionRejected(promiseName, error)); 
    }
  }
};

// Reducers
const totalReducer = combineReducers(reducers);

function combineReducers(reducers){
  function totalReducer(totalState = {}, action){
      const newTotalState = {};
      
      for (const [reducerName, childReducer] of Object.entries(reducers)) {
          const newState = childReducer(totalState[reducerName], action) 
          if (newState !== totalState[reducerName]){ 
            newTotalState[reducerName] = newState 
          }
      }
          
      if (Object.values(newTotalState).length){
          return {...totalState, ...newTotalState} 
      }
      
      return totalState 
  }
  
  return totalReducer
}

// Promise Reducer
function promiseReducer( state = {}, {type, promiseName, status, payload, error}){
  if (type === 'PROMISE'){
    return {
      ...state,
      state: {[promiseName]: {status, payload, error}}
    } 
  }
  return state;
}

// Actions
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

// authReducer

function authReducer(state = {}, {token, type}) {
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

// Actions 

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

//CardReducer

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

// Actions

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

const store = createStore(totalReducer); 


 

// для розкодовки токена

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


//getGql


// const url = "http://shop-roles.node.ed.asmer.org.ua/graphql";
// const gql = getGQL(url);

// function getGQL(url) {
//   return async function gql(query, variables = {}) {
//     const bodyJson = {
//       query: query,
//       variables: variables
//     };

//     const headers = {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     };

//     if (typeof localStorage !== 'undefined' && localStorage.authToken) {
//       headers.Authorization = "Bearer " + localStorage.authToken;
//     }

//     const fetchSettings = {
//       method: 'POST',
//       headers: headers,
//       body: JSON.stringify(bodyJson)
//     };

//     try {
//       const response = await fetch(url, fetchSettings);
//       const data = await response.json();

//       if (response.ok) {
//         return data; 
//       } else {
//         throw new Error('Request failed with status ' + response.status);
//       }
//     } catch (error) {
//       throw new Error('Error: ' + error.message);
//     }
//   };
// }
const gql=getGql("http://shop-roles.node.ed.asmer.org.ua/graphql");
function getGql (endpoint){
    return function gql(query, variables={}){
        return fetch(endpoint,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(store.getState().auth.token?{authorization: "Bearer "+store.getState().auth.token}:{})  
            },
            body: JSON.stringify({query, variables}),
        }).then(res => res.json())
            .then(res1=>{
                if(!res1.data && res1.errors){
                    throw(new Error(JSON.stringify(res1.errors)));
                }else{
                    return Object.values(res1.data)[0];
                }
            });
    }
}
//GraphQL запити

//Запит на перелiк кореневих категорій

const gqlRootCats = () => {
  const rootCategories = `
  query categories($query: String) {
    CategoryFind(query: $query) {
      _id
      name
    }
  }`
   
  return gql(rootCategories, {"query": '[{\"parent\": null}]'});
};

store.dispatch(actionPromise("rootCats", gqlRootCats()));
store.subscribe(() => {
  const {status, payload} = store.getState()?.promise?.state?.rootCats;
  console.log('state', store.getState())
  if (status === 'FULFILLED' && payload) {
    let categories = "";
    for (const {_id, name} of payload){
      categories += `<li><a href="#/cat/${_id}">${name}</a></li>`;
    }
    categoriesList.innerHTML = categories;
  }
})


//Запит для отримання однієї категорії з товарами та картинками
const gqlOneCatWithGoods = (id) => {

  const oneCategoriesWithGoods = `
  query oneCatWithGoods($query: String) {
    CategoryFindOne(query: $query)
      {
        _id,
        name,
        image {
          url
        }
        goods {
          _id,
            name,
            images {
            url
          }
        }
      }
    }
  `
  return gql(oneCategoriesWithGoods, { query: JSON.stringify([{ _id: `${id}` }]) });

};


store.dispatch(actionPromise("oneCatWithGoods", gqlOneCatWithGoods(`62ce8a8fb74e1f5f2ec1a0ec`)));

// query: "[{\"_id\":\"62ce8a8fb74e1f5f2ec1a0ec\"}]"


const drawCat = () => {
  const [,route] = location.hash.split('/');
  if (route !== 'cat') return
  console.log(store.getState())

  const {status, payload} = store.getState().promise.CatById || {};

  // console.log(store.getState().promise.CatById)

  if (status === 'PENDING'){
      main.innerHTML = `<img src='https://cdn.dribbble.com/users/63485/screenshots/1309731/infinite-gif-preloader.gif'/>`
  }
  if (status === 'FULFILLED'){
      const {name, goods} = payload;
      main.innerHTML = `<h1>${name}</h1>`;
      for (const {_id, name, price, images} of goods){
          const tempA = document.createElement('a');
          tempA.href=`#/good/${_id}`;
          tempA.innerText=`${name}`;
          main.appendChild(tempA);
          const tempName=document.createElement('p');
          main.appendChild(tempName);
          const tempImg=document.createElement('img');
          tempImg.src=`http://shop-roles.node.ed.asmer.org.ua/${images[0].url}`;
          tempImg.style=`width: 30%`;
          main.appendChild(tempImg);
          const tempBtn = document.createElement('button');
          tempBtn.innerText='Добавить в корзину';
          main.appendChild(tempBtn);
          const tempBr=document.createElement('br');
          main.append(tempBr);
          tempBtn.addEventListener('click', ()=>{
              store.dispatch(actionCartAdd({_id, name, price, images}));
          });
      }
  }
}
store.subscribe(() => {
  drawCat()
  console.log(store.getState())
});



//Запит на отримання товару з описом та картинками
const gqlOneGood = (id) => {
  const oneCategoriesWithImages = `
  query oneGood($query: String) {
    GoodFindOne(query: $query)
    {
        _id
        name
        description
        images {
          url
        }
      }
    }
  `
  return gql(oneCategoriesWithImages, { query: JSON.stringify([{ _id: `${id}` }]) });
};

const actionGoodFindOne = () =>
  actionPromise('goodFindOne', gqlOneGood(id));

// query: "[{\"_id\":\"62cf2979b74e1f5f2ec1a0ef\"}]"



//Запит на реєстрацію

const gqlUserUpsert = (login, password) => {
  const mutationLoginAndPassword = `
  mutation register($login:String, $password: String){
    UserUpsert(user: {login: ${login}, password: ${password}}){
      _id 
      login 
      createdAt
    }
  }
  `
  return gql(mutationLoginAndPassword, {login: `${login}`, password: `${password}`});
};




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

const gqlQueryLogin = (login, password) => {
  const queryLogin = `
  query login($login: String, $password: String){
    login(login: ${login}, password: ${password})
  }
  `
  return gql(queryLogin, {login: `${login}`, password: `${password}`});
};

const actionQueryLogin = () =>
  actionPromise('login', gqlQueryLogin(login, password));

// повернуло {
//   "data": {
//     "login": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOiI2NDZmYjQ2NDZhZDE3NDIzNThhZWZiOTQiLCJsb2dpbiI6ImxvbCIsImFjbCI6WyI2NDZmYjQ2NDZhZDE3NDIzNThhZWZiOTQiLCJ1c2VyIl19LCJpYXQiOjE2ODUwNDMwNTh9.aHLdCd19vbHzuh02OmknHj34MUIWKWvhbj2hLFkCEyw"
//   }
// }


//Запит історії замовлень

const gqlQueryHistoryOrder = () => {
  const queryOrderHistory = `
  query historyOrder($query: String){
    OrderFind(query: $query) {
       _id
       total
    }
  }
  `
  return gql(queryOrderHistory, { query: "[{}]" });
};


const actionQueryHistoryOrder = () =>
  actionPromise('order history', gqlQueryHistoryOrder());

// повернуло:
// {
//   "data": {
//     "OrderFind": [
//       {
//         "_id": "64711c796ad1742358aefba0",
//         "total": 0
//       }
//     ]
//   }
// }

//Запит на оформлення замовлення

const gqlOrderUpsert  = (goods) => {
  const newOrder = `
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
  `
  return gql(newOrder, { goods: [{ good: { _id: `${id}` }, count: `${count}`}]});
};

const actionOrderUpsert  = () =>
  actionPromise('new order', gqlOrderUpsert());

  
  // variables: {
  //   "goods": [
  //     {
  //       "good": 
  //      {"_id": "62cf2979b74e1f5f2ec1a0ef"},
  //       "count": 1
  //     }
  //   ]
  // }

// повернуло
// {
//   "data": {
//     "OrderUpsert": {
//       "_id": "64711c796ad1742358aefba0",
//       "createdAt": "1685134457000",
//       "total": 0
//     }
  





//localStoredReducer

function localStoredReducer(originalReducer, localStorageKey){
  function wrapper(state, action){
    if(state === undefined){
      try {
        return JSON.parse(localStorage[localStorageKey]);
      }
      catch(error){
      }    
    }
    const stateNew = originalReducer(state, action);
    localStorage[localStorageKey]=JSON.stringify(stateNew);
    return stateNew;
  }
  return wrapper;
}

// const store = createStore(localStoredReducer(cartReducer, 'cart'))
// store.subscribe(() => console.log(store.getState()));
// store.dispatch(actionCartAdd({ _id: 'пиво', price: 50 }));
// store.dispatch(actionCartAdd({ _id: 'чіпси', price: 75 }));





//Thunk "FUll LOGIN"

const actionFullLogin = (login, password) => {
  return async (dispatch) => {
    const token = await dispatch(gqlQueryLogin(login, password));
    if(token) {
      dispatch(actionAuthLogin(token));
    };
  }
}
 

// Thunk "Registration"
const actionFullRegister = (login, password) => {
  return async (dispatch) => {
    await dispatch(gqlUserUpsert(login, password));
    dispatch(actionFullLogin(login, password));
  }
}
  
//Thunk "Ordering"







