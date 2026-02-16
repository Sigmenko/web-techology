// 1. База даних страв (Масив об'єктів)
const menuItems = [
    {
        id: 1,
        title: "Піца Маргарита",
        price: 250,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60",
        description: "Класика: томати, моцарела, свіжий базилік."
    },
    {
        id: 2,
        title: "Сет 'Каліфорнія'",
        price: 400,
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=60",
        description: "Ніжний лосось, авокадо, огірок, кунжут."
    },
    {
        id: 3,
        title: "Бургер 'BBQ'",
        price: 180,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60",
        description: "Соковита яловичина, бекон, карамелізована цибуля."
    },
    {
        id: 4,
        title: "Салат Цезар",
        price: 150,
        image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60",
        description: "Куряче філе, пармезан, сухарі, фірмовий соус."
    }
];

// Масив для кошика
let cart = [];

// Масив для історії замовлень (для циклу while)
const ordersHistory = [
    { id: 1234, date: "10.02.2026", items: "Піца Маргарита", total: 300, status: "Виконано" },
    { id: 1230, date: "05.02.2026", items: "Сет 'Каліфорнія'", total: 460, status: "Виконано" }
];

// --- ЗАВДАННЯ 1: Використати цикл for для генерації меню  ---
const menuContainer = document.getElementById('menu-container');

for (let i = 0; i < menuItems.length; i++) {
    const dish = menuItems[i];
    
    // Створюємо картку
    const card = document.createElement('article');
    card.className = 'food-card';
    
    card.innerHTML = `
        <img src="${dish.image}" alt="${dish.title}">
        <div class="card-content">
            <h3>${dish.title}</h3>
            <p>${dish.description}</p>
            <div class="card-bottom">
                <span class="price">${dish.price} грн</span>
                <button onclick="addToCart(${dish.id}, this)">В кошик</button>
            </div>
        </div>
    `;
    
    menuContainer.appendChild(card);
}

// --- ЗАВДАННЯ 1 (частина 2): Цикл while для "Мої замовлення"  ---
const ordersContainer = document.getElementById('orders-container');
let j = 0;
while (j < ordersHistory.length) {
    const order = ordersHistory[j];
    
    const orderCard = document.createElement('article');
    orderCard.className = 'food-card';
    orderCard.innerHTML = `
        <div class="card-content">
            <h3>Замовлення #${order.id}</h3>
            <p style="color:green; font-weight:bold;">✅ ${order.status}</p>
            <p>${order.date}</p>
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
            <p>${order.items}</p>
            <div class="card-bottom">
                <span class="price">${order.total} грн</span>
            </div>
        </div>
    `;
    ordersContainer.appendChild(orderCard);
    j++;
}

// --- Функція додавання в кошик (Зміна кольору кнопки) ---
function addToCart(id, btnElement) {
    // Знаходимо товар
    const item = menuItems.find(product => product.id === id);
    
    // Додаємо в масив кошика
    cart.push(item);
    
    // Оновлюємо відображення кошика
    renderCart();
    
    // Візуальний ефект для кнопки 
    const originalText = btnElement.innerText;
    btnElement.style.backgroundColor = "#2ecc71"; // Зелений колір
    btnElement.innerText = "Додано!";
    
    setTimeout(() => {
        btnElement.style.backgroundColor = ""; // Повертаємо колір
        btnElement.innerText = originalText;
    }, 1000);
}

// Функція відображення кошика (теж цикл for, щоб закріпити)
function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const totalPriceElement = document.getElementById('total-price');
    cartContainer.innerHTML = ''; // Очищаємо перед оновленням
    
    let total = 0;
    
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        total += item.price;
        
        const cartItem = document.createElement('article');
        cartItem.className = 'food-card';
        cartItem.innerHTML = `
             <div class="card-content">
                <h3>${item.title}</h3>
                <span class="price">${item.price} грн</span>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    }
    
    totalPriceElement.innerText = total;
    
    // Якщо в кошику щось є, показуємо кнопку замовлення
    if (cart.length > 0 && !document.getElementById('checkout-btn')) {
        const checkoutBtn = document.createElement('button');
        checkoutBtn.id = 'checkout-btn';
        checkoutBtn.innerText = "Оформити замовлення";
        checkoutBtn.style.marginTop = "20px";
        checkoutBtn.style.width = "100%";
        checkoutBtn.onclick = startTimer; // Запуск таймера
        
        // Вставляємо кнопку після суми
        document.querySelector('#cart').appendChild(checkoutBtn);
    }
}

// --- ЗАВДАННЯ 3: Таймер доставки  ---
function startTimer() {
    const cartSection = document.getElementById('cart');
    
    // Створюємо елемент для таймера
    let timerDisplay = document.getElementById('delivery-timer');
    if (!timerDisplay) {
        timerDisplay = document.createElement('div');
        timerDisplay.id = 'delivery-timer';
        timerDisplay.style.fontSize = '1.5em';
        timerDisplay.style.fontWeight = 'bold';
        timerDisplay.style.color = '#e67e22';
        timerDisplay.style.marginTop = '15px';
        timerDisplay.style.textAlign = 'center';
        cartSection.appendChild(timerDisplay);
    }
    
    let timeLeft = 30; // 30 секунд для тесту (у реальності це хвилини)
    
    const timerInterval = setInterval(() => {
        timerDisplay.innerText = `Очікуйте доставку через: ${timeLeft} сек`;
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timerInterval);
            timerDisplay.innerText = "🚀 Замовлення доставлено! Смачного!";
            timerDisplay.style.color = "green";
            cart = []; // Очистити кошик
            renderCart();
            // Видаляємо кнопку оформлення
            const btn = document.getElementById('checkout-btn');
            if(btn) btn.remove();
        }
    }, 1000);
}