// CONSTS
const aside = document.querySelector(".aside");
const categoriesList = document.querySelector(".good-categories");
const main = document.querySelector(".main-content");


const reducers = {
  promise: promiseReducer,
  auth: localStoredReducer(authReducer, 'authToken'),
  cart: localStoredReducer(cartReducer, 'cart'), 
};

// PROMISE AND ACTIONS

const actionPromise = (name, promise) => {
  return async dispatch => { 
    dispatch(actionPending(name));
    try {
      const payload = await promise;
      dispatch(actionFulfilled(name, payload));
      return payload;
    }
    catch (error) {
      dispatch(actionRejected(name, error));
    }
  };
};
  

const actionPending = (name) => {
  return {
    type: 'PROMISE', 
    status: 'PENDING', 
    name
  }
};

const actionFulfilled = (name, payload) => {
  return {
    type: 'PROMISE', 
    status: 'FULFILLED', 
    payload, 
    name 
  }
};

const actionRejected = (name, error) => {
  return {
    type: 'PROMISE', 
    status: 'REJECTED',  
    error, 
    name 
  }
};


// REDUCERS

const totalReducer = combineReducers(reducers);

function combineReducers(reducers) {
  function totalReducer(state = {}, action) {
    const newTotalState = {};
    for (const [reducerName, reducer] of Object.entries(reducers)) {
      const newSubState = reducer(state[reducerName], action);

      if (newSubState !== state[reducerName]) {
        newTotalState[reducerName] = newSubState;
      }
    }
    if (Object.keys(newTotalState).length) {
      return {
        ...state, 
        ...newTotalState
      };
    }
    return state;
  }

  return totalReducer;
}

function promiseReducer(state = {}, {type, status, payload, error, name}) {
  if (type === 'PROMISE') {
    return {
      ...state, 
      [name]: {status, payload, error}
    };
  }
  return {
    ...state
  };
}

function localStoredReducer(originalReducer, localStorageKey) {
  function wrapper(state, action) {
    if (state === undefined) {
      try {
        return JSON.parse(localStorage[localStorageKey]);
      }
      catch(error){};   
    }
    const stateNew = originalReducer(state, action);
    localStorage[localStorageKey] = JSON.stringify(stateNew);
    return stateNew;
  }
  return wrapper;
}

function cartReducer(state = {}, {type, count, good}) {
  newState = {...state};

  if (type === 'CART_ADD' && count > 0) {
    if (newState[good._id]) {
      newState[good._id].count += count;
    } else {
      newState = {
        ...newState,
        ...{[good._id]: {"count": count, good}}
      };
    }
    return newState;
  }

  if (type === 'CART_SUB' && count > 0) {
    if (newState[good._id]) {
      newState[good._id].count -= count;
      if (newState[good._id].count < 1) {
        delete newState[good._id];
      }
    }
    return newState;
  }
  
  if (type === 'CART_DEL') {
    if (newState[good._id]) {
      delete newState[good._id];
    }
    return newState;
  }

  if (type === 'CART_SET') {
    if (newState[good._id] && count > 0) {
      newState[good._id].count = count;
    } else if (newState[good._id] && count < 1) {
      delete newState[good._id];
    }else if (count > 0) {
      newState = { 
        ...newState, 
        ...{[good._id]:{"count": count, good}}
      };
    }
    return newState;
  }

  if (type === 'CART_CLEAR') {
    localStorage.removeItem('cart');
    return {};
  }
  return state;
}

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


function authReducer(state = {}, {type, token}) {
  if (type === 'AUTH_LOGIN') {
    const payload = jwtDecode(token);
    if (payload) {
      return {
        token, 
        payload
      };
    }
  }

  if (type === 'AUTH_LOGOUT') {
    return {};
  }
  return state;
}

// Actions Login/Logout

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


const actionFullLogin = (login, password) => {
  return async dispatch => {
    const token = await dispatch(actionLogin(login, password));
    if(token) {
      dispatch(actionAuthLogin(token));
    } 
  }
};
  

