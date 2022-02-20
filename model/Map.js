const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const mapSchema = new Schema({
    longitude: {
        type: String,
        required: true
    },
    latitude : {
        type : String,
        required : true
    },   
},
{ timestamps: { createdAt: 'created_at' }}
);



