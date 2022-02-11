const {Notification} = require('../models/notification.model');

const activityTypes = {
  like: "liked your post",
  follow: "started following you",
};

const pushFollowActivityInNotification = async ({
  userIdWhoFollowed,
  otherUserId,
  type,
}) => {
  try {
    if ( userIdWhoFollowed.toString() === otherUserId.toString()){
      return;
    }

    if(type === "follow"){
      const activity = {
        userId: otherUserId,
        activityUserId: userIdWhoFollowed,
        activityTitle: activityTypes[type],
        activityType: "follow",
        likedPost: null,
      };
      const newNotification = new Notification(activity);
      await newNotification.save();

      let notifications = await Notification.find({userId: otherUserId});
      if (notifications.length > 10){
        await notifications[0].remove();
      }
    }
    if (type === "unfollow"){
      const notification = await Notification.findOne({
        userId: otherUserId,
        activityUserId: userIdWhoFollowed,
        likedPost: null,
        activityType: "follow"
      });
      if (notification){
        await notification.remove();
      }
      
    }
  } catch(error){
    console.log(error);
  }
};


module.exports = { pushFollowActivityInNotification };