const actionFullRegister = (login, password) => {
  return async dispatch => {
    await dispatch(actionRegister(login, password));
    dispatch(actionFullLogin(login, password));
  }
};
 
//Запит на логін
const actionLogin = (login, password) =>
  actionPromise('login', 
  gql(`query login($login:String, $password:String){
    login(login:$login, password:$password)
  }`, {'login':login, 'password':password}));

  // login 'lola', password 'lala'
  
// повернуло {
//   "data": {
//     "login": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOiI2NDZmYjQ2NDZhZDE3NDIzNThhZWZiOTQiLCJsb2dpbiI6ImxvbCIsImFjbCI6WyI2NDZmYjQ2NDZhZDE3NDIzNThhZWZiOTQiLCJ1c2VyIl19LCJpYXQiOjE2ODUwNDMwNTh9.aHLdCd19vbHzuh02OmknHj34MUIWKWvhbj2hLFkCEyw"
//   }
// }

//Запит на реєстрацію

const actionRegister = (login, password) =>
  actionPromise('registration', 
  gql(`mutation Reg($login:String, $password:String){
    UserUpsert(user:{login:$login, password:$password}){_id, login}
  }`, {'login':login, 'password':password})
  );

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


// CREATE STORE

function createStore(reducer){
  let state = reducer(undefined, {}); 
  let cbs = [];                     
  
  const getState = () => state;           
  const subscribe = cb => (cbs.push(cb),   
  () => cbs = cbs.filter(c => c !== cb));
                           
  const dispatch  = action => { 
    if (typeof action === 'function'){ 
      return action(dispatch, getState); 
    }
    const newState = reducer(state, action); 
    if (newState !== state){ 
      state = newState;
      for (let cb of cbs) cb(state) 
    }
  }
  return {
    getState,
    dispatch,
    subscribe
  }
}
const store = createStore(totalReducer); 

// GQL
const gql = getGql("http://shop-roles.node.ed.asmer.org.ua/graphql");

function getGql (endpoint){
  return async function gql(query, variables = {}){
    return fetch(endpoint,{
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(store.getState().auth.token ? {authorization : "Bearer " + store.getState().auth.token} : {})  
      },
      body: JSON.stringify({query, variables}),
    }).then(res => res.json())
    .then(res1 => {
      if (!res1.data && res1.errors){
        throw (new Error(JSON.stringify(res1.errors)));
      } else{
        return Object.values(res1.data)[0];
      }
    });
  }
}

// REGISTRATION

const createUserForm = () => {
  const {payload} = store.getState().auth;
  const user = document.getElementById('user');
  const btnOrders = document.getElementById('btnOrders');
  const btnRegister = document.getElementById('btnRegister');
  const btnLogin = document.getElementById('btnLogin');
  
  if (payload) {
    user.innerText = payload.sub.login;
    btnLogin.style='display:none';
    btnRegister.style='display:none';
    btnLogout.style='display:block';
    btnOrders.style='display:block';

  } else{
    user.innerText='is not authorized';
    btnLogin.style='display:block';
    btnRegister.style='display:block';
    btnLogout.style='display:none';
    btnOrders.style='display:none';
  } 
}

store.subscribe(createUserForm);
const btnLogout = document.getElementById('btnLogout');
btnLogout.onclick = () => {
  store.dispatch(actionCartClear());
  store.dispatch(actionAuthLogout());
}

const userLogin = () => {
  const [_,route] = location.hash.split('/');
  if (route !== 'login') return
  if(store.getState().promise.login) {
    const {status, payload} = store.getState().promise.login;
    console.log("promise login", store.getState().promise.login)
    if(status==='FULFILLED' && !payload){
      alert(`User with this username and password does not exist! Try again!`);
    }
  }
}
store.subscribe(userLogin);

const stateRegistration = () => {
  const [_,route] = location.hash.split('/');
  if (route !== 'register') return;
  if(store.getState().promise.registration) {
    const {status, payload} = store.getState().promise.registration;
    if(status === 'FULFILLED' && payload){
      alert(`User successfully registered!`);
      store.dispatch(actionAuthLogin(token));
    } else if(status === 'FULFILLED' && !payload){
      alert(`This username already exists!`);
    }
  }    
}
store.subscribe(stateRegistration);

