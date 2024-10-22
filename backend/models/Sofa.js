const mongoose = require('mongoose');

const SofaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Sofa = mongoose.model('Sofa', SofaSchema);

module.exports = Sofa;
