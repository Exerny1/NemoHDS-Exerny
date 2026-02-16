// Adding functionality to embed an external site as the wallpaper
const wallpaperElement = document.querySelector('.wallpaper');

if (wallpaperElement) {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://exerny1.github.io/intellistar-emulator-24-7/';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    wallpaperElement.appendChild(iframe);
}