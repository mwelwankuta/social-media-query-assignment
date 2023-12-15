export class SocialNetworkQueries {
  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
    this.cachedUser = null
  }


  async findPotentialLikes(minimalScore) {
    let currentUser;

    try {
      const user = await this.fetchCurrentUser();

      currentUser = user;
      this.cachedUser = user
    } catch (error) {
      currentUser = this.cachedUser
    }

    if (!currentUser) {
      return [];
    }

    if (!currentUser.friends) return [];

    const { friends, likes } = currentUser;

    const userLikes = new Set(likes);
    const friendLikesMap = new Map();

    for (const friend of friends) {
      const friendsLikes = new Set(friend.likes);
      for (const title of [...friendsLikes]) {
        if (!userLikes.has(title))
          friendLikesMap.set(title, (friendLikesMap.get(title) || 0) + 1);
      }
    }

    const potentialLikes = Array.from(friendLikesMap.entries()).filter(
      ([title, count]) =>
        count / friends.length >= minimalScore && !userLikes.has(title)
    );

    const sortedPotentialLikes = potentialLikes
      .sort(([firstTitle, firstCount], [secondTitle, secondCount]) => {
        if (secondCount !== firstCount) {
          return secondCount - firstCount;
        } else {
          return firstTitle.localeCompare(secondTitle, "en", {
            sensitivity: "base",
          });
        }
      })
      .map(([book]) => book);

    return sortedPotentialLikes;
  }
}
