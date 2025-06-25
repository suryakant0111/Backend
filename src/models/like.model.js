import { Mongoose } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Mongoose.Schema(
  {
    commet: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    video: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    likedBy: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tweet: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
  },
  {
    timestamps: true,
  }
);

likeSchema.plugin(mongooseAggregatePaginate);
export const Like = Mongoose.model("Like", likeSchema);
