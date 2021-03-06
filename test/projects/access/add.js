var assert = require('assert');

module.exports = function (macro) {
  return {
    'Projects': {
      'Adding team to project with missing params': {
        topic: function () {
          macro.post('/orgs/firesize/projects/main/access', {}, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(2)
      },
      'Adding team to project with non-existent team': {
        topic: function () {
          macro.post('/orgs/firesize/projects/main/access', {
            team: 'engineering'
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1)
      },
      'Adding team to project': {
        topic: function () {
          macro.post('/orgs/confy/projects/main/access', {
            team: 'consultants', random: 'u2e83'
          }, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return the project doc': function (err, res, body) {
          assert.equal(body._id, 'orgs/confy/projects/main');
          assert.equal(body.name, 'Main');
          assert.equal(body.description, 'Main app');
          assert.equal(body.org, 'confy');
          assert.equal(body.type, 'project');
        },
        'should not return random fields': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should return teams array': function (err, res, body) {
          assert.deepEqual(body.teams, ['all', 'engineering', 'consultants']);
        },
        'should not return users': function (err, res, body) {
          assert.isUndefined(body.users);
        },
        'should update the project doc and it': macro.doc('orgs/confy/projects/main', {
          'should have new team in teams list': function (err, body) {
            assert.isTrue(body.teams['consultants']);
          },
          'should increment the count for the user': function (err, body) {
            assert.equal(body.users['vanstee'], 1);
            assert.equal(body.users['whatupdave'], 1);
            assert.equal(body.users['pksunkara'], 3);
          }
        }),
      },
      'Adding already team to project': {
        topic: function () {
          macro.post('/orgs/confy/projects/knowledgebase/access', {
            team: 'consultants', random: 'u2e83'
          }, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return the project doc': function (err, res, body) {
          assert.equal(body._id, 'orgs/confy/projects/knowledgebase');
          assert.equal(body.name, 'KnowledgeBase');
          assert.equal(body.description, 'Wiki & FAQ support');
          assert.equal(body.org, 'confy');
          assert.equal(body.type, 'project');
        },
        'should not update the project doc and it': macro.doc('orgs/confy/projects/knowledgebase', {
          'should not increment the count for the user': function (err, body) {
            assert.equal(body.users['vanstee'], 1);
          }
        })
      },
      'Adding team to project with member': {
        topic: function () {
          macro.post('/orgs/confy/projects/knowledgebase/access', {
            team: 'engineering',
          }, {user: 'vanstee', pass: 'password'}, this.callback);
        },
        'should return 401': macro.status(401),
        'should return bad credentials': function (err, res, body) {
          assert.deepEqual(body, {message: 'Bad credentials'});
        },
        'should not update team doc and it': macro.doc('orgs/confy/projects/knowledgebase', {
          'should have old teams': function (err, body) {
            assert.lengthOf(Object.keys(body.teams), 2);
          }
        })
      },
      'Adding team to project with no access': {
        topic: function () {
          macro.post('/orgs/confy/projects/knowledgebase/access', {
            team: 'engineering',
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        },
        'should not update team doc and it': macro.doc('orgs/confy/projects/knowledgebase', {
          'should have old teams': function (err, body) {
            assert.lengthOf(Object.keys(body.teams), 2);
          }
        })
      }
    }
  };
}
