import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

const menuData = [
  { id: 1, title: "Піца Маргарита", price: 250, category: "pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=50" },
  { id: 2, title: "Сет 'Каліфорнія'", price: 400, category: "sushi", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=50" },
  { id: 3, title: "Бургер 'BBQ'", price: 180, category: "burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=50" },
  { id: 4, title: "Салат Цезар", price: 150, category: "salad", image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300&q=50" },
  { id: 5, title: "Кока-Кола", price: 50, category: "drinks", image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=50" }
];

function DishCard({ dish, addToCart, toggleFavorite, isFavorite }) {
  return (
    <div className="card">
      <img src={dish.image} alt={dish.title} />
      <div className="card-header">
        <h3>{dish.title}</h3>
        <button 
          className={`heart-btn ${isFavorite ? 'active' : ''}`} 
          onClick={() => toggleFavorite(dish.id)}
        >
          Улюблене
        </button>
      </div>
      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '10px 0' }}>{dish.price} грн</p>
      <button className="add-btn" onClick={() => addToCart(dish)}>Додати в кошик</button>
    </div>
  );
}

function Menu({ favorites, toggleFavorite, addToCart }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');

  let displayedDishes = activeCategory === 'all' 
    ? [...menuData] 
    : menuData.filter(dish => dish.category === activeCategory);

  if (sortOrder === 'asc') {
    displayedDishes.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'desc') {
    displayedDishes.sort((a, b) => b.price - a.price);
  }

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
          <DishCard 
            key={dish.id} 
            dish={dish} 
            addToCart={addToCart} 
            toggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(dish.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Favorites({ favorites, toggleFavorite, addToCart }) {
  const favoriteDishes = menuData.filter(dish => favorites.includes(dish.id));

  if (favoriteDishes.length === 0) return <div className="empty-msg">Ви ще не додали жодної страви до улюблених</div>;

  return (
    <div>
      <h2>Ваші обрані страви</h2>
      <div className="grid">
        {favoriteDishes.map(dish => (
          <DishCard 
            key={dish.id} 
            dish={dish} 
            addToCart={addToCart} 
            toggleFavorite={toggleFavorite}
            isFavorite={true}
          />
        ))}
      </div>
    </div>
  );
}

function Cart({ cart, removeFromCart, clearCart, addOrder }) {
  const [isOrdering, setIsOrdering] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
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
      {cart.map((item, index) => (
        <div key={index} className="cart-item">
          <div>
            <b>{item.title}</b> <br/>
            <span style={{ color: '#555' }}>{item.price} грн</span>
          </div>
          <button className="remove-btn" onClick={() => removeFromCart(index)}>Видалити</button>
        </div>
      ))}
      <h3 style={{ textAlign: 'right', marginTop: '20px' }}>Разом: {total} грн</h3>
      
      <button 
        className="checkout-btn" 
        onClick={handleCheckout} 
        disabled={isOrdering}
      >
        {isOrdering ? "Очікуйте доставку..." : "Оформити замовлення"}
      </button>
    </div>
  );
}

function OrderList({ orders }) {
  if (orders.length === 0) return <div className="empty-msg">Історія порожня</div>;

  return (
    <div>
      <h2>Історія замовлень</h2>
      {orders.map(order => (
        <div key={order.id} className="order-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <p style={{ color: 'green', fontWeight: 'bold', margin: '0 0 10px 0' }}>{order.status}</p>
          <p style={{ margin: '0 0 5px 0' }}><b>Замовлення #{order.id}</b> <span style={{ color: '#777', fontSize: '0.9em' }}>({order.date})</span></p>
          <p style={{ margin: '0 0 10px 0' }}>{order.items}</p>
          <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.1rem' }}>Сума: {order.total} грн</p>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('react_cart')) || []);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('react_favorites')) || []);
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('react_orders')) || []);

  useEffect(() => { localStorage.setItem('react_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('react_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('react_orders', JSON.stringify(orders)); }, [orders]);

  const addToCart = (dish) => setCart([...cart, dish]);
  const removeFromCart = (indexToRemove) => setCart(cart.filter((_, index) => index !== indexToRemove));
  const clearCart = () => setCart([]);

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id)); 
    } else {
      setFavorites([...favorites, id]); 
    }
  };

  return (
    <Router>
      <header>
        <nav>
          <Link to="/">Меню</Link>
          <Link to="/favorites">Улюблені ({favorites.length})</Link>
          <Link to="/cart">Кошик ({cart.length})</Link>
          <Link to="/orders">Історія</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Menu favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />} />
          <Route path="/favorites" element={<Favorites favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} addOrder={(o) => setOrders([o, ...orders])} />} />
          <Route path="/orders" element={<OrderList orders={orders} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;