export class SocialNetworkQueries {
  #cachedUser = null;

  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
  }

  #orderBookTitlesByLikes(potentialLikes) {
    return potentialLikes
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
  }

  async findPotentialLikes(minimalScore) {
    let currentUser;

    try {
      const user = await this.fetchCurrentUser();
      this.#cachedUser = currentUser = user;
    } catch (error) {
      currentUser = this.#cachedUser;
    }

    if (!currentUser) return [];
    if (!currentUser.friends) return [];

    const { friends, likes } = currentUser;

    const currentUserLikes = new Set(likes);
    const friendLikesMap = new Map();

    for (const friend of friends) {
      const friendsLikes = new Set(friend.likes);

      for (const title of [...friendsLikes]) {
        if (!currentUserLikes.has(title)) {
          const friendLikesMapValue = (friendLikesMap.get(title) ?? 0) + 1;
          friendLikesMap.set(title, friendLikesMapValue);
        }
      }
    }

    const potentialLikes = Array.from(friendLikesMap.entries()).filter(
      ([title, count]) =>
        count / friends.length >= minimalScore && !currentUserLikes.has(title)
    );

    const sortedPotentialLikes = this.#orderBookTitlesByLikes(potentialLikes);

    return sortedPotentialLikes;
  }
}
