class SocialNetworkQueries {
    constructor({ fetchCurrentUser }) {
      this.fetchCurrentUser = fetchCurrentUser;
    }
  
    findPotentialLikes(minimalScore) {
      return new Promise((resolve, reject) => {
        this.fetchCurrentUser()
          .then((userData) => {
            const userLikes = new Set(userData.likes);
            const friendLikesCount = new Map();
  
            userData.friends.forEach((friend) => {
              friend.likes.forEach((book) => {
                if (!userLikes.has(book)) {
                  friendLikesCount.set(book, (friendLikesCount.get(book) || 0) + 1);
                }
              });
            });
  
            const potentialLikes = [];
            friendLikesCount.forEach((count, book) => {
              const score = count / userData.friends.length;
              if (score >= minimalScore) {
                potentialLikes.push(book);
              }
            });
  
            resolve(potentialLikes);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
  }
  
  // Example usage
  const fetchCurrentUser = () => {
    return Promise.resolve({
      likes: ["Moby Dick", "Crime and Punishment"],
      friends: [
        {
          id: "YazL",
          likes: ["Crime and Punishment", "Brave New World"],
        },
        {
          id: "queen9",
          likes: ["Pride and Prejudice", "Crime and Punishment"],
        },
        {
          id: "joyJoy",
          likes: ["Moby-Dick", "Pride and Prejudice"],
        },
        {
          id: "0sin5k1",
          likes: ["Pride and Prejudice", "Brave New World"],
        },
        {
          id: "mariP",
          likes: ["Moby-Dick", "Frankenstein", "Crime and Punishment"],
        },
      ],
    });
  };
  
  const socialNetworkQueries = new SocialNetworkQueries({ fetchCurrentUser });
  socialNetworkQueries.findPotentialLikes(0.3).then((potentialLikes) => {
    console.log(potentialLikes);
  });
  