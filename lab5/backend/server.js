const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();

// --- 1. НАЛАШТУВАННЯ FIREBASE (Безпечний метод) ---
let serviceAccount;

try {
  if (process.env.FIREBASE_CONFIG) {
    // Для Render: беремо дані з Environment Variable
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    console.log("✅ Firebase: Ініціалізовано через Environment Variable");
  } else {
    // Для локальної розробки: беремо з файлу
    serviceAccount = require('./serviceAccountKey.json');
    console.log("🏠 Firebase: Ініціалізовано через локальний файл");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error("❌ КРИТИЧНА ПОМИЛКА FIREBASE:", error.message);
}

const db = admin.firestore();

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Шлях до папки build фронтенду
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// --- 3. API МАРШРУТИ ---

// POST: Створення замовлення (Варіант 12)
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, userEmail, cartItems, total } = req.body;

    // СЕРВЕРНА ВАЛІДАЦІЯ (Вимога пункту 4)
    if (!cartItems || cartItems.length < 1) {
      return res.status(400).json({ error: "Кошик порожній! Додайте хоча б одну страву." });
    }
    
    if (cartItems.length > 10) {
      return res.status(400).json({ 
        error: `Забагато страв! У вас ${cartItems.length}, а дозволено максимум 10.` 
      });
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
    res.status(201).json({ message: "Замовлення успішно оформлено та збережено через сервер!" });

  } catch (error) {
    console.error("Помилка при створенні замовлення:", error);
    res.status(500).json({ error: "Помилка сервера при збереженні: " + error.message });
  }
});

// GET: Отримання історії замовлень (Вимога пункту 3)
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const snapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Сортування: найсвіжіші зверху
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(orders);
  } catch (error) {
    console.error("Помилка при читанні історії:", error);
    res.status(500).json({ error: "Не вдалося отримати історію замовлень" });
  }
});

// --- 4. ОБРОБКА ШЛЯХІВ REACT (Виправлено для Express 5) ---
// Використовуємо синтаксис :splat* або іменований параметр для сумісності з Express 5
app.get('/:path*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send("Помилка завантаження індексу фронтенду. Перевірте, чи зроблено npm run build.");
    }
  });
});

// --- 5. ЗАПУСК ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер працює на порту ${PORT}`);
  console.log(`📂 Статичні файли роздаються з: ${buildPath}`);
});