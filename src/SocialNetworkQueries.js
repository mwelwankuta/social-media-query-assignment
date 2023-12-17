/**
 * Friend Type
 * @typedef  {Object} Friend
 * @property {string} id
 * @property {number} likes
 */

/**
 * User Type
 * @typedef {Object} User
 * @property {Array<string>} likes
 * @property {Array<Friend>} friends
 */

export class SocialNetworkQueries {
  #cachedUser = null;
  fetchCurrentUser = null;

  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
  }

  /**
   * orders book titles by views and/or
   * @param {Array<string>} potentialLikes
   * @returns {Array<string>}
   */
  #orderBookTitlesByLikes(potentialLikes) {
    const orderedBookTitles = potentialLikes.sort(
      ([currentTitle, currentCount], [nextTitle, nextCount]) => {
        // ordering by number of views
        if (nextCount !== currentCount) {
          return nextCount - currentCount;
        } else {
          // ordering book titles alphabetically
          return currentTitle.localeCompare(nextTitle, "en", {
            sensitivity: "base",
          });
        }
      }
    );

    return orderedBookTitles.map(([book]) => book);
  }

  /**
   * returns a list of most liked book titles from friends
   * @param {Friend} friends
   * @param {Array<string>} currentUserLikes
   * @returns {Array<string>}
   */
  #friendsLikedBookTitles(friends, currentUserLikes) {
    const friendLikesMap = new Map();

    for (const friend of friends) {
      const friendsLikes = new Set(friend.likes);

      for (const bookTitle of [...friendsLikes]) {
        if (currentUserLikes.has(bookTitle)) {
          continue;
        }

        // setting book view counts
        if (!friendLikesMap.get(bookTitle)) {
          friendLikesMap.set(bookTitle, 0);
        }
        friendLikesMap.set(bookTitle, friendLikesMap.get(bookTitle) + 1);
      }
    }

    return [...friendLikesMap.entries()];
  }

  /**
   * @param {Number} minimalScore
   * @returns {Array<string>}
   */
  async findPotentialLikes(minimalScore) {
    /** @type {User | null} */
    let currentUser;

    try {
      const user = await this.fetchCurrentUser();
      this.#cachedUser = currentUser = user;
    } catch (error) {
      currentUser = this.#cachedUser;
    }

    // end execution when invalid data passed
    if (!currentUser) return [];
    if (!currentUser?.friends) return [];

    const { friends, likes } = currentUser;

    const userLikedBookTitles = new Set(likes);
    const friendLikedBookTitles = this.#friendsLikedBookTitles(
      friends,
      userLikedBookTitles
    );

    const potentialLikes = friendLikedBookTitles.filter((book) => {
      const [bookTitle, bookLikes] = book;
      /**
       * is potential like when ratio of likes to number of friends
       * is greater than or equal to the minimalScore
       *  */
      const isBookPotentialLike =
        bookLikes / friends.length >= minimalScore &&
        !userLikedBookTitles.has(bookTitle);

      return isBookPotentialLike;
    });

    return this.#orderBookTitlesByLikes(potentialLikes);
  }
}
