import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

// Define the schema for users
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    position: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: validateGeoJsonCoordinates,
                message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
            }
        }
    },
    profile_pic: {
        type: String,
        required: false,
        default: null
    }
});

// Add validation functions
function validateGeoJsonCoordinates(value) {
    return Array.isArray(value) && 
           value.length >= 2 && 
           value.length <= 3 && 
           isLongitude(value[0]) && 
           isLatitude(value[1]);
}

function isLatitude(value) {
    return value >= -90 && value <= 90;
}

function isLongitude(value) {
    return value >= -180 && value <= 180;
}

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model from the schema and export it
export default mongoose.model('User', userSchema);
