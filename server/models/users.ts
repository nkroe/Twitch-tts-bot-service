import mongoose, { Schema } from 'mongoose';

const User = new Schema(
    { 
        id: String, 
        accessToken: String, 
        refreshToken: String,
        user_id: String,
        login: String,
        display_name: String,
        image: String,
        user_link: String,
        last_signin: String,
        users: Array,
        muteUsers: Array,
        premUsers: Array,
        type: String,
        stats: String,
        volume: String
    }
)

export const Users = mongoose.model('Users', User);
