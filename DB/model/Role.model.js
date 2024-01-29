import mongoose, { model, Schema, Types } from "mongoose";

const roleSchema = new Schema({
    title: { type: String, required: true, unique: true, lowercase: true },
    privileges: [{ type: Types.ObjectId, ref: 'Privilege', required: true }],
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
}, {

    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})




const roleModel = mongoose.models.Role || model('Role', roleSchema)
export default roleModel