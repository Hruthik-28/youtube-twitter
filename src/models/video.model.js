import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: {
                url: String,
                public_id: String,
            },
            required: true,
        },
        thumbnail: {
            type: {
                url: String,
                public_id: String,
            },
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            defaultValue: 0,
        },
        isPublished: {
            type: Boolean,
            defaultValue: false,
        },
    },
    {
        timestamps: true,
    }
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = model("Video", videoSchema);