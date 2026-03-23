const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();

// --- 1. НАЛАШТУВАННЯ FIREBASE (Універсальний пошук ключа) ---
let serviceAccount;

try {
  // Шляхи, де може лежати файл на Render та локально
  const paths = [
    '/etc/secrets/serviceAccountKey.json', // Стандарт для Render Secret Files
    path.join(__dirname, '../../../serviceAccountKey.json'), // Корінь репозиторію
    path.join(__dirname, 'serviceAccountKey.json') // Локальна папка backend
  ];

  if (process.env.FIREBASE_CONFIG) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    console.log("✅ Firebase: Ініціалізовано через FIREBASE_CONFIG");
  } else {
    // Шукаємо файл по черзі
    for (const p of paths) {
      try {
        serviceAccount = require(p);
        console.log(`🏠 Firebase: Знайдено файл за шляхом: ${p}`);
        break; 
      } catch (e) {
        continue;
      }
    }
  }

  if (!serviceAccount) {
    throw new Error("Не знайдено жодного джерела для ініціалізації Firebase (ні змінної, ні файлу)");
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
    if (!cartItems || cartItems.length < 1) return res.status(400).json({ error: "Кошик порожній!" });
    if (cartItems.length > 10) return res.status(400).json({ error: "Максимум 10 страв!" });

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
    const snapshot = await db.collection('orders').where('userId', '==', userId).get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Помилка історії" });
  }
});

// --- 4. РОЗДАЧА REACT ---
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// --- 5. ЗАПУСК ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер працює на порту ${PORT}`));