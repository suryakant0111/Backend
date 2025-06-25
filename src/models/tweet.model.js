import { Mongoose } from "mongoose";

const tweetSchema = new Mongoose.Schema(
  {
    owner: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Tweet = Mongoose.model("Tweet", tweetSchema);
