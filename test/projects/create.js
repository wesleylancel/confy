var assert = require('assert');

module.exports = function (macro) {
  return {
    'Projects': {
      'Creating them using non-member': {
        topic: function () {
          macro.post('/orgs/confy/projects', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Creating them using member': {
        topic: function () {
          macro.post('/orgs/confy/projects', {}, {user:'vanstee', pass:'password'}, this.callback);
        },
        'should return 401': macro.status(401),
        'should return bad credentials': function (err, res, body) {
          assert.deepEqual(body, {message: 'Bad credentials'});
        }
      },
      'Creating them with missing params': {
        topic: function () {
          macro.post('/orgs/firesize/projects', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(3)
      },
      'Creating them with existing name': {
        topic: function () {
          macro.post('/orgs/confy/projects', {
            name: 'Main', description: 'Main'
          }, {user:'pksunkara', pass:'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1)
      },
      'Creating them': {
        topic: function () {
          macro.post('/orgs/firesize/projects', {
            name: 'Main', description: 'Main web application',
            random: '1e3', org: 'confy'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 201': macro.status(201),
        'should return project': function (err, res, body) {
          assert.equal(body._id, 'orgs/firesize/projects/main');
          assert.equal(body.name, 'Main');
          assert.equal(body.description, 'Main web application');
          assert.equal(body.org, 'firesize');
          assert.equal(body.type, 'project');
        },
        'should not save other keys': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should have access for default team': function (err, res, body) {
          assert.deepEqual(body.teams, ['all']);
        },
        'should not return users': function (err, res, body) {
          assert.isUndefined(body.users);
        },
        'should create project doc and it': macro.doc('orgs/firesize/projects/main', {
          'should have users from "all" team': function (err, body) {
            assert.deepEqual(body.users, {jsmith: 1});
          },
          'should have access for default team': function (err, body) {
            assert.deepEqual(body.teams, {all:true});
          }
        }),
        'should create project config doc and it': macro.doc('orgs/firesize/projects/main/config')
      }
    }
  };
}
