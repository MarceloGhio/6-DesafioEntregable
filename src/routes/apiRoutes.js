import express from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/CartController.js';
import { getAllProducts, getProductById } from '../controllers/ProductController.js';

const router = express.Router();

// Rutas de la API para carrito y productos
router.get('/api/cart', getCart);
router.post('/api/cart/add', addToCart);
router.delete('/api/cart/remove/:productId', removeFromCart);
router.get('/api/products', getAllProducts);
router.get('/api/products/:id', getProductById);

export default router;
