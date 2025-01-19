const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken')
const key = "MySecretOkDontTouch";
const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true
    },
    confirmPassword: {
        type: String,
        require: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
},
    { timestamps: true });

userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, key, { expiresIn: '5d' })
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;
    } catch (error) {

    }
}


const User = mongoose.model("User", userSchema);
module.exports = User;