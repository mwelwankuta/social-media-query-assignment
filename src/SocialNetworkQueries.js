export class SocialNetworkQueries {
  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
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
    const likesHashMap = {}

    for(const friend of friendsLikes) {
      for (const like of friend.likes) {
        if(likesHashMap[like] == undefined) {
          likesHashMap[like] = 0
          continue
        }
        likesHashMap[like] += 1
      }

    }

    return Object.keys(likesHashMap).filter(book => likesHashMap[book] >= 1);
  }

  /**
   *
   * @param {Number} minimalScore
   * @returns {Promise<string[]>}
   */
  async findPotentialLikes(minimalScore) {
    const potentialLikes = [];

    let currentUser;

    try {
      const { currentUser: user, error } = await this.initAsyncCurrentUserConstructor();
      currentUser = user;

      if (error) {
        throw new Error(parseErrorValue(error));
      }
    } catch (error) {
      throw new Error(parseErrorValue(error));
    }

    if (!currentUser) {
      return [];
    }
    
    const { friends, likes: currentUserLikes } = currentUser

    // bookInMinimumScore(minimalScore * 100 /** converting minimal score to percentage */)

    const booksUserFriendsLike = this.occurringBooksInFriends(friends)

    let booksFriendsHaveRead = []

    for (const friend of friends) {
      for(const like of currentUserLikes) {
        if(friend.likes.indexOf(like) >= 0 /** like in common */)  {

          const tempBooksFriendsHaveRead = [...friend.likes?.filter(friendLike => friendLike !== like), ...booksFriendsHaveRead]
          booksFriendsHaveRead = tempBooksFriendsHaveRead
        }
      }
    }
 
    console.log("Books read by most friends", booksUserFriendsLike);
    console.log("Books friends have read that i might like ", booksFriendsHaveRead);


    // books that a said percentage of friends have liked
    return [...booksUserFriendsLike,...booksFriendsHaveRead];
  }
}

function parseErrorValue(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return error;
}
