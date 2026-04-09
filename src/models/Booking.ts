import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  notes: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    guests: { type: Number, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
