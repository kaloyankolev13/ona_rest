import { EMAIL_RE, PHONE_RE, validBookingDate } from "../lib/form-validation";
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  notes: string;
  time: string;
  read: boolean;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100, minlength: 2 },
    email: { type: String, required: true, trim: true, maxlength: 254, match: EMAIL_RE },
    phone: { type: String, required: true, trim: true, maxlength: 20, match: PHONE_RE },
    date: { type: String, required: true, validate: { validator: (value: string) => validBookingDate(value), message: "Invalid booking date" } },
    guests: { type: Number, required: true, min: 1, max: 7, validate: Number.isInteger },
    time: { type: String, default: "", validate: (value: string) => !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value) },
    notes: { type: String, default: "", trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
