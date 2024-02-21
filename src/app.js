import express from 'express';
import expressHandlebars from 'express-handlebars';
import session from 'express-session';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { connectDB, disconnectAndReconnect as _ } from '../src/dao/index.js';
import ProductModel from '../src/dao/models/ProductModel.js';
import CartModel from '../src/dao/models/CartModel.js';
import { ProductManager } from './ProductManager.js';
import { default as productRouter } from './productRouter.js';



connectDB();

const app = express();
const __dirname = path.resolve();
const viewsDir = path.join(__dirname, 'src', 'views');
const layoutsDir = path.join(viewsDir, 'layouts');

app.engine('handlebars', expressHandlebars({
    defaultLayout: 'home',
    layoutsDir: layoutsDir,
}));
app.set('view engine', 'handlebars');
app.set('views', viewsDir);

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'miClaveSecreta',
    resave: false,
    saveUninitialized: true,
}));

const productManager = new ProductManager();
const cartManager = new CartModel();

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.use('/products', productRouter(productManager, io)); // Agregado 'io'

app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/products');
    } else {
        res.render('login');
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Simula la lógica de autenticación
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        // Verifica si el usuario ya está autenticado
        if (req.session.user) {
            console.log('El usuario ya está autenticado.');
        } else {
            // Guarda la información del usuario en la sesión
            req.session.user = {
                email: 'adminCoder@coder.com',
                role: 'admin',
            };
            console.log('Usuario autenticado como administrador.');
        }
    } else {
        if (req.session.user) {
            console.log('El usuario ya está autenticado.');
        } else {
            req.session.user = {
                email,
                role: 'usuario',
            };
            console.log('Usuario autenticado como usuario normal.');
        }
    }

    res.redirect('/products'); // Redirecciona a la vista de productos
});

// Verificación de roles en las rutas
app.get('/admin', (req, res) => {
    // Verifica si el usuario tiene rol de administrador
    if (req.session.user && req.session.user.role === 'admin') {
        res.send('Página de administrador');
    } else {
        res.status(403).send('Acceso denegado');
    }
});

app.get('/user', (req, res) => {
    // Verifica si el usuario tiene rol de usuario normal
    if (req.session.user && req.session.user.role === 'usuario') {
        res.send('Página de usuario normal');
    } else {
        res.status(403).send('Acceso denegado');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/real-time-products', (req, res) => {
    res.render('layouts/realTimeProducts', { user: req.session.user });
});

server.listen(8899, () => {
    console.log('Servidor Express corriendo en el puerto 8899');
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

export default app;