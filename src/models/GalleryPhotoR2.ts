import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IGalleryPhotoR2 extends Document {
  image: string;
  imagePublicId: string;
  order: number;
  sourceId?: Types.ObjectId;
  createdAt: Date;
}

const GalleryPhotoR2Schema = new Schema<IGalleryPhotoR2>(
  {
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    order: { type: Number, default: 0 },
    sourceId: { type: Schema.Types.ObjectId, required: false, index: true },
  },
  { timestamps: true, collection: "galleryphotosr2" }
);

const GalleryPhotoR2: Model<IGalleryPhotoR2> =
  mongoose.models.GalleryPhotoR2 ||
  mongoose.model<IGalleryPhotoR2>("GalleryPhotoR2", GalleryPhotoR2Schema);

export default GalleryPhotoR2;
