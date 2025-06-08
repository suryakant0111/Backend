import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema(
    {
        videoFile:{
            type: String, // URL to the video file using Cloudinary or any other service
            required: true,
        },
        thumbnail:{
            type: String, // URL to the thumbnail image using Cloudinary or any other service
            required: true,
        },
        title:{
            type: String, 
            required: true,
        },
        description:{
            type: String, 
            required: true,
        },
        duration:{
            type: Number, // Duration of the video in seconds from cloudinary
            required: true,
        },
        views:{
            type: Number, // Number of views for the video
            default: 0,
        },
        isPublished:{
            type:Boolean,
            default: true, // Whether the video is published or not4
        },
        owner:{
            type:Schema.Types.ObjectId, // Reference to the user who uploaded the video
            ref: 'User', //takes the user from User model
        }


    },{timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);  