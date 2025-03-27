// Для мобильной адаптивности: открывать/закрывать sidebar
const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');

if (burgerBtn && sidebar) {
  burgerBtn.addEventListener('click', () => {
    // Переключаем класс .open у sidebar
    sidebar.classList.toggle('open');
  });
}
