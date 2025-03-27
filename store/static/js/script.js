// --------------------------
// script.js
// --------------------------

// 1. Бургер-меню для сайдбара (уже было в твоём коде):
const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');

if (burgerBtn && sidebar) {
  burgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

// 2. Селекторы для полей фильтра и списка товаров
const priceMinEl = document.getElementById('priceMin');
const priceMaxEl = document.getElementById('priceMax');
const rarityCheckboxes = document.querySelectorAll('input[name="rarity"]');
const propsCheckboxes = document.querySelectorAll('input[name="props"]');
const ageCheckboxes = document.querySelectorAll('input[name="age"]');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

const itemsGrid = document.getElementById('itemsGrid');

// 3. Функция рендеринга (создает карточки из массива JSON)
function renderItems(items) {
  // очищаем контейнер
  itemsGrid.innerHTML = "";

  items.forEach(item => {
    // item = { name, rarity, price, img, props, age, popularity }
    // создаем div.item-card
    const card = document.createElement('div');
    card.classList.add('item-card');

    // props может быть строкой с запятыми (если так в БД),
    // или массивом. Предположим, это строка:
    let propsArray = [];
    if (item.props) {
      // убираем лишние пробелы, разделяем по запятым
      propsArray = item.props.split(",").map(x => x.trim()).filter(x => x.length > 0);
    }

    // формируем HTML для бейджей
    let propsHTML = propsArray.map(p => `<span class="badge ${p.toLowerCase()}">${capitalize(p)}</span>`).join('');

    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <div class="tags">
        <span class="badge ${item.rarity}">${capitalize(item.rarity)}</span>
        ${propsHTML}
      </div>
      <div class="price">
        <i class="fa-solid fa-coins"></i> $${parseFloat(item.price).toFixed(2)}
      </div>
    `;
    itemsGrid.appendChild(card);
  });
}

// 4. Функция applyFilters: собирает фильтры, строит URL, делает fetch
function applyFilters() {
  // собираем поля
  const minPrice = priceMinEl.value || "";
  const maxPrice = priceMaxEl.value || "";

  // rarities
  let rarities = [];
  rarityCheckboxes.forEach(chk => {
    if (chk.checked) rarities.push(chk.value);
  });
  // props
  let props = [];
  propsCheckboxes.forEach(chk => {
    if (chk.checked) props.push(chk.value);
  });
  // age
  let ages = [];
  ageCheckboxes.forEach(chk => {
    if (chk.checked) ages.push(chk.value);
  });

  const searchText = searchInput.value.trim(); 
  const sortValue = sortSelect.value;

  // формируем GET-параметры
  // примеры: &price_min=0, &rarity=rare, ...
  let params = [];

  if (minPrice) params.push(`price_min=${minPrice}`);
  if (maxPrice) params.push(`price_max=${maxPrice}`);
  
  rarities.forEach(r => params.push(`rarity=${r}`));
  props.forEach(p => params.push(`props=${p}`));
  ages.forEach(a => params.push(`age=${a}`));

  if (searchText) params.push(`search=${encodeURIComponent(searchText)}`);
  if (sortValue) params.push(`sort=${sortValue}`);

  let url = "/api/items/"; 
  if (params.length > 0) {
    url += "?" + params.join("&");
  }

  // console.log("Fetching URL:", url); // Для отладки

  // Делаем запрос
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      // data - массив объектов item
      renderItems(data);
    })
    .catch(err => {
      console.error("Ошибка при fetch:", err);
      itemsGrid.innerHTML = "<p style='color:red;'>Error loading items.</p>";
    });
}

// 5. capitalize 
function capitalize(str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
}

// 6. Ставим обработчики событий
[...rarityCheckboxes, ...propsCheckboxes, ...ageCheckboxes].forEach(chk => {
  chk.addEventListener('change', applyFilters);
});
priceMinEl.addEventListener('input', applyFilters);
priceMaxEl.addEventListener('input', applyFilters);
searchInput.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', applyFilters);

// 7. При загрузке страницы вызываем applyFilters() (отобразим все товары)
applyFilters();
