const express = require('express');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB, disconnectAndReconnect: _ } = require('../dao');
const ProductManager = require('../dao/models/ProductModel');
const CartManager = require('../dao/models/CartModel');

connectDB();

const app = express();
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'home',
}));
app.set('view engine', 'handlebars');
app.set('views', 'views');

app.use(session({
    secret: 'miClaveSecreta',
    resave: false,
    saveUninitialized: true,
}));

const productManager = new ProductManager();
const cartManager = new CartManager();

app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/products');
    } else {
        res.render('login');
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        req.session.user = {
            email: 'adminCoder@coder.com',
            role: 'admin',
        };
    } else {
        req.session.user = {
            email,
            role: 'usuario',
        };
    }

    res.redirect('/products');
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.use(express.json());

const productRouter = require('./productRouter');
app.use('/products', productRouter(productManager));

const cartRouter = require('./CartRouter');
app.use('/carts', cartRouter(cartManager));

app.get('/real-time-products', (req, res) => {
    res.render('realTimeProducts', { user: req.session.user });
});

const server = http.createServer(app);
const io = socketIo(server);

server.listen(8899, () => {
    console.log('Servidor Express corriendo en el puerto 8899');
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});
