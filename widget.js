const FIELD_DATE_ID = 885453;
const FIELD_RANGE_ID = 892009;
const FIELD_TIME_ID = 892003;
const FIELD_ADDRESS_ID = 887367;

let dealsByDate = {};

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();
  groupDealsByDate(deals);
  renderCalendar();
});

async function fetchDeals() {
  return new Promise((resolve) => {
    if (typeof window.AmoCRM === "undefined") return resolve([]);
    window.AmoCRM.constant("deals").load((deals) => {
      resolve(deals || []);
    });
  });
}

function groupDealsByDate(deals) {
  deals.forEach(deal => {
    const customFields = deal.custom_fields_values || [];
    const dateField = customFields.find(f => f.field_id === FIELD_DATE_ID);
    if (!dateField || !dateField.values || !dateField.values[0]) return;

    const date = new Date(dateField.values[0].value).toISOString().split('T')[0];
    if (!dealsByDate[date]) dealsByDate[date] = [];
    dealsByDate[date].push(deal);
  });
}

function renderCalendar() {
  const calendar = document.getElementById('calendar');
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const year = today.getFullYear();
  const month = today.getMonth();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const cell = document.createElement('div');
    cell.className = 'date-cell';
    cell.textContent = day;

    if (dealsByDate[dateStr]) {
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = dealsByDate[dateStr].length;
      cell.appendChild(badge);
      cell.addEventListener('click', () => showDealsForDate(dateStr));
    }

    calendar.appendChild(cell);
  }
}

function showDealsForDate(dateStr) {
  const listDiv = document.getElementById('order-list');
  listDiv.innerHTML = <h3>Сделки на ${dateStr}</h3>;

  const deals = dealsByDate[dateStr] || [];
  deals.sort((a, b) => b.id - a.id);

  deals.forEach(deal => {
    const cf = (id) => {
      const f = (deal.custom_fields_values || []).find(f => f.field_id === id);
      return f && f.values && f.values[0] ? f.values[0].value : '';
    };

    const item = document.createElement('div');
    item.className = 'deal-item';

    item.innerHTML = ` 
    <strong>ID:</strong> ${deal.id}<br />
    <strong>Название:</strong> ${deal.name}<br />
    <strong>Бюджет:</strong> ${deal.price}<br />
    <strong>Диапазон доставки:</strong> ${cf(FIELD_RANGE_ID)}<br />
    <strong>К точному времени:</strong> ${cf(FIELD_TIME_ID)}<br />
    <strong>Адрес:</strong> ${cf(FIELD_ADDRESS_ID)}<br /><br />
    `;

    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
    window.AmoCRM.openCard('lead', deal.id);
    });

    listDiv.appendChild(item);
  });
}