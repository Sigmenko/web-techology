const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();

// --- НАЛАШТУВАННЯ FIREBASE (Універсальне) ---
let serviceAccount;

try {
  if (process.env.FIREBASE_CONFIG) {
    // Якщо ми на Render, беремо дані зі змінної оточення
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    console.log("Firebase ініціалізовано через Environment Variable");
  } else {
    // Якщо локально, беремо з файлу
    serviceAccount = require('./serviceAccountKey.json');
    console.log("Firebase ініціалізовано через локальний файл");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("Критична помилка ініціалізації Firebase:", error);
}

const db = admin.firestore();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Хостинг статичних файлів React (папка build)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// --- МАРШРУТИ (API) ---

// 1. POST: Збереження замовлення з валідацією (Варіант 12)
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, userEmail, cartItems, total } = req.body;

    // ВАЛІДАЦІЯ: Мінімум 1, максимум 10 страв
    if (!cartItems || cartItems.length < 1) {
      return res.status(400).json({ error: "Кошик порожній!" });
    }
    if (cartItems.length > 10) {
      return res.status(400).json({ error: "Забагато страв! Максимум 10 страв у одному замовленні." });
    }

    const newOrder = {
      userId,
      userEmail,
      items: cartItems.map(item => item.title).join(', '),
      total,
      date: new Date().toLocaleString('uk-UA'),
      status: "Доставлено"
    };

    await db.collection('orders').add(newOrder);
    res.json({ message: "Замовлення успішно оформлено та збережено через сервер!" });

  } catch (error) {
    console.error("Помилка замовлення:", error);
    res.status(500).json({ error: "Помилка при створенні замовлення: " + error.message });
  }
});

// 2. GET: Отримання історії замовлень конкретного юзера
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const snapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Сортуємо за датою (нові зверху)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Помилка при отриманні історії" });
  }
});

// 3. Для всіх інших запитів повертаємо React-додаток (щоб працював роутинг)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер успішно запущено на порту ${PORT}`);
});