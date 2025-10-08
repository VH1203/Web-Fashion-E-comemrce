const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `user-${uuidv4()}` },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: Date,
    role_id: { type: String, ref: "Role", default: "role-customer" },
    status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
    password_hash: String,
    refresh_token: String,
    avatar_url: String,
    avatar_public_id: String,
    preferences: {
      height: Number,
      weight: Number,
      size_top: String,
      size_bottom: String,
    },
    last_login: Date,
  },
  { timestamps: true, versionKey: false, collection: "users" }
);

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

module.exports = mongoose.model("User", UserSchema);
