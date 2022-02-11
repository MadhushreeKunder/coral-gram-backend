const getTimeFormatted = (time) => {
  const totalMinutes = Math.floor((Date.now() - time.getTime()) / (1000 * 60));

  if (totalMinutes <= 1){
    return 'Just now';
  }
  if (totalMinutes < 60){
    return `${totalMinutes} minutes ago`;
  }
  if (totalMinutes >= 60 && totalMinutes < 1440){
    return `${Math.floor(totalMinutes / 60)} hours ago`;
  }
  return time.toDateString();
};


const getPostCleaned = (post, viewerId) => {

  post.__v = undefined;
  post.updatedAt = undefined;
	post._doc.totalLikes = post.likes.length;
	post._doc.likedByViewer = post.likes.includes(viewerId);
	post.likes = undefined;
	post._doc.time = getTimeFormatted(post.createdAt);
	post._doc.createdAt = post.createdAt.getTime();

  return post;
}

module.exports = {getPostCleaned, getTimeFormatted};
