const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// 1. Підключення адмінського ключа Firebase
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// Налаштування для обробки запитів
app.use(cors());
app.use(express.json());

// --- ВИМОГА 1: Хостинг статичних файлів ---
// Вказуємо серверу роздавати готові файли нашого React-додатку з папки lab4
app.use(express.static(path.join(__dirname, '../lab4/build')));

// --- ВИМОГА 2: Маршрут GET (Отримання замовлень) ---
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Шукаємо в базі тільки замовлення конкретного юзера
    const snapshot = await db.collection('orders').where('userId', '==', userId).get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    // Сортуємо від найновішого до найстарішого
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Помилка сервера при отриманні замовлень" });
  }
});

// --- ВИМОГА 3: Маршрут POST (Створення замовлення з ВАЛІДАЦІЄЮ) ---
app.post('/api/orders', async (req, res) => {
  try {
    // Отримуємо дані з фронтенду (React)
    const { userId, userEmail, cartItems, total } = req.body;

    // ВАЛІДАЦІЯ (Завдання 12 варіанту): Перевірка кількості страв (від 1 до 10)
    if (!cartItems || cartItems.length < 1) {
      return res.status(400).json({ error: "Кошик порожній! Замовте хоча б одну страву." });
    }
    if (cartItems.length > 10) {
      return res.status(400).json({ error: "Забагато страв! Максимум 10 страв у одному замовленні." });
    }

    // Перетворюємо масив страв на рядок з назвами (як було в 4-й лабі)
    const itemsString = cartItems.map(item => item.title || 'Невідома страва').join(", ");

    // Формуємо об'єкт для збереження у Firestore
    const newOrder = {
      userId,
      userEmail,
      items: itemsString,
      total,
      status: "Доставлено ✅",
      date: new Date().toLocaleString()
    };

    // Зберігаємо в базу
    const docRef = await db.collection('orders').add(newOrder);
    
    // Відправляємо успішну відповідь клієнту
    res.status(201).json({ message: "Замовлення успішно оформлено та збережено через сервер!", id: docRef.id });

  } catch (error) {
    res.status(500).json({ error: "Помилка при створенні замовлення: " + error.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер успішно запущено на порту ${PORT}`);
});