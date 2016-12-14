const User = mongoose.model('User', {
  name: { type: String, required: true },
  avatarUrl: String
});

const Follow = mongoose.model('Follow', {
  followerId: String,
  followingId: String
});

const Tweet = mongoose.model('Tweet', {
  text: String,
  timestamp: Date,
  userId: String
});
