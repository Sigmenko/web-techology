import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// --- ІМПОРТИ FIREBASE ---
import { auth } from './firebase'; // Твій файл налаштувань
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// --- ТИМЧАСОВА БАЗА ДАНИХ (пізніше перенесемо у Firestore) ---
const menuData = [
  { id: 1, title: "Піца Маргарита", price: 250, category: "pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=50" },
  { id: 2, title: "Сет 'Каліфорнія'", price: 400, category: "sushi", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=50" },
  { id: 3, title: "Бургер 'BBQ'", price: 180, category: "burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=50" },
  { id: 4, title: "Салат Цезар", price: 150, category: "salad", image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300&q=50" },
  { id: 5, title: "Кока-Кола", price: 50, category: "drinks", image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=50" }
];

// --- КОМПОНЕНТ: Авторизація (Вхід / Реєстрація) ---
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
  return (
    <div className="card">
      <img src={dish.image} alt={dish.title} />
      <div className="card-header">
        <h3>{dish.title}</h3>
        <button className={`heart-btn ${isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(dish.id)}>Улюблене</button>
      </div>
      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '10px 0' }}>{dish.price} грн</p>
      <button className="add-btn" onClick={() => addToCart(dish)}>Додати в кошик</button>
    </div>
  );
}

// --- КОМПОНЕНТ: Меню ---
function Menu({ favorites, toggleFavorite, addToCart }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');

  let displayedDishes = activeCategory === 'all' ? [...menuData] : menuData.filter(dish => dish.category === activeCategory);
  if (sortOrder === 'asc') displayedDishes.sort((a, b) => a.price - b.price);
  else if (sortOrder === 'desc') displayedDishes.sort((a, b) => b.price - a.price);

  return (
    <div>
      <h2>Наше Меню</h2>
      <div className="filters">
        <span style={{ fontWeight: 'bold', marginRight: '10px', alignSelf: 'center' }}>Категорії:</span>
        <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>Всі</button>
        <button className={activeCategory === 'pizza' ? 'active' : ''} onClick={() => setActiveCategory('pizza')}>Піца</button>
        <button className={activeCategory === 'sushi' ? 'active' : ''} onClick={() => setActiveCategory('sushi')}>Суші</button>
        <button className={activeCategory === 'burger' ? 'active' : ''} onClick={() => setActiveCategory('burger')}>Бургери</button>
        <button className={activeCategory === 'drinks' ? 'active' : ''} onClick={() => setActiveCategory('drinks')}>Напої</button>
      </div>
      <div className="filters" style={{ marginTop: '10px', marginBottom: '30px' }}>
        <span style={{ fontWeight: 'bold', marginRight: '10px', alignSelf: 'center' }}>Сортування:</span>
        <button className={sortOrder === 'default' ? 'active' : ''} onClick={() => setSortOrder('default')}>За замовчуванням</button>
        <button className={sortOrder === 'asc' ? 'active' : ''} onClick={() => setSortOrder('asc')}>Від дешевшого</button>
        <button className={sortOrder === 'desc' ? 'active' : ''} onClick={() => setSortOrder('desc')}>Від дорожчого</button>
      </div>
      <div className="grid">
        {displayedDishes.map(dish => (
          <DishCard key={dish.id} dish={dish} addToCart={addToCart} toggleFavorite={toggleFavorite} isFavorite={favorites.includes(dish.id)} />
        ))}
      </div>
    </div>
  );
}

// --- КОМПОНЕНТ: Кошик ---
function Cart({ cart, removeFromCart, clearCart, addOrder, user }) {
  const [isOrdering, setIsOrdering] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    // ЗАВДАННЯ 12 ВАРІАНТУ: Блокуємо замовлення для гостей
    if (!user) {
      alert("⚠️ Будь ласка, увійдіть в акаунт або зареєструйтесь, щоб оформити замовлення!");
      return;
    }

    setIsOrdering(true);
    setTimeout(() => {
      const newOrder = {
        id: Math.floor(Math.random() * 9000) + 1000,
        date: new Date().toLocaleString(),
        items: cart.map(i => i.title).join(", "),
        total: total,
        status: "Доставлено"
      };
      addOrder(newOrder); 
      clearCart();        
      setIsOrdering(false);
      alert("Замовлення успішно доставлено!");
    }, 3000); 
  };

  if (cart.length === 0) return <div className="empty-msg">Кошик порожній</div>;

  return (
    <div>
      <h2>Ваш Кошик</h2>
      {!user && <p style={{color: 'red', fontWeight: 'bold'}}>Увійдіть в систему, щоб завершити замовлення.</p>}
      {cart.map((item, index) => (
        <div key={index} className="cart-item">
          <div><b>{item.title}</b> <br/><span style={{ color: '#555' }}>{item.price} грн</span></div>
          <button className="remove-btn" onClick={() => removeFromCart(index)}>Видалити</button>
        </div>
      ))}
      <h3 style={{ textAlign: 'right', marginTop: '20px' }}>Разом: {total} грн</h3>
      <button className="checkout-btn" onClick={handleCheckout} disabled={isOrdering}>
        {isOrdering ? "Очікуйте доставку..." : "Оформити замовлення"}
      </button>
    </div>
  );
}

// --- ГОЛОВНИЙ ДОДАТОК ---
function App() {
  const [user, setUser] = useState(null); // Стан для збереження поточного користувача
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('react_cart')) || []);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('react_favorites')) || []);
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('react_orders')) || []);

  // Відстежуємо стан авторизації Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Відписуємось при розмонтуванні
  }, []);

  useEffect(() => { localStorage.setItem('react_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('react_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('react_orders', JSON.stringify(orders)); }, [orders]);

  const addToCart = (dish) => setCart([...cart, dish]);
  const removeFromCart = (indexToRemove) => setCart(cart.filter((_, index) => index !== indexToRemove));
  const clearCart = () => setCart([]);
  const toggleFavorite = (id) => {
    setFavorites(favorites.includes(id) ? favorites.filter(favId => favId !== id) : [...favorites, id]); 
  };

  const handleLogout = async () => {
    await signOut(auth);
    alert("Ви успішно вийшли!");
  };

  return (
    <Router>
      <header>
        <nav style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/">Меню</Link>
            <Link to="/favorites">Улюблені ({favorites.length})</Link>
            <Link to="/cart">Кошик ({cart.length})</Link>
            <Link to="/orders">Історія</Link>
          </div>
          
          <div className="user-info">
            {user ? (
              <>
                <span style={{ color: 'white' }}>{user.email}</span>
                <button className="logout-btn" onClick={handleLogout}>Вийти</button>
              </>
            ) : (
              <Link to="/auth" style={{ background: 'white', color: '#ff6347', padding: '5px 15px', borderRadius: '20px' }}>Увійти</Link>
            )}
          </div>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Menu favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />} />
          <Route path="/favorites" element={<Favorites favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} addOrder={(o) => setOrders([o, ...orders])} user={user} />} />
          <Route path="/auth" element={<AuthForm user={user} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;