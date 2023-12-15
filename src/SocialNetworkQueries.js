export class SocialNetworkQueries {
  currentUser = null;

  constructor({ fetchCurrentUser }) {
    this.currentUser = null;
    this.fetchCurrentUser = fetchCurrentUser;

    const currentUserPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await this.initAsyncCurrentUserConstructor();

        if (response?.currentUser) {
          resolve(response.currentUser);
        }
      } catch (error) {
        reject(parseErrorValue(error));
      }
    });

    currentUserPromise
      .then((currentUser) => {
        this.currentUser = currentUser;
        console.log(currentUser, "CURRENT USER");
      })
      .catch((err) => {
        throw new Error(parseErrorValue(err));
      });
  }

  async initAsyncCurrentUserConstructor() {
    try {
      return { currentUser: await this.fetchCurrentUser() };
    } catch (error) {
      return { error: parseErrorValue(error) };
    }
  }

  /**
   *
   * @param {Number} minimalScore
   * @returns {Promise<string[]>}
   */
  findPotentialLikes(minimalScore) {
    if (!this?.currentUser) return;

    const numberOfFriends = this.currentUser?.friends.length;
    const booksFriendsLiked = this.currentUser?.friends?.map(
      (friend) => friend.likes
    );

    console.log("Number of friends:", numberOfFriends);
    console.log("Books liked by friends:", booksFriendsLiked);
  }
}

function parseErrorValue(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return error;
}
