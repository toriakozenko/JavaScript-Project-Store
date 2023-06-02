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
}
  

const actionPending = (name) => {
  return {
    type: 'PROMISE', 
    status: 'PENDING', 
    name
  }
}

const actionFulfilled = (name, payload) => {
  return {
    type: 'PROMISE', 
    status: 'FULFILLED', 
    payload, 
    name 
  }
}

const actionRejected = (name, error) => {
  return {
    type: 'PROMISE', 
    status: 'REJECTED',  
    error, 
    name 
  }
}


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
  console.log(originalReducer, localStorageKey)
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

  if (type === 'CART_ADD' && count > 0){
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
const actionLogin = (login, password) => {
  actionPromise('login', 
    gql(`
    query login($login:String, $password:String) {
      login(login:$login, password:$password)
    }`, 
  {'login': login, 'password': password}));
}
  
  // login 'lola', password 'lala'
  
// повернуло {
//   "data": {
//     "login": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOiI2NDZmYjQ2NDZhZDE3NDIzNThhZWZiOTQiLCJsb2dpbiI6ImxvbCIsImFjbCI6WyI2NDZmYjQ2NDZhZDE3NDIzNThhZWZiOTQiLCJ1c2VyIl19LCJpYXQiOjE2ODUwNDMwNTh9.aHLdCd19vbHzuh02OmknHj34MUIWKWvhbj2hLFkCEyw"
//   }
// }

//Запит на реєстрацію

const actionRegister = (login, password) => {
  actionPromise('registration', 
    gql(`
    mutation Reg($login:String, $password:String){
      UserUpsert(user:{login:$login, password:$password}){_id, login}
    }`, 
  {'login':login, 'password': password}));
}
  
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
  return async function gql(query, variables={}){
    return fetch(endpoint,{
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(store.getState().auth.token?{authorization: "Bearer "+store.getState().auth.token}:{})  
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

  
function LoginFormConstructor(parent){
  this.login = '';
  this.getLogin = () => { 
    return this.login
  };

  this.hideButton = function(value, type) {
    if((type === 'login' && (value === '' || this.p.password === '')) || (type === 'password' && (value === '' || this.login === ''))){
      this.btn.style='visibility:hidden';
    }else {
      this.btn.style='visibility:visible';
    }
  }
  const loginInput=document.createElement('input');
  loginInput.oninput=()=>{
      this.login=loginInput.value;
      this.hideButton(loginInput.value, 'login');
  } 
  const labelTemp=document.createElement('label');
  labelTemp.innerText='Login:';
  labelTemp.style="display: flex; justify-content: space-between; margin-left: 20px;" ;
  parent.appendChild(labelTemp);
  labelTemp.appendChild(loginInput);
  this.p=new Password(parent, true);
  this.p.onChange=(param)=>{
      this.p.password=param;
      this.hideButton(param, 'password');
  }
  this.btn=document.createElement('button');
  this.btn.innerText='Login';
  this.btn.style='visibility:hidden';
  this.btn.onclick=()=>{
      Object.hasOwn(this, 'clickBtn')?this.clickBtn(this.login, this.p.password):'';
  }
  parent.appendChild(this.btn);
}




function Password(parent, open){
  this.password='';
  this.checkbox=open;
  this.setValue=function(data){this.password=data; this.nameTemp.value=data};
  this.getValue=function(){return this.password};
  this.setOpen=function(data){this.checkbox=data; checkTemp.checked=data; data?this.nameTemp.type="text":this.nameTemp.type='password'};
  this.getOpen=function(){return this.checkbox};
  this.nameTemp=document.createElement('input'); 
  this.nameTemp.oninput=()=>Object.hasOwn(this, 'onChange')?this.onChange(this.nameTemp.value):'';
  open?this.nameTemp.type="text":this.nameTemp.type='password';
  this.labelPassword=document.createElement('label');
  this.labelPassword.innerText='Password:';
  this.labelPassword.style="display: flex; justify-content: start; margin-left: 20px" ;
  parent.appendChild(this.labelPassword);
  this.labelPassword.appendChild(this.nameTemp);
  const checkTemp=document.createElement('input'); 
  checkTemp.type='checkbox';
  checkTemp.checked=open;
  checkTemp.oninput=()=>{
      Object.hasOwn(this, 'onOpenChange')?this.onOpenChange(checkTemp.checked):'';
      checkTemp.checked?this.nameTemp.type="text":this.nameTemp.type='password';
  }
  this.labelPassword.appendChild(checkTemp);
}

function recallDate(timeStamp){
  const d=new Date(timeStamp);
  return (d.getDate()<10?'0'+d.getDate():d.getDate())+'.'+(d.getMonth()<9?('0'+(d.getMonth()+1)):(d.getMonth()+1))+'.'+d.getFullYear()+'   '+(d.getHours()<10?'0'+d.getHours():d.getHours())+':'+(d.getMinutes()<10?'0'+d.getMinutes():d.getMinutes());
}

const drawUserInfo = () => {
  const {payload} = store.getState().auth;
  const user = document.getElementById('user');
  if (payload){
      user.innerText=payload.sub.login;
      btnLogin.style='visibility:hidden';
      btnRegister.style='visibility:hidden';
      btnLogout.style='visibility:visible';
      btnOrders.style='visibility:visible';

  }else{
      user.innerText='Неавторизован';
      btnLogin.style='visibility:visible';
      btnRegister.style='visibility:visible';
      btnLogout.style='visibility:hidden';
      btnOrders.style='visibility:hidden';
  } 
}
store.subscribe(drawUserInfo);

btnLogout.onclick=()=>{
  store.dispatch(actionCartClear());
  store.dispatch(actionAuthLogout());
}

const userLogin = ()=> {
  const [,route] = location.hash.split('/');
  if (route !== 'login') return
  if(store.getState().promise.login){
      const {status, payload} = store.getState().promise.login;
      if(status==='FULFILLED' && !payload){
          alert(`Пользователь с таким логином и паролем не существует`);
      }
  }
}
store.subscribe(userLogin);

const stateRegistration = () => {
  const [,route] = location.hash.split('/');
  if (route !== 'register') return;
  if(store.getState().promise.registration){
      const {status, payload} = store.getState().promise.registration;
      if(status==='FULFILLED' && payload){
          alert(`Пользователь успешно создан!`);
          store.dispatch(actionAuthLogin(token));
      } else if(status==='FULFILLED' && !payload){
          alert(`Невозможно создать пользователя с указанным логином`);
      }
  }    
}
store.subscribe(stateRegistration);

const stateOrder = () => {
  const [,route] = location.hash.split('/');
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

    const {status, payload} = store.getState().promise.oneCategoryWithGoods;
    if (status === 'FULFILLED') {
      const {name, goods} = payload;
      
      main.innerHTML = `<h1>${name}</h1>`;

      let good = '';
      for (const {_id, name, images} of goods) {
          good += `
          <div class="goods-card">
            <h3>${name}</h3>
            <img src="http://shop-roles.node.ed.asmer.org.ua/${images[0].url}" alt="card"/>
            <a href="#/good/${_id}">Подробнее</a>
            <button class="goods-card-button">Добавить в корзину</button>
          </div>`;
      };
      main.innerHTML = good;
      const buttonCard = document.querySelectorAll('.goods-card-button');
      buttonCard.forEach((button, index) => {
        button.addEventListener('click', () => {
          const selectedGood = goods[index];
          store.dispatch(actionCartAdd(selectedGood));
        });
      });
    }
  }
  
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
          <span>Цена: ${price}</span>
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


///////////////////////////////////////
// не перевіряно, бо не логіниться поки

/////////////////////

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
    console.log(goodsInCart);
    const arrGoods = [];
    for (key in goodsInCart) {
      arrGoods.push({good:{'_id': goodsInCart[key].good._id}, 'count': goodsInCart[key].count});
    }
    if (arrGoods.length !== 0) {
      dispatch(actionOrderUpsert(arrGoods)); 
    } else {
      alert('Корзина пустая, что ты собрался заказывать?');
    }
  }

  ////////////////////////////////////////////////////////

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

const createOrders =() => {
  const [_, route] = location.hash.split('/');
  if (route !== 'orders') return

  const {status, payload} = store.getState().promise.orders;
  if (status === 'FULFILLED'){
    
    let userOrders = '';
    main.innerHTML = `<h1>Заказы пользователя</h1>`;
    payload.map(item => {
      const {price, good, count} = item.orderGoods[0];
      userOrders += `
      <div class="order-details">
        <h3>${good.name}</h3>
        <span class="order-count">Количество: ${count}</span>
        <span>Цена/шт: ${price} грн.</span>
      </div>`
    })
    main.innerHTML = userOrders;
  }    
}
store.subscribe(createOrders);


  

const createCart = () => {
  const [,route] = location.hash.split('/');
  if (route !== 'cart') return;
  const goodsInCart = store.getState().cart;

  main.innerHTML = `<h1 class="cart-text">Корзина</h1>`;

  let cart = '';  
  for (let key in goodsInCart) {
    if (goodsInCart.hasOwnProperty(key) > 0) {
      let value = goodsInCart[key];
      cart += `
      <div class="order-details">
        <h3>${value.good.name}</h3>
        <span class="order-count">Количество: ${value.count} </span>
        <span>Цена/шт: ${value.good.price} грн.</span>
        <button class=btnForOrder>Заказать</button>
        <button class=btnForClearCart>Очистить корзину</button>
      </div>`
    } 
  }
  main.innerHTML += cart;
  if (Object.keys(goodsInCart).length === 0) {
    main.innerHTML += '<p class="cart-text">Корзина пуста</p>';
  } 

  const btnOrder = document.querySelectorAll('.btnForOrder');
  btnOrder.forEach(btn => {
    btn.addEventListener('click', () => {
      store.dispatch(actionCreateOrder());
    });
  });

  const btnClearCart = document.querySelectorAll('.btnForClearCart');
  btnClearCart.forEach(btn => {
    btn.addEventListener('click', () => {
      store.dispatch(actionCartClear());
    });
  });    
} 
  
store.subscribe(createCart);


//оновляє  цифру товару в іконці в іконкі

const updateCartAmount = () => {
  const stateCart = Object.keys(store.getState().cart).length;
  const goodsInCart = document.querySelector('.goodsInCart');
  if (stateCart > 0) {
    goodsInCart.innerText = stateCart;
  }else goodsInCart.innerText = '';
}
store.subscribe(updateCartAmount);



// onhashchange
window.onhashchange = () => {
  const [,route, _id] = location.hash.split('/')

  const routes = {
    cat() {
      store.dispatch(actionOneCategoryWithGoods(_id));
    },
    good() {
      store.dispatch(ActionGoodsWithDescription(_id))
    },
    login() {
      main.innerHTML = `<h1>Авторизация</h1>`;
      const lForm = new LoginFormConstructor(main);
      lForm.clickBtn = (login, password)=>{
        store.dispatch(actionFullLogin(login, password));
      }
    },
    register() {
      main.innerHTML = `<h1>Регистрация</h1>`;
      const rForm = new LoginFormConstructor(main);
      rForm.btn.innerText = 'Зарегистрировать';
      rForm.clickBtn=(login, password) => {
        store.dispatch(actionFullRegister(login, password));
      }
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