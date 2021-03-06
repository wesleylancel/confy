var assert = require('assert');

module.exports = function (macro) {
  return {
    'Orgs': {
      'Creating them with missing params': {
        topic: function () {
          macro.post('/orgs', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(3)
      },
      'Creating them with existing name': {
        topic: function () {
          macro.post('/orgs', {
            name: 'pksunkara', email: 'pk@sunkara.com'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1)
      },
      'Creating them': {
        topic: function () {
          macro.post('/orgs', {
            name: 'FireSize', email: 'johnsmith@gmail.com',
            random: '123xyz', owner: 'stuff'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 201': macro.status(201),
        'should return org': function (err, res, body) {
          assert.equal(body._id, 'orgs/firesize');
          assert.equal(body.name, 'FireSize');
          assert.equal(body.email, 'johnsmith@gmail.com');
          assert.equal(body.owner, 'jsmith');
          assert.equal(body.type, 'org');
          assert.equal(body.plan, 'none');
        },
        'should not save other keys': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should create org doc and it': macro.doc('orgs/firesize', {
          'should have user as owner': function (err, body) {
            assert.equal(body.owner, 'jsmith');
          },
          'should have user in list of users': function (err, body) {
            assert.deepEqual(body.users, {jsmith: 1});
          },
          'should have default plan empty': function (err, body) {
            assert.equal(body.plan, 'none');
          }
        }),
        'should create default team doc and it': macro.doc('orgs/firesize/teams/all', {
          'should be default for org': function (err, body) {
            assert.equal(body.name, 'All');
            assert.equal(body.type, 'team');
            assert.equal(body.description, 'Has access to all projects');
          },
          'should have user in list of users': function (err, body) {
            assert.deepEqual(body.users, {jsmith: true});
          }
        })
      }
    }
  };
}
