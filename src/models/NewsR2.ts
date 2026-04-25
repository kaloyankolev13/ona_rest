import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INewsR2 extends Document {
  title: { bg: string; en: string };
  excerpt: { bg: string; en: string };
  content: { bg: string; en: string };
  image: string;
  imagePublicId: string;
  published: boolean;
  sourceId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LocalizedField = new Schema(
  {
    bg: { type: String, required: true },
    en: { type: String, required: true },
  },
  { _id: false }
);

const NewsR2Schema = new Schema<INewsR2>(
  {
    title: { type: LocalizedField, required: true, _id: false },
    excerpt: { type: LocalizedField, required: true, _id: false },
    content: { type: LocalizedField, required: true, _id: false },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    published: { type: Boolean, default: false },
    sourceId: { type: Schema.Types.ObjectId, required: false, index: true },
  },
  { timestamps: true, collection: "newsr2" }
);

const NewsR2: Model<INewsR2> =
  mongoose.models.NewsR2 || mongoose.model<INewsR2>("NewsR2", NewsR2Schema);

export default NewsR2;
