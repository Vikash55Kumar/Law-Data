import mongoose from "mongoose";

const DB_NAME = process.env.DB_NAME || "law_database";

export const connectDB = async (): Promise<void> => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`✅ MongoDB connected! DB Hosted on: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("❌ MONGODB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;