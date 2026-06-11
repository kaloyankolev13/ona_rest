import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEventBooking extends Document {
  event: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const EventBookingSchema = new Schema<IEventBooking>(
  {
    event: { type: String, required: true, default: "synhrona" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const EventBooking: Model<IEventBooking> =
  mongoose.models.EventBooking ||
  mongoose.model<IEventBooking>("EventBooking", EventBookingSchema);

export default EventBooking;
