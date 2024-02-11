const {Schema, model} = require("mongoose")

const blackListedTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true,
      },
})

module.exports = model("blackListedToken", blackListedTokenSchema, "blackListedTokens");