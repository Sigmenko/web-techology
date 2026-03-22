import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// --- ІМПОРТИ FIREBASE (Залишаємо тільки для логіну та меню) ---
import { auth, db } from './firebase'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

const getSafePrice = (price) => {
  if (!price) return 0;
  const parsed = parseFloat(String(price).replace(/[^\d.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

// --- КОМПОНЕНТ: Авторизація ---
function AuthForm({ user }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Успішний вхід!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Акаунт успішно створено!");
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      alert("Помилка: " + error.message);
    }
  };

  if (user) {
    return (
      <div className="auth-container">
        <h2>Ви вже увійшли в систему</h2>
        <p>Ваш email: {user.email}</p>
        <Link to="/"><button className="auth-btn">Перейти до меню</button></Link>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
        <button type="submit" className="auth-btn">{isLogin ? 'Увійти' : 'Зареєструватися'}</button>
      </form>
      <button className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Немає акаунту? Створити' : 'Вже є акаунт? Увійти'}
      </button>
    </div>
  );
}

// --- КОМПОНЕНТ: Картка страви ---
function DishCard({ dish, addToCart, toggleFavorite, isFavorite }) {
  const safePrice = getSafePrice(dish.price);
  return (
    <div className="card">
      <img src={dish.image} alt={dish.title || 'Страва'} />
      <div className="card-header">
        <h3>{dish.title || 'Без назви'}</h3>
        <button className={`heart-btn ${isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(dish.id)}>❤</button>
      </div>
      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '10px 0' }}>{safePrice} грн</p>
      <button className="add-btn" onClick={() => addToCart(dish)}>Додати в кошик</button>
    </div>
  );
}

// --- КОМПОНЕНТ: Меню ---
function Menu({ favorites, toggleFavorite, addToCart, menuData }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');

  if (menuData.length === 0) return <h2>Завантаження меню з бази даних...</h2>;

  let displayedDishes = menuData.filter(dish => {
    const title = dish.title || "";
    const search = searchTerm || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });
  
  if (activeCategory !== 'all') {
    displayedDishes = displayedDishes.filter(dish => dish.category === activeCategory);
  }

  if (sortOrder === 'asc') {
    displayedDishes.sort((a, b) => getSafePrice(a.price) - getSafePrice(b.price));
  } else if (sortOrder === 'desc') {
    displayedDishes.sort((a, b) => getSafePrice(b.price) - getSafePrice(a.price));
  } else if (sortOrder === 'name_asc') {
    displayedDishes.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (sortOrder === 'name_desc') {
    displayedDishes.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2>Наше Меню</h2>
        <input type="text" placeholder="🔍 Пошук страв..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '250px' }} />
      </div>

      <div className="filters">
        <span style={{ fontWeight: 'bold', marginRight: '10px', alignSelf: 'center' }}>Категорії:</span>
        <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>Всі</button>
        <button className={activeCategory === 'pizza' ? 'active' : ''} onClick={() => setActiveCategory('pizza')}>Піца</button>
        <button className={activeCategory === 'sushi' ? 'active' : ''} onClick={() => setActiveCategory('sushi')}>Суші</button>
        <button className={activeCategory === 'burger' ? 'active' : ''} onClick={() => setActiveCategory('burger')}>Бургери</button>
        <button className={activeCategory === 'salad' ? 'active' : ''} onClick={() => setActiveCategory('salad')}>Салати</button>
        <button className={activeCategory === 'drinks' ? 'active' : ''} onClick={() => setActiveCategory('drinks')}>Напої</button>
      </div>

      <div className="grid">
        {displayedDishes.length > 0 ? (
          displayedDishes.map(dish => (
            <DishCard key={dish.id} dish={dish} addToCart={addToCart} toggleFavorite={toggleFavorite} isFavorite={favorites.includes(dish.id)} />
          ))
        ) : (
          <p style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>За вашим запитом нічого не знайдено 😢</p>
        )}
      </div>
    </div>
  );
}

// --- КОМПОНЕНТ: Улюблені ---
function Favorites({ favorites, toggleFavorite, addToCart, menuData, user }) {
  if (!user) {
    return <div className="empty-msg" style={{color: 'red', fontWeight: 'bold'}}>⚠️ Будь ласка, увійдіть в акаунт, щоб переглядати улюблені страви.</div>;
  }
  const favoriteDishes = menuData.filter(dish => favorites.includes(dish.id));
  if (favoriteDishes.length === 0) return <div className="empty-msg">Ви ще не додали жодної страви до улюблених</div>;
  return (
    <div>
      <h2>Ваші обрані страви</h2>
      <div className="grid">
        {favoriteDishes.map(dish => (
          <DishCard key={dish.id} dish={dish} addToCart={addToCart} toggleFavorite={toggleFavorite} isFavorite={true} />
        ))}
      </div>
    </div>
  );
}

// --- КОМПОНЕНТ: Кошик ---
function Cart({ cart, removeFromCart, clearCart, user, fetchOrders }) {
  const [isOrdering, setIsOrdering] = useState(false);
  const total = cart.reduce((sum, item) => sum + getSafePrice(item.price), 0);

  const handleCheckout = async () => {
    if (!user) {
      alert("Будь ласка, увійдіть в акаунт або зареєструйтесь, щоб оформити замовлення!");
      return;
    }
    setIsOrdering(true);
    
    try {
      // РОБИМО POST-ЗАПИТ НА ВІДНОСНИЙ ШЛЯХ
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          cartItems: cart, 
          total: total
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert("⚠️ Помилка: " + data.error);
      } else {
        clearCart();
        fetchOrders(); 
        alert(data.message);
      }
    } catch (error) {
      alert("Помилка з'єднання з сервером.");
    }
    setIsOrdering(false);
  };

  if (cart.length === 0) return <div className="empty-msg">Кошик порожній 🛒</div>;

  return (
    <div>
      <h2>Ваш Кошик</h2>
      {!user && <p style={{color: 'red', fontWeight: 'bold'}}>Увійдіть в систему, щоб завершити замовлення.</p>}
      {cart.map((item, index) => (
        <div key={index} className="cart-item">
          <div><b>{item.title}</b> <br/><span style={{ color: '#555' }}>{getSafePrice(item.price)} грн</span></div>
          <button className="remove-btn" onClick={() => removeFromCart(index)}>Видалити</button>
        </div>
      ))}
      <h3 style={{ textAlign: 'right', marginTop: '20px' }}>Разом: {total} грн</h3>
      <button className="checkout-btn" onClick={handleCheckout} disabled={isOrdering}>
        {isOrdering ? "Обробка..." : "Оформити замовлення"}
      </button>
    </div>
  );
}

// --- КОМПОНЕНТ: Історія замовлень ---
function OrderList({ orders, user }) {
  if (!user) return <div className="empty-msg" style={{color: 'red', fontWeight: 'bold'}}>⚠️ Увійдіть в акаунт, щоб побачити історію замовлень.</div>;
  if (orders.length === 0) return <div className="empty-msg">Ваша історія порожня 📝</div>;

  return (
    <div>
      <h2>Ваша історія замовлень</h2>
      {orders.map(order => (
        <div key={order.id} className="order-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <p style={{ color: 'green', fontWeight: 'bold', margin: '0 0 10px 0' }}>{order.status}</p>
          <p style={{ margin: '0 0 5px 0' }}><b>{order.date}</b></p>
          <p style={{ margin: '0 0 10px 0' }}>{order.items}</p>
          <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.1rem' }}>Сума: {order.total} грн</p>
        </div>
      ))}
    </div>
  );
}

// --- ГОЛОВНИЙ ДОДАТОК ---
function App() {
  const [user, setUser] = useState(null);
  const [menuData, setMenuData] = useState([]); 
  const [orders, setOrders] = useState([]); 
  
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('react_cart')) || []);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('react_favorites')) || []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menu"));
        setMenuData(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Помилка завантаження меню:", error);
      }
    };
    fetchMenu();
  }, []);

  // ТЯГНЕМО ІСТОРІЮ ЧЕРЕЗ ВІДНОСНИЙ ШЛЯХ (GET запит)
  const fetchOrders = async () => {
    if (user) {
      try {
        const response = await fetch(`/api/orders/${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Помилка завантаження історії:", error);
      }
    } else {
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { localStorage.setItem('react_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('react_favorites', JSON.stringify(favorites)); }, [favorites]);

  const addToCart = (dish) => setCart([...cart, dish]);
  const removeFromCart = (indexToRemove) => setCart(cart.filter((_, index) => index !== indexToRemove));
  const clearCart = () => setCart([]);
  
  const toggleFavorite = (id) => {
    if (!user) {
      alert("⚠️ Будь ласка, увійдіть в акаунт, щоб додавати страви до улюблених!");
      return;
    }
    setFavorites(favorites.includes(id) ? favorites.filter(favId => favId !== id) : [...favorites, id]); 
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Router>
      <header>
        <nav style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/">🍕 Меню</Link>
            <Link to="/favorites">❤ Улюблені ({favorites.length})</Link>
            <Link to="/cart">🛒 Кошик ({cart.length})</Link>
            <Link to="/orders">📜 Історія</Link>
          </div>
          
          <div className="user-info">
            {user ? (
              <>
                <span style={{ color: 'white' }}>{user.email}</span>
                <button className="logout-btn" onClick={handleLogout}>Вийти</button>
              </>
            ) : (
              <Link to="/auth" style={{ background: 'white', color: '#ff6347', padding: '5px 15px', borderRadius: '20px', textDecoration: 'none' }}>Увійти</Link>
            )}
          </div>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Menu menuData={menuData} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />} />
          <Route path="/favorites" element={<Favorites menuData={menuData} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} user={user} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} user={user} fetchOrders={fetchOrders} />} />
          <Route path="/orders" element={<OrderList orders={orders} user={user} />} />
          <Route path="/auth" element={<AuthForm user={user} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;