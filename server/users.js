const express = require('express');
const router = express.Router();
const User = require('../database/models/user');
const Member = require('../database/models/member');
const Forum = require('../database/models/forum');
const Post = require('../database/models/post');
const Clan = require('../database/models/clan');
  
/**
 * A get request to the users endpoint returns all users as an array of json
 * objects.
 * 
 * @param  {function} (req, res, next) - Request handler 
 */
router.route('/')
  .get((req, res, next) => {
    User.findAll() 
      .then(doc => {
        res.status(200);
        res.json({results: doc});
        res.end();
      })
      .catch(except => {
        res.status(400);
        res.end(except.message || 'Unable to fetch users!');
      })
      .error(error => {
        res.status(500);
        res.end(error.message || 'Internal error');
      });
  });

/**
 * A get request to the users /members endpoint returns all the user's memberships
 * as an array of json objects. A post with the clanId to the users /members endpoint
 * creates a new membership and returns the new member id as the id property of the 
 * reponse.
 * 
 * @param  {function} (req, res, next) - Request handler 
 */
router.route('/:user/members')
  .get((req, res, next) => {
    Member.findAll({userId: req.params.user})
      .then(doc => {
        res.status(200);
        res.json({results: doc});
        res.end();
      })
      .catch(except => {
        res.status(400);
        res.end(except.message || 'Unable to fetch user\'s memberships!');
      })
      .error(error => {
        res.status(500);
        res.end(error.message || 'Internal error');
      });
  })
  .post((req, res, next) => {
    Member.create(
      req.params.user,
      req.body.clanId,
      false
    )
      .then(({clanId}) => {
        res.status(200);
        res.json({clanId});
        res.end();
      })
      .catch(except => {
        console.error(except);
        res.status(400);
        res.end(except.message || 'Unable to create membership!');
      })
      .error(error => {
        res.status(500);
        res.end(error.message || 'Internal error');
      });
  });

// NEW user clans req handler
router.route('/:user/clans')
  .get((req, res, next) => {
    Member.findAll({
      userId: req.params.user
    })
      .then((members) => {
        console.log('members', members);
        let promises = [];
        let clans = [];
        members.forEach((member) => {
          promises.push(
            Clan.read({
              id: member.clanId
            })
              .then((clanId) => {
                console.log('clans?', clanId);
                if (clans.filter((clanElement) => { return clan.id === clanElement.id; }).length === 0) {
                  clans.push(clanId);
                }
              })
          );
        });
        return Promise.all(promises)
          .then(() => {
            res.json(clans);
          });
      });
  });

/**
 * Read, update, or delete a specific users memberships by sending a get, 
 * post, or delete verb to the user's /members endpoint. On success, post 
 * and delete will return the changed members's id. Users should not be 
 * able to confirm their own membership. 
 * 
 * @todo Posts to the /users/:user/members/:clanId should be authenticated
 *  as a clan admin/mod.
 * 
 * @param  {function} (req, res, next) - Request handler 
 */
router.route('/:user/members/:clanId')
  .get((req, res, next) => {
    Member.read({
      userId: `${req.params.user}`,
      clanId: `${req.params.clanId}`, 
    }) 
      .then(doc => {
        res.status(200);
        res.json({results: doc});
        res.end();
      })
      .catch(except => {
        res.status(400);
        res.end(except.message || 'Unable to fetch users!');
      })
      .error(error => {
        res.status(500);
        res.end(error.message || 'Internal error');
      });
  })
  .post((req, res, next) => {
    console.log('should be the user and clan Ids: ', {
      userId: req.params.user,
      clanId: req.params.clanId
    });
    Member.create(req.params.user,
      req.params.clanId, 
      req.body.confirmed
      )
      .then(doc => {
        res.status(200);
        res.json({id: doc.id});
        res.end();
      })
      .catch(except => {
        res.status(except.status || 400);
        res.end(except.message || 'Unable to update user!');
      })
      .error(error => {
        res.status(500);
        res.end(error.message || 'Internal error');
      });
  })
  .delete((req, res, next) => {
    Member.delete({
      userId: req.params.user,
      clanId: req.params.clanId
    })
      .then(doc => {
        res.status(200);
        res.json({
          userId: req.params.user,
          clanId: req.params.clanId
        });
        res.end();
      })
      .catch(except => {
        res.status(except.status || 400);
        res.end(except.message || 'Unable to delete users!');
      })
      .error(error => {
        res.status(500);
        res.end(error.message || 'Internal error');
      });
  });


/**
 * Read, update, or delete a specific user by sending a get, post, or delete
 * verb to the user's endpoint. On success, post and delete will return 
 * the changed user's id.
 * 
 * @param  {function} (req, res, next) - Request handler 
 */
router.route('/:user')
  .get((req, res, next) => {
    User.read({id: req.params.user}) 
      .then(doc => {
        res.status(200);
        res.json({results: doc});
        res.end();
      })
      .catch(except => {
        res.status(400);
        res.end(except.message || 'Unable to fetch users!');
      })
      .error(error => {
        res.status(500);
        res.end(error.message || 'Internal error');
      });
  })
  .post((req, res, next) => {
    User.update({id: req.params.id}, {
      email: req.body.email,
      password: req.body.password,
    })
      .then(doc => {
        res.status(200);
        res.json({id: doc.id});
        res.end();
      })
      .catch(except => {
        res.status(except.status || 400);
        res.end(except.message || 'Unable to update user!');
      })
      .error(error => {
        res.status(500);
        res.end(error.message || 'Internal error');
      });
  })
  .delete((req, res, next) => {
    User.delete({id: req.params.user})
      .then(doc => {
        res.status(200);
        res.json({id: req.params.user});
        res.end();
      })
      .catch(except => {
        res.status(except.status || 400);
        res.end(except.message || 'Unable to delete users!');
      })
      .error(error => {
        res.status(500);
        res.end(error.message || 'Internal error');
      });
  });

/**
 * Get all forums that the user has posted in
 * 
 * @param  {function} (req, res, next) - Request handler 
 */
router.route('/:user/forums')
  .get((req, res, next) => {
    Post.findAll({
      userId: req.params.user
    })
      .then((posts) => {
        let promises = [];
        let forums = [];
        posts.forEach((post) => {
          promises.push(
            Forum.read({
              id: post.forumId
            })
              .then((forumId) => {
                if (forums.filter((forumElement) => { return forum.id === forumElement.id; }).length === 0) {
                  forums.push(forumId);
                }
              })
          );
        });
        return Promise.all(promises)
          .then(() => {
            res.json(forums);
          });
      });
  });

module.exports = router;