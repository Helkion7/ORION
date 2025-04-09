const mongoose = require("mongoose");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please provide a valid email",
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "firstLineSupport", "secondLineSupport"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Hash password with Argon2
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id, // Most secure variant
      memoryCost: parseInt(process.env.ARGON2_MEMORY) || 65536, // 64MB
      timeCost: parseInt(process.env.ARGON2_ITERATIONS) || 3, // Iterations
      parallelism: parseInt(process.env.ARGON2_PARALLELISM) || 1,
    });
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password matches
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await argon2.verify(this.password, enteredPassword);
  } catch (error) {
    throw new Error("Password verification failed");
  }
};

// Method to sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("User", UserSchema);
