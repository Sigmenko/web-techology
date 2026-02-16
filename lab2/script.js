document.addEventListener('DOMContentLoaded', () => {
    console.log("Скрипт запущено!");

    // --- 1. БАЗА ДАНИХ ---
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

    // --- 2. ЗМІННІ ---
    // Читаємо з localStorage. Якщо там null, беремо пустий масив []
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let cart = [];
    const ordersHistory = [
        { id: 1234, date: "10.02.2026", items: "Піца Маргарита", total: 300, status: "Виконано" },
        { id: 1230, date: "05.02.2026", items: "Сет 'Каліфорнія'", total: 460, status: "Виконано" }
    ];

    // --- 3. ПОШУК КОНТЕЙНЕРІВ ---
    const menuContainer = document.getElementById('menu-container');
    const favoritesContainer = document.getElementById('favorites-container');
    const cartContainer = document.getElementById('cart-container');
    const ordersContainer = document.getElementById('orders-container');

    // --- 4. ЗАПУСК ЛОГІКИ ---
    
    // Якщо ми на головній (є меню)
    if (menuContainer) {
        renderMenu();
        renderCart();
        renderHistory();
    }

    // Якщо ми на сторінці улюблених
    if (favoritesContainer) {
        renderFavoritesPage();
    }

    // --- ФУНКЦІЇ ---

    function renderMenu() {
        menuContainer.innerHTML = '';
        menuItems.forEach(dish => {
            // Перевіряємо, чи є ID в масиві favorites (приводимо все до чисел)
            const isLiked = favorites.map(Number).includes(Number(dish.id));
            const activeClass = isLiked ? 'active' : '';
            
            const card = document.createElement('article');
            card.className = 'food-card';
            card.innerHTML = `
                <img src="${dish.image}" alt="${dish.title}">
                <div class="card-content">
                    <div class="card-top-row">
                        <h3>${dish.title}</h3>
                        <button class="favorite-btn ${activeClass}" onclick="window.toggleFavorite(${dish.id}, this)">❤</button>
                    </div>
                    <p>${dish.description}</p>
                    <div class="card-bottom">
                        <span class="price">${dish.price} грн</span>
                        <button onclick="window.addToCart(${dish.id}, this)">В кошик</button>
                    </div>
                </div>
            `;
            menuContainer.appendChild(card);
        });
    }

    function renderFavoritesPage() {
        favoritesContainer.innerHTML = '';
        
        // Оновлюємо дані з пам'яті (про всяк випадок)
        const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const savedIds = savedFavorites.map(id => Number(id)); // Робимо числами
        
        // Фільтруємо меню: залишаємо тільки ті страви, чиї ID є в списку збережених
        const favoriteDishes = menuItems.filter(item => savedIds.includes(item.id));

        const emptyMsg = document.getElementById('empty-message');
        
        if (favoriteDishes.length === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        } else {
            if (emptyMsg) emptyMsg.style.display = 'none';
        }

        favoriteDishes.forEach(dish => {
            const card = document.createElement('article');
            card.className = 'food-card';
            card.innerHTML = `
                <img src="${dish.image}" alt="${dish.title}">
                <div class="card-content">
                    <div class="card-top-row">
                        <h3>${dish.title}</h3>
                        <button class="favorite-btn active" onclick="window.removeFromFavoritesPage(${dish.id})">❌</button>
                    </div>
                    <p>${dish.description}</p>
                    <div class="card-bottom">
                        <span class="price">${dish.price} грн</span>
                        <a href="index.html#cart" style="text-decoration:none; color:blue;">Замовити</a>
                    </div>
                </div>
            `;
            favoritesContainer.appendChild(card);
        });
    }

    // --- ГЛОБАЛЬНІ ФУНКЦІЇ ---
    
    window.toggleFavorite = function(id, btn) {
        id = Number(id); // Гарантуємо, що це число
        
        // Оновлюємо масив з пам'яті, щоб мати найсвіжіші дані
        let currentFavs = JSON.parse(localStorage.getItem('favorites')) || [];
        currentFavs = currentFavs.map(Number);

        if (currentFavs.includes(id)) {
            // Видаляємо
            currentFavs = currentFavs.filter(favId => favId !== id);
            btn.classList.remove('active');
            console.log("Видалено ID:", id);
        } else {
            // Додаємо
            currentFavs.push(id);
            btn.classList.add('active');
            console.log("Додано ID:", id);
        }
        
        // Зберігаємо назад і оновлюємо глобальну змінну
        localStorage.setItem('favorites', JSON.stringify(currentFavs));
        favorites = currentFavs;
    };

    window.removeFromFavoritesPage = function(id) {
        id = Number(id);
        let currentFavs = JSON.parse(localStorage.getItem('favorites')) || [];
        currentFavs = currentFavs.map(Number);
        
        currentFavs = currentFavs.filter(favId => favId !== id);
        localStorage.setItem('favorites', JSON.stringify(currentFavs));
        
        // Перемальовуємо сторінку
        renderFavoritesPage();
    };

    window.addToCart = function(id, btnElement) {
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
    };

    function renderCart() {
        if (!cartContainer) return;
        const totalPriceElement = document.getElementById('total-price');
        cartContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align:center; color:#777;">Кошик порожній</p>';
            if (totalPriceElement) totalPriceElement.innerText = '0';
            const existingBtn = document.getElementById('checkout-btn');
            if (existingBtn) existingBtn.remove();
            return;
        }

        cart.forEach(item => {
            total += item.price;
            const div = document.createElement('div');
            div.innerHTML = `<b>${item.title}</b> - ${item.price} грн`;
            div.style.borderBottom = "1px solid #eee";
            div.style.padding = "5px";
            cartContainer.appendChild(div);
        });
        
        if (totalPriceElement) totalPriceElement.innerText = total;

        if (!document.getElementById('checkout-btn')) {
            const btn = document.createElement('button');
            btn.id = 'checkout-btn';
            btn.innerText = "Оформити";
            btn.onclick = window.startTimer;
            btn.style.marginTop = "10px";
            btn.style.width = "100%";
            document.getElementById('cart').appendChild(btn);
        }
    }

    window.startTimer = function() {
        const cartSection = document.getElementById('cart');
        let timerDisplay = document.getElementById('delivery-timer');
        if (!timerDisplay) {
            timerDisplay = document.createElement('div');
            timerDisplay.id = 'delivery-timer';
            cartSection.appendChild(timerDisplay);
        }
        
        let timeLeft = 5;
        const interval = setInterval(() => {
            timerDisplay.innerText = `Доставка через: ${timeLeft}`;
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(interval);
                timerDisplay.innerText = "Доставлено!";
                
                const names = cart.map(i => i.title).join(", ");
                const sum = cart.reduce((a, b) => a + b.price, 0);
                ordersHistory.unshift({
                    id: Math.floor(Math.random()*1000),
                    date: new Date().toLocaleDateString(),
                    items: names,
                    total: sum,
                    status: "Нове"
                });
                renderHistory();
                
                cart = [];
                renderCart();
            }
        }, 1000);
    };

    function renderHistory() {
        if (!ordersContainer) return;
        ordersContainer.innerHTML = '';
        ordersHistory.forEach(order => {
            const div = document.createElement('div');
            div.className = 'food-card';
            div.style.padding = "10px";
            div.innerHTML = `<b>#${order.id}</b> (${order.date})<br>${order.items}<br><b>${order.total} грн</b>`;
            ordersContainer.appendChild(div);
        });
    }
});