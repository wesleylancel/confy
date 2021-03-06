module.exports = function (app, db) {

  // Retrieve an user
  app.get('/user', app.auth.user, function (req, res, next) {
    app.utils.shield(req.user, ['password', '_rev']);
    res.json(req.user);
  });
};
