
import mongoose from 'mongoose';

// Definir el esquema del modelo de Usuario
const { Schema, model } = mongoose;
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

});

const UserModel = model('User', userSchema);

export default UserModel;