const stateOrder = () => {
  const [_,route] = location.hash.split('/');
  if (route !== 'cart') return;
  
  if (store.getState().promise.newOrder) {
    const {status, payload} = store.getState().promise.newOrder;
    if (status === 'FULFILLED' && payload && Object.keys(store.getState().cart).length) {
      alert(`Твой заказ создан успешно!`);
      store.dispatch(actionCartClear());
    } else if (status === 'FULFILLED' && !payload) {
      alert(`Твой заказ создать не удалось!`);
    }
  }
}
store.subscribe(stateOrder);




//Запит на перелiк кореневих категорій

const actionRootCategories = () => 
  actionPromise('RootCategories', 
    gql(`query categories($q: String) {
      CategoryFind(query: $q){
        _id
        name
        }
      }`, 
      {q: JSON.stringify([{parent:null}])
    }) 
  );

store.dispatch(actionRootCategories());

store.subscribe (() => {
  const {status, payload} = store.getState().promise.RootCategories;
  if (status === 'FULFILLED' && payload) {
    let categories = '';
    for (const {_id, name} of payload) {
      categories += `<li><a href="#/cat/${_id}">${name}</a></li>`;
    }
    categoriesList.innerHTML = categories;
  }
});


//Запит для отримання однієї категорії з товарами та картинками
const actionOneCategoryWithGoods = (_id) => 
  actionPromise('oneCategoryWithGoods', 
    gql(`query categories($q: String) {
      CategoryFindOne(query: $q){
        _id
        name 
        goods {
          _id, 
          name, 
          price, 
          images {
            url
          }
        }
      }
    }`, 
    {q: JSON.stringify([{_id}])}) 
  );


const CreateCategories = () => {
  const [_, route] = location.hash.split('/');
  if (route !== 'cat') return;

  const { status, payload } = store.getState().promise.oneCategoryWithGoods;
  if (status === 'FULFILLED') {
    const { name, goods } = payload;

    const container = document.createElement('div');
    container.className = 'wrapper';
    container.innerHTML = `<h1>${name}</h1>`;

    let good = '';
    for (const { _id, name, images } of goods) {
      good += `
        <div class="goods-card">
          <h3>${name}</h3>
          <img src="http://shop-roles.node.ed.asmer.org.ua/${images[0].url}" alt="card"/>
          <a href="#/good/${_id}">Подробнее</a>
          <button class="goods-card-button">Добавить в корзину</button>
        </div>`;
    }
    container.innerHTML += good;

    main.innerHTML = '';
    main.appendChild(container);

    const buttonCard = document.querySelectorAll('.goods-card-button');
    buttonCard.forEach((button, index) => {
      button.addEventListener('click', () => {
        const selectedGood = goods[index];
        store.dispatch(actionCartAdd(selectedGood));
      });
    });
  }
};

store.subscribe(CreateCategories);


//Запит на отримання товару з описом та картинками
const ActionGoodsWithDescription = (_id) => 
  actionPromise('GoodsWithDescription', 
    gql(`query categories($q: String){
      GoodFindOne(query:$q){
        _id 
        name 
        price 
        description 
        images {
          url
        }
      }
    }`, 
    {q: JSON.stringify([{_id}])}) 
  );

