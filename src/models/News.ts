import mongoose, { Schema, Document, Model } from "mongoose";

export interface INews extends Document {
  title: { bg: string; en: string };
  excerpt: { bg: string; en: string };
  content: { bg: string; en: string };
  image: string;
  imagePublicId: string;
  published: boolean;
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

const NewsSchema = new Schema<INews>(
  {
    title: { type: LocalizedField, required: true, _id: false },
    excerpt: { type: LocalizedField, required: true, _id: false },
    content: { type: LocalizedField, required: true, _id: false },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>("News", NewsSchema);

export default News;
