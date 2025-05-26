let isOpening = false;
let previousGameTab = "cases"; // по умолчанию — кейсы
let awaitingUserChoice = false;
let caseAborted = false;

document.addEventListener('DOMContentLoaded', function () {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    if (user) {
    // Имя пользователя в шапке
    const profileNameElement = document.querySelector('.profile-name');
    if (profileNameElement) {
        profileNameElement.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }

    // Имя пользователя в профиле
    const usernameElement = document.querySelector('.profile-username');
    if (usernameElement) {
        usernameElement.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }

    // Аватарка (или заглушка, если нет фото)
    const avatarElements = document.querySelectorAll('.avatar, .profile-avatar');
    const defaultAvatar = 'icons/default-avatar.png';
    avatarElements.forEach(img => {
        img.src = user.photo_url || defaultAvatar;
    });

    // ✅ УНИКАЛЬНЫЙ 5-ЗНАЧНЫЙ ID ПОЛЬЗОВАТЕЛЯ
    const localKey = `userId-${user.id}`;
    let uniqueUserId = localStorage.getItem(localKey);

    if (!uniqueUserId) {
        let usedIds = JSON.parse(localStorage.getItem('usedUserIds') || '[]');

        do {
            uniqueUserId = String(Math.floor(10000 + Math.random() * 90000));
        } while (usedIds.includes(uniqueUserId));

        usedIds.push(uniqueUserId);
        localStorage.setItem('usedUserIds', JSON.stringify(usedIds));
        localStorage.setItem(localKey, uniqueUserId);
    }

    const idElement = document.querySelector('.profile-userid');
    if (idElement) {
        idElement.textContent = `User id #${uniqueUserId}`;
    }

    const avatarInHeader = document.querySelector('.header-avatar');
if (avatarInHeader) {
    avatarInHeader.src = user.photo_url || 'icons/default-avatar.png';
}
}
// <-- ЗАКРЫВАЕМ if (user)

    // Основная логика ВСЕГДА запускается
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabHighlight = document.querySelector('.tab-highlight');
    const tabBar = document.querySelector('.tab-bar');
    const tabContents = document.querySelectorAll('.tab-content');
    document.querySelector(".open-normal").addEventListener("click", startRoulette);
    document.querySelector(".open-fast").addEventListener("click", startRoulette);

    
    function updateHighlightPosition(activeButton) {
        if (!activeButton || !tabHighlight) return;
        
        const buttonRect = activeButton.getBoundingClientRect();
        const barRect = tabBar.getBoundingClientRect();
        
        const left = buttonRect.left - barRect.left;
        const width = buttonRect.width;
        
        tabHighlight.style.left = `${left}px`;
        tabHighlight.style.width = `${width}px`;
    }
    
    function switchTab(tabName) {
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabName);
    });
    
    tabContents.forEach(content => {
        content.classList.toggle('active', content.dataset.tabContent === tabName);
    });

    const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    updateHighlightPosition(activeButton);

    // 🔧 Добавим инициализацию подсветки внутри вкладки Розыгрыши
    if (tabName === "raffles") {
        const rafflesContainer = document.querySelector('.raffles-tabs');
        const rafflesActiveButton = rafflesContainer?.querySelector('.raffles-tab-button.active');
        const rafflesHighlight = rafflesContainer?.querySelector('.raffles-tab-highlight');

        if (rafflesActiveButton && rafflesHighlight) {
            requestAnimationFrame(() => {
                const rect = rafflesActiveButton.getBoundingClientRect();
                const parentRect = rafflesActiveButton.parentElement.getBoundingClientRect();
                const left = rect.left - parentRect.left;
                const width = rect.width;

                rafflesHighlight.style.left = `${left}px`;
                rafflesHighlight.style.width = `${width}px`;
            });
        }
    }
}

    
    // Инициализация основных табов
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
        updateHighlightPosition(activeTab);
        switchTab(activeTab.dataset.tab);
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    window.addEventListener('resize', () => {
    const activeBtn = container.querySelector('.raffles-tab-button.active');
    updateHighlightPosition(activeBtn);
});
    
// Выезжающая панель пополнения баланса
const balanceAddBtn = document.querySelector('.balance-add');
const slideOverlay = document.getElementById('bottomSlideOverlay');
const slidePanel = document.getElementById('bottomSlidePanel');
const slideCloseBtn = document.getElementById('bottomSlideClose');

if (balanceAddBtn && slideOverlay && slidePanel && slideCloseBtn) {
    balanceAddBtn.addEventListener('click', () => {
        slideOverlay.classList.add('show');
    });

    slideCloseBtn.addEventListener('click', () => {
        slideOverlay.classList.remove('show');
    });

    slideOverlay.addEventListener('click', (e) => {
        if (e.target === slideOverlay) {
            slideOverlay.classList.remove('show');
        }
    });
}

    // Функция для управления табами в играх
