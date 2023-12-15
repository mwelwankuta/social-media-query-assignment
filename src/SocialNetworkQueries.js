export class SocialNetworkQueries {
  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
    this.fetchCache = [];
  }

  setValue(value) {
    this.currentUser = value;
  }

  async initAsyncCurrentUserConstructor() {
    try {
      return { currentUser: await this.fetchCurrentUser() };
    } catch (error) {
      return { error: parseErrorValue(error) };
    }
  }

  occurringBooksInFriends(friendsLikes) {
    for (const friend of friendsLikes) {
      for (const title of friend.likes) {
        if (this.userLikes.indexOf(title) === -1) {
          const currentCount = this.friendLikesCount.get(title) || 0;
          const updatedCount = currentCount + 1;
          this.friendLikesCount.set(title, updatedCount);
        }
      }
    }
  }

  flattenLikes(friendsLikes) {
    const likesArray = [];

    for (const friend of friendsLikes) {
      for (const like of friend.likes) {
        likesArray.push(like);
      }
    }

    return likesArray;
  }

  calculatePotentialLikes(friends, friendsLikes, minimalScore) {
    const potentialLikes = [];

    this.friendLikesCount.forEach((count, title) => {
      const score = count / friends.length;
      console.log("POTENTIAL LIKE \n \n ", { score, count, title });
      if (score >= minimalScore) {
        potentialLikes.push(title);
      }
    });

    console.log(
      JSON.stringify(
        { friends, friendsLikes, minimalScore, potentialLikes },
        null,
        2
      )
    );

    return potentialLikes;
  }

  /**
   *
   * @param {Number} minimalScore
   * @returns {Promise<string[]>}
   */
  async findPotentialLikes(minimalScore) {
    let currentUser;

    try {
      const { currentUser: user, error } =
        await this.initAsyncCurrentUserConstructor();

      currentUser = user;

      if (error) {
        return [];
      }
    } catch (error) {
      return [];
    }

    if (!currentUser) {
      console.log("could not fetch user");
      return [];
    }

    const { friends, likes: currentUserLikes } = currentUser;

    const userLikes = new Set(currentUserLikes);
    const friendLikesCount = new Map();

    for (const friend of friends) {
      for (const title of friend.likes) {
        if (!userLikes.has(title)) {
          friendLikesCount.set(title, (friendLikesCount.get(title) || 0) + 1);
        }
      }
    }

    const potentialLikes = Array.from(friendLikesCount.entries())
      .filter(
        ([book, count]) =>
          count / friends.length >= minimalScore && !userLikes.has(book)
      )
      .sort(([book1, count1], [book2, count2]) => {
        if (count2 !== count1) {
          return count2 - count1;
        } else {
          return book1.localeCompare(book2, "en", { sensitivity: "base" });
        }
      })
      .map(([book]) => book);

    return potentialLikes;
  }
}

function parseErrorValue(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return error;
}
