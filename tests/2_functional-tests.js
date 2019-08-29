/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

var chaiHttp = require('chai-http')
var chai = require('chai')
var assert = chai.assert
var server = require('../server')

chai.use(chaiHttp)

suite('Functional Tests', function () {
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  var testBookId
  test('#example Test GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        if (err) console.error(err)
        assert.equal(res.status, 200)
        assert.isArray(res.body, 'response should be an array')
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount')
        assert.property(res.body[0], 'title', 'Books in array should contain title')
        assert.property(res.body[0], '_id', 'Books in array should contain _id')
        done()
      })
  })
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function () {
    suite('POST /api/books with title => create book object/expect book object', function () {
      test('Test POST /api/books with title', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: 'Test Title'
          })
          .end(function (err, res) {
            if (err) console.error(err)
            testBookId = res.body._id
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json', 'Response should be json')
            assert.equal(res.body.title, 'Test Title', 'res.body.issue_title should be "Test Title"')
            done()
          })
      })

      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 400)
            assert.equal(res.type, 'text/html', 'Response should be text')
            assert.equal(res.text, 'missing title', 'Response should be "missing title"')
            done()
          })
      })
    })

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get('/api/books')
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], '_id')
            assert.property(res.body[0], 'title')
            assert.property(res.body[0], 'commentcount')
            done()
          })
      })
    })

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .get('/api/books/5d680abadbba')
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 400)
            assert.equal(res.type, 'text/html', 'Response should be text')
            assert.equal(res.text, 'no book exists', 'Response should be "no book exists"')
            done()
          })
      })

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .get(`/api/books/${testBookId}`)
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json', 'Response should be json')
            assert.equal(res.body.title, 'Test Title', 'res.body.issue_title should be "Test Title"')
            done()
          })
      })
    })

    suite('POST /api/books/[id] => add comment/expect book object with id', function () {
      test('Test POST /api/books/[id] with comment', function (done) {
        chai.request(server)
          .post(`/api/books/${testBookId}`)
          .send({
            comment: 'test comment'
          })
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json', 'Response should be json')
            assert.equal(res.body.title, 'Test Title', 'res.body.issue_title should be "Test Title"')
            assert.equal(res.body.comments[0], 'test comment', 'res.body.comments[0] should be "test comment"')
            done()
          })
      })
    })
  })
})