function setupGamesTabs() {
    const tabButtons = document.querySelectorAll('.games-tab-button');
    const tabContents = document.querySelectorAll('.games-content');
    const tabHighlight = document.querySelector('.games-tab-highlight');
    
    function updateHighlightPosition(activeButton) {
        if (!activeButton || !tabHighlight) return;
        
        const buttonRect = activeButton.getBoundingClientRect();
        const tabsRect = activeButton.parentElement.getBoundingClientRect();
        
        const left = buttonRect.left - tabsRect.left;
        const width = buttonRect.width;
        
        tabHighlight.style.left = `${left}px`;
        tabHighlight.style.width = `${width}px`;
    }
    
    function switchTab(tabName) {
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.gameTab === tabName);
        });
        
        tabContents.forEach(content => {
            content.classList.toggle('active', content.dataset.gameContent === tabName);
        });
        
        const activeButton = document.querySelector(`.games-tab-button[data-game-tab="${tabName}"]`);
        updateHighlightPosition(activeButton);
    }
    
    // Инициализация
    const activeTab = document.querySelector('.games-tab-button.active');
    if (activeTab) {
        updateHighlightPosition(activeTab);
        switchTab(activeTab.dataset.gameTab);
    }
    
    // Обработчики кликов
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.gameTab;
            switchTab(tabName);
        });
    });
}

    // Функция для управления табами в розыгрышах
    function setupRafflesTabs() {
        const container = document.querySelector('.raffles-tabs');
        if (!container) return;

        const tabButtons = container.querySelectorAll('.raffles-tab-button');
        const tabContents = document.querySelectorAll('.raffles-content');
        const tabHighlight = container.querySelector('.raffles-tab-highlight');

        function updateHighlightPosition(activeButton) {
            if (!activeButton || !tabHighlight) return;
            
            const buttonRect = activeButton.getBoundingClientRect();
            const tabsRect = activeButton.parentElement.getBoundingClientRect();
            
            const left = buttonRect.left - tabsRect.left;
            const width = buttonRect.width;
            
            tabHighlight.style.left = `${left}px`;
            tabHighlight.style.width = `${width}px`;
        }

        function switchTab(tabName) {
            tabButtons.forEach(button => {
                button.classList.toggle('active', button.dataset.raffleTab === tabName);
            });
            
            tabContents.forEach(content => {
                content.classList.toggle('active', content.dataset.raffleContent === tabName);
            });
            
            const activeButton = container.querySelector(`.raffles-tab-button.active`);
            updateHighlightPosition(activeButton);
        }

        // Инициализация
        const defaultTab = container.querySelector('.raffles-tab-button[data-raffle-tab="paid"]');
if (defaultTab) {
    defaultTab.classList.add('active');
    switchTab("paid");

    // Задержка, чтобы DOM успел отрисовать кнопки
    requestAnimationFrame(() => {
        updateHighlightPosition(defaultTab);
    });
}

        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.dataset.raffleTab;
                switchTab(tabName);
            });
        });
    }

    // Инициализация табов
    setupGamesTabs();
    setupRafflesTabs();
});

function getMethodName(method) {
    const methods = {
        'card': 'банковскую карту',
        'crypto': 'криптовалюту',
        'sbp': 'СБП'
    };
    return methods[method] || method;
}

document.querySelectorAll('.bonus-case').forEach(caseElement => {
caseElement.addEventListener('mouseenter', function() {
this.style.transform = 'translateY(-5px)';
this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
this.querySelector('.roulette-circle').style.transform = 'scale(1.1)';
});

caseElement.addEventListener('mouseleave', function() {
    this.style.transform = '';
    this.style.boxShadow = '';
    this.querySelector('.roulette-circle').style.transform = '';
});
});

// Обработчики для кейсов
// Обработчики для кейсов
document.querySelectorAll('.bonus-item').forEach(item => {
    item.addEventListener('click', function() {
        const caseType = this.dataset.case;
        const activeTabBtn = document.querySelector('.games-tab-button.active');
if (activeTabBtn) {
    previousGameTab = activeTabBtn.dataset.gameTab;
}
        openCase(caseType);
    });
});

function openCase(caseType) {
    document.querySelector('.games-header').classList.add('hidden');
    document.querySelectorAll('.games-content').forEach(content => {
        content.classList.remove('active');
    });

    const caseOpenTab = document.querySelector('.games-content[data-game-content="case-open"]');
    caseOpenTab.classList.add('active');

    updateCaseContent(caseType);

    // ⬇️ Добавляем плавную прокрутку после рендера
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);

    setTimeout(() => {
        document.querySelector('.back-arrow').classList.add('visible');
    }, 300);
}

