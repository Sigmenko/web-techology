const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();

// --- 1. НАЛАШТУВАННЯ FIREBASE (З ФІКСОМ КЛЮЧА) ---
let serviceAccount;

try {
  if (process.env.FIREBASE_CONFIG) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    
    // 🔥 МАГІЧНИЙ ФІКС: Відновлюємо зламані Render'ом переноси рядків у ключі
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    console.log("✅ Firebase: Ініціалізовано через Environment Variable");
  } else {
    serviceAccount = require('./serviceAccountKey.json');
    console.log("🏠 Firebase: Ініціалізовано через локальний файл");
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

// Визначаємо шлях до папки build
const buildPath = path.resolve(__dirname, '../frontend/build');

// Роздаємо статичні файли (CSS, JS, картинки)
app.use(express.static(buildPath));

// --- 3. API МАРШРУТИ ---

// POST: Створення замовлення (Варіант 12)
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

// GET: Отримання історії замовлень
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

// --- 4. ФІНАЛЬНИЙ ФІКС ДЛЯ EXPRESS 5 (УНІВЕРСАЛЬНИЙ) ---
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// --- 5. ЗАПУСК ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер працює на порту ${PORT}`);
});