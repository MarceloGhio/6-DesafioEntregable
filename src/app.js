import express from 'express';
import expressHandlebars from 'express-handlebars';
import session from 'express-session';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import mongoose from 'mongoose'; // Importa Mongoose
import { connectDB, disconnectAndReconnect as _ } from '../src/dao/index.js';
import ProductModel from '../src/dao/models/ProductModel.js';
import CartModel from '../src/dao/models/CartModel.js';
import { ProductManager } from './ProductManager.js';
import { default as productRouter } from './routes/productRouter.js';

// Conecta a la base de datos
connectDB();

// Define el esquema del usuario utilizando Mongoose
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

// Define el modelo de usuario
const UserModel = mongoose.model('User', UserSchema);

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

// Ruta para mostrar el formulario de registro
app.get('/register', (req, res) => {
    res.render('register');
});

// Ruta para procesar el formulario de registro
app.post('/register', async (req, res) => {
    // Recupera los datos del formulario de registro
    const { username, email, password } = req.body;

    try {
        // Crea un nuevo usuario con los datos del formulario
        const newUser = new UserModel({
            username,
            email,
            password
        });

        // Guarda el nuevo usuario en la base de datos
        await newUser.save();

        // Redirecciona al usuario al login luego del registro
        res.redirect('/login');
    } catch (error) {
        console.error('Error al registrar al usuario:', error);
        res.status(500).send('Error al registrar al usuario');
    }
});

app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/products');
    } else {
        res.render('login');
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
//Todos los usuarios que no sean admin deberán contar con un rol _"usuario"_
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        if (req.session.user) {
            console.log('El usuario ya está autenticado.');
        } else {
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

    res.redirect('/products');
});

app.get('/admin', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.send('Página de administrador');
    } else {
        res.status(403).send('Acceso denegado');
    }
});

app.get('/user', (req, res) => {
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