function updateCaseContent(caseType) {
    // В зависимости от типа кейса обновляем содержимое
    const caseTitle = document.querySelector('.case-content .case-title');
    const caseImage = document.querySelector('.case-content .case-image');
    
    switch(caseType) {
        case 'bronze':
            caseTitle.textContent = 'Бронзовый кейс';
            caseImage.src = 'icons/beggar-icon.png';
            break;
        case 'silver':
            caseTitle.textContent = 'Серебряный кейс';
            caseImage.src = 'icons/silver-case-icon.png';
            break;
        case 'gold':
            caseTitle.textContent = 'Золотой кейс';
            caseImage.src = 'icons/gold-case-icon.png';
            break;
        case 'platinum':
            caseTitle.textContent = 'Платиновый кейс';
            caseImage.src = 'icons/platinum-case-icon.png';
            break;
    }
    
    // Обновляем иконки кнопок
    document.querySelector('.open-normal .case-button-icon').src = 'icons/open-icon.png';
    document.querySelector('.open-fast .case-button-icon').src = 'icons/fast-icon.png';
}

// Обработчик кнопки "Назад"
document.querySelector('.back-button').addEventListener('click', function () {
    if (isOpening || awaitingUserChoice) {
        // Если кейс ещё открыт или пользователь не сделал выбор — считаем, что предмет остаётся себе
        isOpening = false;
        awaitingUserChoice = false;
        caseAborted = true; // ⛔ предотвратить отрисовку кнопок
        resetCaseUI();
    }

    resetCaseState(); // тоже должен устанавливать caseAborted = true (см. ниже)

    document.querySelector('.games-header').classList.remove('hidden');

    document.querySelectorAll('.games-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelector(`.games-content[data-game-content="${previousGameTab}"]`).classList.add('active');

    document.querySelectorAll('.games-tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gameTab === previousGameTab);
    });

    const activeBtn = document.querySelector(`.games-tab-button[data-game-tab="${previousGameTab}"]`);
    if (activeBtn) {
        const highlight = document.querySelector('.games-tab-highlight');
        const rect = activeBtn.getBoundingClientRect();
        const parentRect = activeBtn.parentElement.getBoundingClientRect();
        const left = rect.left - parentRect.left;
        const width = rect.width;

        highlight.style.left = `${left}px`;
        highlight.style.width = `${width}px`;
    }
});


const caseItems = [
  { name: "1", image: "icons/item1.png", price: 44000 },
  { name: "2", image: "icons/item2.png", price: 22000 },
  { name: "3", image: "icons/item3.png", price: 14000 },
  { name: "4", image: "icons/item4.png", price: 7600 }
];