const CreateGoodsWithDescription = () => {
  const [_, route] = location.hash.split('/');
  if (route !== 'good') return;

  const {status, payload} = store.getState().promise.GoodsWithDescription;
  if (status === 'FULFILLED') {
    const {name, description, price, images} = payload;
    let details = '';
    details += `
      <div class="details-of-good">
        <div class="wrapper-of-good">
          <h3>${name}</h3>
          <img src="http://shop-roles.node.ed.asmer.org.ua/${images[0].url}" alt="card-description"/>
          <p>Описание: ${description}</p>
          <span>Цена: ${price} грн.</span>
          <button class="add-from-details">Добавить в корзину</button>
          <button class="remove-from-details">Удалить с корзины</button>
        </div>
      </div>`
      
      main.innerHTML = details;

      const addToCard = document.querySelector('.add-from-details');
      addToCard.addEventListener('click', () => {
        store.dispatch(actionCartAdd(payload));
      });

      const removeFromCard = document.querySelector('.remove-from-details');
      removeFromCard.addEventListener('click', () => {
        store.dispatch(actionCartSub(payload));
        updateCartAmount();
      })
  }
}
store.subscribe(CreateGoodsWithDescription);


//Запит історії замовлень

const actionHistoryOrders = () =>
  actionPromise('orders', 
    gql(`query orderFind {
      OrderFind(query: "[{}]") {
        _id 
        total 
        orderGoods {
          good {
            _id
            name
          } 
          total
          price 
          count
        }
      }
    }`)
  );

const actionCreateOrder = () =>
  (dispatch, getState)  => {   
    const goodsInCart = getState().cart;
    const arrGoods = [];
    for (key in goodsInCart) {
      arrGoods.push({good:{'_id': goodsInCart[key].good._id}, 'count': goodsInCart[key].count});
    }
    if (arrGoods.length !== 0) {
      dispatch(actionOrderUpsert(arrGoods)); 
    } else return;
  }


//Запит на оформлення замовлення
const actionOrderUpsert = (goods) => 
  actionPromise('newOrder', 
  gql(`mutation newOrder($goods: [OrderGoodInput]) {
    OrderUpsert(order: {orderGoods: $goods}) {
      _id
      createdAt
      total
    }
  }`, 
  {"goods": goods}));




const createOrders = () => {
  const [_, route] = location.hash.split('/');
  if (route !== 'orders') return;

  const { status, payload } = store.getState().promise.orders;
  if (status === 'FULFILLED') {
    let totalPrice = 0;
    let userOrders = '';
    const container = document.createElement('div');
    container.className = 'wrapper';
    container.innerHTML = `<h1>Заказы пользователя</h1>`;

    payload.forEach((order) => {
      order.orderGoods.forEach((item) => {
        const { price, good, count } = item;
        const itemTotalPrice = price * count;
        userOrders += `
          <div class="order-details">
            <h3>${good.name}</h3>
            <span class="order-count">Количество: ${count}</span>
            <span>Цена/шт: ${price} грн.</span>
            <span>Общая стоимость: ${itemTotalPrice} грн.</span>
          </div>`;
        totalPrice += itemTotalPrice;
      });
    });

    container.innerHTML += userOrders;
    main.innerHTML = '';
    main.appendChild(container);
  }
};

store.subscribe(createOrders);


