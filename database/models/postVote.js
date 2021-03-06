const User = require('./user');
const Post = require('./post');
const {Sequelize, db} = require('../connection');

/**
 * Set up join table between users and posts.
 */
const PostVoteModel = db.define('postVote', {
  upvote: {
    type: Sequelize.BOOLEAN,
  }
});

let PostVote = {model: PostVoteModel};

/**
 * If a user votes on a post, the two foreign keys are added to the PostVote join table
 * aswell as a boolean indicating if that user upvoted or not. If the user both or neither 
 * voted on a post the join is removed or not stored.
 * 
 * @param {Number} userId - The foreign key identifying the user
 * @param {Number} postId - The foreign key identifying the post
 * @param {Boolean} upvote - Boolean indicating whether the user is upvoting
 * @param {Boolean} downvote - Boolean indicating whether the user is downvoting
 */
PostVote.create = ({userId, postId, upvote = false, downvote = false}) => {
  return User.find({id: userId})
    .then(user => {
      if (!user) { throw new Error('No such user! ' + userId); }
      return Post.find({id: postId});
    })
    .then(post => {
      if (!post) { throw new Error('No such post! ' + postId); }
      return PostVote.find({userId, postId});
    })
    .then(postVote => {
      if (postVote) {
        if (upvote === downvote) {
          return PostVote.model.destroy({where: {userId, postId}});
        } else {
          return PostVote.model.update({upvote: upvote}, {where: {userId, postId}});
        }
      } else {
        // if no post and upvote !== downvote 
        if (upvote !== downvote) {
          //create new post
          return PostVote.model.create({userId, postId, upvote});
        } else {
          return Promise.resolve(undefined); // todo check this return
        }
      }
    });
};

/**
 * Tally the number of votes a post has received and return the tally
 * as a tuple. 
 * 
 * @param {Object} Object - contains a postId as a key.
 * @return {Array} array - Tuple of size two. (upvotes, downvotes)
 */
PostVote.count = ({postId}) => {
  return PostVote.model.findAll({where: {postId}})
    .then(doc => {
      if (!doc) {
        return null;
      }
      let array = [0, 0];
      for (let i = 0; i < doc.length; i++) {
        if (doc[i].upvote) {
          array[0]++;
        } else {
          array[1]++;
        }
      }
      return array;
    });
};

PostVote.read = PostVote.find = (query) => {
  return PostVote.model.findOne({where: query});
};

PostVote.readAll = PostVote.findAll = (query = {}) => {
  return PostVote.model.findAll({where: query});
};

PostVote.update = (query, values) => {
  return PostVote.model.update(values, {where: query});
};

PostVote.delete = ({userId, postId}) => {
  return PostVote.model.destroy({where: {userId, postId}});
};

module.exports = PostVote;