function startRoulette() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    isOpening = true;
    awaitingUserChoice = false;
    caseAborted = false;

    const track = document.getElementById("rouletteTrack");
    const rouletteWrapper = document.getElementById("rouletteWrapper");
    const caseImageContainer = document.querySelector(".case-image-container");
    const buttonsContainer = document.querySelector(".case-buttons");

    caseImageContainer.classList.add("hidden");

    const openButtons = buttonsContainer.querySelectorAll(".case-button");
    openButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
    });

    rouletteWrapper.classList.remove("hidden");
    setTimeout(() => {
        rouletteWrapper.classList.add("show");
    }, 10);

    const caseItems = Array.from(document.querySelectorAll(".case-item")).map(item => {
        const name = item.querySelector(".item-name")?.textContent?.trim();
        const image = item.querySelector(".item-image")?.getAttribute("src");
        const priceText = item.querySelector(".item-price")?.textContent?.replace(/\D/g, "");
        const price = parseInt(priceText, 10) || 0;
        if (!name || !image) return null;
        return { name, image, price };
    }).filter(Boolean);

    track.innerHTML = "";

    const baseCount = Math.floor(Math.random() * (149 - 100 + 1)) + 100;
    const bufferCount = 15;
    const itemCount = baseCount + bufferCount;
    const sequence = [];
    for (let i = 0; i < itemCount; i++) {
        const item = caseItems[Math.floor(Math.random() * caseItems.length)];
        if (item && item.image && item.name) {
            sequence.push(item);
        }
    }

    sequence.forEach(item => {
        const div = document.createElement("div");
        div.className = "roulette-item";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div>${item.name}</div>
        `;
        track.appendChild(div);
    });

    requestAnimationFrame(() => {
        const itemEl = document.querySelector(".roulette-item");
        if (!itemEl) return;

        const trackStyle = getComputedStyle(track);
        const gap = parseFloat(trackStyle.gap) || 16;
        const itemWidth = itemEl.offsetWidth + gap;

        const finalPrizeIndex = Math.floor(baseCount / 2) + Math.floor(Math.random() * 5) - 2;
        const shift = -Math.round(finalPrizeIndex * itemWidth - window.innerWidth / 2 + itemWidth / 2);

        track.style.transition = "none";
        track.style.transform = `translateX(0px)`;

        requestAnimationFrame(() => {
            track.style.transition = "transform 6.5s cubic-bezier(0.15, 0.85, 0.35, 1)";
            track.style.transform = `translateX(${shift}px)`;
        });

        let animationFrameId;
        function updateCenterHighlight() {
            const centerX = window.innerWidth / 2;
            const items = track.querySelectorAll(".roulette-item");
            let closestItem = null;
            let closestDistance = Infinity;

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.left + rect.width / 2;
                const distance = Math.abs(centerX - itemCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestItem = item;
                }
            });

            items.forEach(item => item.classList.remove("hover-effect"));
            if (closestItem) closestItem.classList.add("hover-effect");

            animationFrameId = requestAnimationFrame(updateCenterHighlight);
        }

        updateCenterHighlight();

        setTimeout(() => {
            cancelAnimationFrame(animationFrameId);

            if (caseAborted) return; // ⛔ Пользователь ушёл до окончания анимации

            const centerX = window.innerWidth / 2;
            const items = track.querySelectorAll(".roulette-item");
            let closestItem = null;
            let closestDistance = Infinity;

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.left + rect.width / 2;
                const distance = Math.abs(centerX - itemCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestItem = item;
                }
            });

            items.forEach(i => {
                i.classList.remove("hover-effect", "highlighted");
                i.style.transform = "scale(1)";
            });

            if (closestItem) {
                closestItem.classList.add("highlighted");
                closestItem.style.transform = "scale(1.1)";

                const name = closestItem.querySelector("div").textContent.trim();
                const price = prizePrice(name);

                buttonsContainer.innerHTML = `
                    <button class="case-button keep-item" id="keepItem">Оставить себе</button>
                    <button class="case-button sell-item" id="sellItemBtn">Продать за ${price} <img src="icons/balance.png" class="ruble-icon"></button>
                `;

                awaitingUserChoice = true;

                document.getElementById("keepItem").addEventListener("click", () => {
                    isOpening = false;
                    awaitingUserChoice = false;
                    resetCaseUI();
                });

                document.getElementById("sellItemBtn").addEventListener("click", () => {
                    isOpening = false;
                    awaitingUserChoice = false;
                    resetCaseUI();
                });
            }
        }, 7000);
    });
}


// Определение цены по названию
function prizePrice(name) {
    const item = caseItems.find(i => i.name === name);
    return item && item.price ? item.price : "???";
}

// Сброс интерфейса кейса
function resetCaseUI() {
    const caseImageContainer = document.querySelector(".case-image-container");
    const rouletteWrapper = document.getElementById("rouletteWrapper");
    const buttonsContainer = document.querySelector(".case-buttons");

    // Показать иконку кейса
    caseImageContainer.classList.remove("hidden");
    rouletteWrapper.classList.add("hidden");

    // Восстановить кнопки открытия
    buttonsContainer.innerHTML = `
        <button class="case-button open-normal">
            Открыть кейс
            <img src="icons/open-icon.png" alt="Открыть" class="case-button-icon">
        </button>
        <button class="case-button open-fast">
            Открыть быстро
            <img src="icons/fast-icon.png" alt="Быстро" class="case-button-icon">
        </button>
    `;

    // Повторно подключить события
    document.querySelector(".open-normal").addEventListener("click", startRoulette);
    document.querySelector(".open-fast").addEventListener("click", startRoulette);
}

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const newTab = button.dataset.tab;

        // Если уходим с кейсов — сбрасываем
        if (newTab !== "case") {
            resetCaseState();
        }

        // Если возвращаемся в "Кейсы" → проверим: открыт ли сейчас кейс?
        if (newTab === "case") {
            const caseOpenTab = document.querySelector('.games-content[data-game-content="case-open"]');
            if (caseOpenTab && caseOpenTab.classList.contains('active')) {
                // Показать стрелку назад через анимацию
                setTimeout(() => {
                    const backArrow = document.querySelector('.back-arrow');
                    if (backArrow) backArrow.classList.add('visible');
                }, 300);
            }
        }
    });
});


function resetCaseState() {
    if (isOpening || awaitingUserChoice) {
        console.log("Предмет оставлен себе автоматически (покинул кейс)");
        isOpening = false;
        awaitingUserChoice = false;
        caseAborted = true; // ⛔ предотвратит появление кнопок по таймеру
    }

    resetCaseUI();

    // Скрыть стрелку
    const backArrow = document.querySelector(".back-arrow");
    if (backArrow) {
        backArrow.classList.remove("visible");
    }
}
