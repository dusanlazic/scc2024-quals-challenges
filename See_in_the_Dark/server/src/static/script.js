document.getElementById('theme-toggle').addEventListener('click', function () {
    document.cookie = "theme=" + (this.textContent === 'light' ? 'dark' : 'light') + ";path=/";
    location.reload();
});
