import express from 'express';
import { renderCartPage } from '../controllers/CartController.js';
import { renderProductsPage, renderProductDetailsPage } from '../controllers/ProductController.js';

const router = express.Router();

// Rutas de las vistas para carrito y productos
router.get('/cart', renderCartPage);
router.get('/products', renderProductsPage);
router.get('/products/:id', renderProductDetailsPage);

export default router;