const createCart = () => {
  const [_, route] = location.hash.split('/');
  if (route !== 'cart') return;
  const goodsInCart = store.getState().cart;

  main.innerHTML = `<h1 class="cart-text">Корзина</h1>`;

  let cart = '';
  for (let key in goodsInCart) {
    if (goodsInCart.hasOwnProperty(key) > 0) {
      let value = goodsInCart[key];
      const totalPrice = value.count * value.good.price; 
      cart += `
      <div class="cart-details">
        <h3>${value.good.name}</h3>
        <span class="order-count">Количество: 
          <button class="btnDecrease" data-good-id="${key}">-</button>
          <span class="count">${value.count}</span>
          <button class="btnIncrease" data-good-id="${key}">+</button>
        </span>
        <span>Цена/шт: ${value.good.price} грн.</span>
        <span>Общая цена: ${totalPrice} грн.</span>
        <button class="btnRemove" data-good-id="${key}">Удалить</button>
      </div>`

    }
  }
  main.innerHTML += cart;

  if (Object.keys(goodsInCart).length === 0) {
    main.innerHTML += '<p class="cart-text">Корзина пустая</p>';
  } else {
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';
  
    const btnOrder = document.createElement('button');
    btnOrder.innerText = 'Заказать';
    btnOrder.className = 'btnForOrder';
    btnOrder.addEventListener('click', () => {
      store.dispatch(actionCreateOrder());
      main.remove(btnOrder);
      main.remove(btnClearCart);
    });

    const btnClearCart = document.createElement('button');
    btnClearCart.innerText = 'Очистить корзину';
    btnClearCart.className = 'btnForClearCart';
    btnClearCart.addEventListener('click', () => {
      store.dispatch(actionCartClear());
      main.remove(btnOrder);
      main.remove(btnClearCart);
    });
    btnContainer.appendChild(btnOrder);
    btnContainer.appendChild(btnClearCart);
    main.append(btnContainer);
  }

  const btnIncrease = document.querySelectorAll('.btnIncrease');
  btnIncrease.forEach(btn => {
    btn.addEventListener('click', () => {
      const goodId = btn.dataset.goodId;
      store.dispatch(actionCartAdd(goodsInCart[goodId].good));
    });
  });

  const btnDecrease = document.querySelectorAll('.btnDecrease');
  btnDecrease.forEach(btn => {
    btn.addEventListener('click', () => {
      const goodId = btn.dataset.goodId;
      store.dispatch(actionCartSub(goodsInCart[goodId].good));
    });
  });

  const btnRemove = document.querySelectorAll('.btnRemove');
  btnRemove.forEach(btn => {
    btn.addEventListener('click', () => {
      const goodId = btn.dataset.goodId;
      store.dispatch(actionCartDel(goodsInCart[goodId].good));
    });
  });
}

store.subscribe(createCart);


//оновляє  цифру товару в іконці 

const  updateCartAmount = () => {
  const stateCart = Object.keys(store.getState().cart).length;
  const goodsInCart = document.getElementById('goodsInCart');
  if(stateCart) {
    goodsInCart.innerText = stateCart;
  } else goodsInCart.innerText = '';
}
store.subscribe(updateCartAmount);

// onhashchange
window.onhashchange = () => {
  const [_,route, _id] = location.hash.split('/')

  const routes = {
    cat() {
      store.dispatch(actionOneCategoryWithGoods(_id));
    },
    good() {
      store.dispatch(ActionGoodsWithDescription(_id));
    },
    login() {
      main.innerHTML = `<h1 class='form-title'>Авторизация</h1>`;
      createForm(main, 'login');
    },
    register() {
      main.innerHTML = `<h1 class='form-title'>Регистрация</h1>`;
      createForm(main, 'register');
    },
    orders() {
      store.dispatch(actionHistoryOrders());
    },
    cart() {
      createCart();
    },
  }

  if (route in routes) {
    routes[route]()
  }
}

// Reg/Auth form
function createForm(parent, action){
  const container = document.createElement('div');
  container.setAttribute('class', 'form-container');

  const loginInput = document.createElement('input');
  loginInput.placeholder = 'Enter login';
  loginInput.type = 'text';
  loginInput.setAttribute('class', 'loginInput');

  const passwordInput = document.createElement('input');
  passwordInput.placeholder = 'Enter password';
  passwordInput.type = 'text';
  passwordInput.setAttribute('class', 'passwordInput');

  const button = document.createElement('button');
  button.type = 'submit';
  button.innerText = 'Submit';
  button.onclick = function() {
    if(action === 'login') {
      store.dispatch(actionFullLogin(loginInput.value, passwordInput.value));
      loginInput.value = '';
      passwordInput.value = '';
    } else {
      store.dispatch(actionFullRegister(loginInput.value, passwordInput.value));
      loginInput.value = '';
      passwordInput.value = '';
    }
  }
  container.append(loginInput, passwordInput, button);
  parent.appendChild(container);
}


function jwtDecode(token) {
  let arr = [];
  if (typeof(token) !== "string") {
    return undefined;
  }  
  arr = token.split('.');
  if (arr.length !== 3) {
    return undefined;
  }
  try {
    return JSON.parse(atob(arr[1]));
  }
  catch{
    return undefined;
  } 
}
window.onhashchange();