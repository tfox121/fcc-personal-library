/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'

var mongoose = require('mongoose')
const MONGODB_CONNECTION_STRING = process.env.DB
// Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {})

mongoose.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, function (err, db) {
  if (err) {
    console.log('Database error: ' + err)
  } else {
    console.log('Successful database connection')
  }
})

const BookSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'missing title'] },
  comments: [String]
})

const Book = mongoose.model('Book', BookSchema)

// create new book
const createBook = (title) => {
  return new Promise((resolve, reject) => {
    var bookTemp = new Book({
      title: title
    })
    bookTemp.save((err, data) => {
      if (!err) {
        console.log('Creating book')
        resolve(data)
      } else {
        console.log('Book create error')
        reject(err)
      }
    })
  })
}

// return list of all books in database
const listBooks = () => {
  return new Promise((resolve, reject) => {
    Book.find().exec((err, data) => {
      if (err) {
        console.log('Book list error')
        reject(err)
      } else if (data) {
        console.log('Listing books')
        resolve(data)
      } else {
        console.log('no books exist')
      }
    })
  })
}

// return book by id
const findBook = (bookid) => {
  return new Promise((resolve, reject) => {
    Book.findOne({ _id: bookid }).exec((err, data) => {
      if (err) {
        console.log('Book find error')
        reject(err)
      } else if (data) {
        console.log('Finding book')
        resolve(data)
      } else {
        resolve('no book exists')
      }
    })
  })
}

// add comment to book and return book
const addComment = (bookId, comment) => {
  return new Promise((resolve, reject) => {
    Book.findOne({ _id: bookId }, (err, book) => {
      if (!err) {
        console.log('Finding book', book)
        book.comments.push(comment)
        console.log(book)
        book.save((err, data) => {
          if (!err) {
            console.log('Saving book')
            resolve(data)
          } else {
            console.log('Book save error')
            reject(err)
          }
        })
      } else {
        console.log('Book find error')
        reject(err)
      }
    })
  })
}

// delete book by id
const deleteBook = (bookId) => {
  return new Promise((resolve, reject) => {
    if (!bookId) {
      resolve('_id error')
    } else {
      Book.findOne({ _id: bookId }).deleteOne((err, data) => {
        if (!err) {
          console.log('Deleting book')
          resolve('delete successful')
        } else {
          console.log('Book delete error')
          reject(err)
        }
      })
    }
  })
}

// delete all books
const deleteAllBooks = () => {
  return new Promise((resolve, reject) => {
    Book.deleteMany({}, (err, data) => {
      if (!err) {
        console.log('Deleting all books')
        resolve('complete delete successful')
      } else {
        console.log('Book delete error')
        reject(err)
      }
    })
  })
}

module.exports = function (app) {
  app.route('/api/books')
    .get(function (req, res, next) {
      // response will be array of book objects
      // json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      listBooks()
        .then(data => {
          var sendData = []
          data.forEach(book => {
            var bookObj = {
              _id: book._id,
              title: book.title,
              commentcount: book.comments.length
            }
            sendData.push(bookObj)
          })
          res.send(sendData)
        }).catch(err => {
          console.error(err)
          next(err)
        })
    })

    .post(function (req, res, next) {
      // response will contain new book object including atleast _id and title
      var title = req.body.title
      createBook(title)
        .then(data => {
          res.json({
            title: data.title,
            comments: data.comments,
            _id: data._id
          })
        }).catch(err => {
          console.error(err)
          res.status(400).send(err.errors.title.message)
        })
    })

    .delete(function (req, res) {
      // if successful response will be 'complete delete successful'
      deleteAllBooks()
        .then(data => {
          console.log('All books deleted')
          res.send(data)
        }).catch(err => {
          console.error(err)
          res.send('could not delete books')
        })
    })

  app.route('/api/books/:id')
    .get(function (req, res, next) {
      // json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      var bookid = req.params.id
      findBook(bookid)
        .then(data => {
          if (data._id) {
            var bookObj = {
              _id: data._id,
              title: data.title,
              comments: data.comments
            }
            res.send(bookObj)
          } else {
            res.status(400).send(data)
          }
        }).catch(err => {
          console.error(err)
          next(err)
        })
    })

    .post(function (req, res) {
      // json res format same as .get
      var bookid = req.params.id
      var comment = req.body.comment
      addComment(bookid, comment)
        .then(data => {
          res.json({
            _id: data._id,
            title: data.title,
            comments: data.comments
          })
        }).catch(err => {
          console.error(err)
          res.status(400).send(err.errors.title.message)
        })
    })

    .delete(function (req, res) {
      // if successful response will be 'delete successful'
      var bookid = req.params.id
      deleteBook(bookid)
        .then(data => {
          console.log('Deleted')
          res.send(data)
        }).catch(err => {
          console.error(err)
          res.send('could not delete book')
        })
    })
}
