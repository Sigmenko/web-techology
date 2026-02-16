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

let cart = []; 

const ordersHistory = [
    { id: 1234, date: "10.02.2026", items: "Піца Маргарита", total: 300, status: "Виконано" },
    { id: 1230, date: "05.02.2026", items: "Сет 'Каліфорнія'", total: 460, status: "Виконано" }
];

// --- 3. ГЕНЕРАЦІЯ МЕНЮ (ЦИКЛ FOR) ---
const menuContainer = document.getElementById('menu-container');

// Виконуємо вимогу: "Використати цикл for для генерації списку страв у меню"
for (let i = 0; i < menuItems.length; i++) {
    const dish = menuItems[i];
    
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

const ordersContainer = document.getElementById('orders-container');
let j = 0;

// Виконуємо вимогу: "цикл while у списку Мої замовлення"
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

function addToCart(id, btnElement) {
    const item = menuItems.find(product => product.id === id);
    
    cart.push(item);
    
    renderCart();
    
    const originalText = btnElement.innerText;
    btnElement.style.backgroundColor = "#2ecc71";
    btnElement.innerText = "Додано!";
    
    setTimeout(() => {
        btnElement.style.backgroundColor = ""; 
        btnElement.innerText = originalText;
    }, 1000);
}

function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const totalPriceElement = document.getElementById('total-price');
        cartContainer.innerHTML = '';
    
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; color:#777;">Кошик порожній</p>';
        totalPriceElement.innerText = '0';
        const existingBtn = document.getElementById('checkout-btn');
        if (existingBtn) existingBtn.remove();
        return;
    }

    // Виконуємо вимогу: "Використати цикл for для генерації списку страв у кошику"
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        total += item.price;
        
        const cartItem = document.createElement('div');
        
        cartItem.style.display = 'flex';
        cartItem.style.justifyContent = 'space-between';
        cartItem.style.padding = '10px';
        cartItem.style.borderBottom = '1px solid #eee';
        cartItem.style.backgroundColor = 'white';
        
        cartItem.innerHTML = `
            <span style="font-weight:bold;">${item.title}</span>
            <span>${item.price} грн</span>
        `;
        
        cartContainer.appendChild(cartItem);
    }
    
    // Оновлюємо загальну суму
    totalPriceElement.innerText = total;
    
    if (!document.getElementById('checkout-btn')) {
        const checkoutBtn = document.createElement('button');
        checkoutBtn.id = 'checkout-btn';
        checkoutBtn.innerText = "Оформити замовлення";
        checkoutBtn.style.marginTop = "20px";
        checkoutBtn.style.width = "100%";
        checkoutBtn.style.padding = "15px";
        checkoutBtn.style.fontSize = "1.1em";
        checkoutBtn.onclick = startTimer; 
        
        document.getElementById('cart').appendChild(checkoutBtn);
    }
}

function startTimer() {
    const cartSection = document.getElementById('cart');
    
    // Перевіряємо, чи таймер вже є, щоб не дублювати
    let timerDisplay = document.getElementById('delivery-timer');
    if (!timerDisplay) {
        timerDisplay = document.createElement('div');
        timerDisplay.id = 'delivery-timer';
        timerDisplay.style.fontSize = '1.2em';
        timerDisplay.style.fontWeight = 'bold';
        timerDisplay.style.color = '#e67e22'; 
        timerDisplay.style.marginTop = '15px';
        timerDisplay.style.textAlign = 'center';
        timerDisplay.style.padding = '10px';
        timerDisplay.style.border = '2px dashed #e67e22';
        timerDisplay.style.borderRadius = '10px';
        cartSection.appendChild(timerDisplay);
    }
    
    let timeLeft = 30; 
    
    const btn = document.getElementById('checkout-btn');
    if(btn) btn.disabled = true;

    const timerInterval = setInterval(() => {
        timerDisplay.innerText = `Очікуйте доставку через: ${timeLeft} сек`;
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timerInterval);
            timerDisplay.innerText = " Замовлення доставлено! Смачного!";
            timerDisplay.style.color = "green";
            timerDisplay.style.borderColor = "green";
            
            // Очищаємо кошик після доставки
            cart = [];
            
            // Через 3 секунди оновлюємо вигляд (прибираємо таймер)
            setTimeout(() => {
                renderCart();
                timerDisplay.remove();
            }, 3000);
        }
    }, 1000);
}