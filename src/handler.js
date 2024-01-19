const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const timestamp = new Date().toISOString();

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished: pageCount === readPage,
    reading,
    insertedAt: timestamp,
    updatedAt: timestamp,
  };

  books.push(newBook);

  const isSuccess = books.filter((b) => b.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  let booksList = books;

  if (name) {
    booksList = booksList.filter((v) => v.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (reading) {
    booksList = booksList.filter((v) => {
      if (reading === '1') {
        return v.reading === true;
      }
      if (reading === '0') {
        return v.reading === false;
      }
      return true;
    });
  }

  if (finished) {
    booksList = booksList.filter((v) => {
      if (finished === '1') {
        return v.readPage === v.pageCount;
      }
      if (finished === '0') {
        return v.readPage < v.pageCount;
      }
      return true;
    });
  }

  const response = h.response({
    status: 'success',
    data: {
      books: booksList ? booksList.map((v) => ({
        id: v.id,
        name: v.name,
        publisher: v.publisher,
      })) : [],
    },
  });
  response.code(200);
  return response;
};

const getDetailBook = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((v) => v.id === bookId)[0];

  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const updateBook = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  const index = books.findIndex((v) => v.id === bookId);

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  if (index !== -1) {
    const book = books[index];
    book.name = name;
    book.year = year;
    book.author = author;
    book.summary = summary;
    book.publisher = publisher;
    book.pageCount = pageCount;
    book.readPage = readPage;
    book.reading = reading;
    book.updatedAt = new Date().toISOString();

    books.splice(index, 1, book);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBook = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((v) => v.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler, getAllBooksHandler, getDetailBook, updateBook, deleteBook,
};
