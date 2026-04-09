import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryPhoto extends Document {
  image: string;
  imagePublicId: string;
  order: number;
  createdAt: Date;
}

const GalleryPhotoSchema = new Schema<IGalleryPhoto>(
  {
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const GalleryPhoto: Model<IGalleryPhoto> =
  mongoose.models.GalleryPhoto ||
  mongoose.model<IGalleryPhoto>("GalleryPhoto", GalleryPhotoSchema);

export default GalleryPhoto;
