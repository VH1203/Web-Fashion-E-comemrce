const mongoose = require('mongoose');


const AddressSchema = new mongoose.Schema({
id: { type: String, required: true },
receiver_name: String,
phone: String,
address: String,
is_default: { type: Boolean, default: false }
}, { _id: false });


const PreferencesSchema = new mongoose.Schema({
favorite_categories: [String],
favorite_size: String,
favorite_color: String
}, { _id: false });


const UserSchema = new mongoose.Schema({
_id: { type: String, required: true }, // UUID v4
username: { type: String, required: true, unique: true, trim: true, lowercase: true },
email: { type: String, required: true, unique: true, trim: true, lowercase: true },
phone: { type: String, required: true, unique: true, trim: true },
password_hash: { type: String, required: true },
avatar: String,
avatar_public_id: String,
role_id: { type: String, required: true },
role: { type: String, enum: ['customer','shop_owner','system_admin','sales','support'], required: true },
gender: { type: String, enum: ['male','female','other'], default: 'other' },
dob: { type: String },
preferences: PreferencesSchema,
addresses: [AddressSchema],
status: { type: String, enum: ['active','inactive','banned'], default: 'active' },
created_at: { type: Date, default: Date.now },
updated_at: { type: Date, default: Date.now }
}, { collection: 'users' });





module.exports = mongoose.model('User', UserSchema);