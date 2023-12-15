export class SocialNetworkQueries {
  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
    this.fetchedUserCache = [];
  }

  loadCurrentUserFromCache() {
    if (this.fetchedUserCache.length)
      return this.fetchCurrentUser[this.fetchCurrentUser.length - 1];

    return null;
  }

  occurringBooksInFriends(friendsLikes) {}
  calculatePotentialLikes(friends, friendsLikes, minimalScore) {}

  /**
   *
   * @param {Number} minimalScore
   * @returns {Promise<string[]>}
   */
  async findPotentialLikes(minimalScore) {
    let currentUser;

    try {
      const user = await this.fetchCurrentUser();

      currentUser = user;
      this.fetchedUserCache.push(user);
    } catch (error) {
      currentUser = this.loadCurrentUserFromCache();
    }

    if (!currentUser) {
      return [];
    }

    const { friends, likes: currentUserLikes } = currentUser;

    const userLikes = new Set(currentUserLikes);
    const friendLikesCount = new Map();

    for (const friend of friends) {
      const friendsLikes = new Set(friend.likes)
      for (const title of [...friendsLikes]) {
        if (!userLikes.has(title)) {
          friendLikesCount.set(title, (friendLikesCount.get(title) || 0) + 1);
        }
      }
    }

    const potentialLikes = Array.from(friendLikesCount.entries()).filter(
      ([title, count]) => count / friends.length >= minimalScore && !userLikes.has(title)
    )

    const sortedPotentialLikes =  potentialLikes.sort(([firstTitle, firstCount], [secondTitle, secondCount]) => {
      if (secondCount !== firstCount) {
        return secondCount - firstCount;
      } else {
        return firstTitle.localeCompare(secondTitle, "en", { sensitivity: "base" });
      }
    })
    .map(([book]) => book);

    return sortedPotentialLikes;
  }
}
