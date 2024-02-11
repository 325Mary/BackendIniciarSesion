const {model, Schema} = require('mongoose')

const userSchema= new Schema({
    username: {type: String,
        required:[false, 'nombre requerido']},
    identification: {type: String,
        required: [true, 'cedula es requerida']},
    tenantId: {type: Schema.Types.ObjectId,
        required: [false, 'Nit de la empresa requerido'],        },
    email: {type: String,
        required:[true, 'correo requerido'],
        unique: true},
    password: {type: String,
        required: [false, 'constraseña requerida']},
        provisionalPassword: String,
    imgfirme: {type: String,
        required:[false, 'Imagen de firma es requerida']},
    telephone: {type: String,
        required: [false, 'telefono es requerido']},
    direction: { type: String,
    required: [false, 'direccion es requerida']},
    rol: {type:Schema.Types.ObjectId,
    required:[true, 'Rol es requerido']},
    status: {
        type: String,
        enum: ['inactivo', 'activo', 'pendiente'],
    },
    firstLogin: { type: Boolean, default: true },
    resetCode: { type: String, default: null },
  resetExpires: { type: Date, default: null }
    
    
    
})




module.exports = model('user', userSchema, "Users")
