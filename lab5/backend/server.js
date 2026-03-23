const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();

// --- 1. НАЛАШТУВАННЯ FIREBASE (Base64 метод) ---
let serviceAccount;

try {
  if (process.env.FIREBASE_BASE64) {
    // Розшифровуємо рядок Base64 назад у JSON
    const buff = Buffer.from(process.env.FIREBASE_BASE64, 'base64');
    const text = buff.toString('utf-8');
    serviceAccount = JSON.parse(text);
    console.log("✅ Firebase: Ініціалізовано через Base64");
  } else {
    serviceAccount = require('./serviceAccountKey.json');
    console.log("🏠 Firebase: Ініціалізовано через файл");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error("❌ ПОМИЛКА FIREBASE:", error.message);
}

const db = admin.firestore();

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

const buildPath = path.resolve(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// --- 3. API МАРШРУТИ ---
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, userEmail, cartItems, total } = req.body;

    if (!cartItems || cartItems.length < 1) {
      return res.status(400).json({ error: "Кошик порожній!" });
    }
    if (cartItems.length > 10) {
      return res.status(400).json({ error: "Забагато страв! Максимум 10." });
    }

    const newOrder = {
      userId,
      userEmail,
      items: cartItems.map(item => item.title).join(', '),
      total: parseFloat(total),
      date: new Date().toLocaleString('uk-UA'),
      status: "Доставлено"
    };

    await db.collection('orders').add(newOrder);
    res.status(201).json({ message: "Замовлення успішно збережено!" });

  } catch (error) {
    res.status(500).json({ error: "Помилка сервера: " + error.message });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const snapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Помилка при читанні історії" });
  }
});

// --- 4. РОЗДАЧА REACT ---
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// --- 5. ЗАПУСК ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер працює на порту ${PORT}`);
});