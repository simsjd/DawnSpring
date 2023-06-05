# DawnSpring
2.5 D MMORPG Exercise built on a Raspberry Pi 3

## Raspberry Pi
3 Model B
16 GB memory
1 GB RAM
Quad Core 1.2 GHz 64 bit CPU

## Parts
### httpd
Currently using httpd for access
Start server: sudo busybox httpd -h /DawnSpring/
Stop server: sudo pkill busybox

Access via url: 192.168.1.122/Website/home.html

### pixi.js
Renderer

### SQLite
Database

### node.js
server language

npm install
npm run start
sudo pkill node

### socket.io
Possible replacement for httpd