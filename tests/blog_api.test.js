// const mongoose = require('mongoose')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('Requesting blogs', () => {
    test('GET /api/bogs', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('Verify count of blogs', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('Verify conent of one blog', async () => {
        const response = await api.get('/api/blogs')
        const titleArr = response.body.map((blog) => blog.title)
        expect(titleArr).toContainEqual(helper.initialBlogs[0].title)
    })
})

test('a blog object has "id" property', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]
    expect(blog.id).toBeDefined()
})

// don't forget to test if wrong content.
describe('Posting blogs', () => {
    test('POST /api/blogs', async () => {
        const newBlog = {
            title: 'test title in test',
            author: 'test author',
            url: '/test/',
            likes: 2,
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length + 1)

        const titleArr = response.body.map((blog) => blog.title)
        expect(titleArr).toContainEqual(newBlog.title)
    })

    test('Post blog that has no likes property', async () => {
        const newBlog = {
            title: 'test no likes',
            author: 'test author',
            url: '/test/',
        }

        const resultedBlog = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        // Can be further testing when we have "/api/blogs/:id"
        expect(resultedBlog.body.likes).toEqual(0)
    })

    test('Post blog with no title and no url (or either really)', async () => {
        const newBlog = {
            author: 'test author',
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)
    })
})

describe('Deletion of blog', () => {
    test('Deletion using a existent correct id', async () => {
        const response = await api.get('/api/blogs')

        await api
            .delete(`/api/blogs/${response.body[0].id}`)
            .expect(204)

        const afterDelete = await api.get('/api/blogs')
        expect(afterDelete.body).toHaveLength(helper.initialBlogs.length - 1)

        const titleArr = afterDelete.body.map((blog) => blog.title)
        expect(titleArr).not.toContain(response.body[0].id)
    })

    test('Deletion using a non-existent correct id', async () => {
        const nonExistentId = await helper.notExistingId()
        await api
            .delete(`/api/blogs/${nonExistentId}`)
            .expect(204)
    })

    test('Deletion using a maforamtted id', async () => {
        await api
            .delete('/api/blogs/123')
            .expect(400)
    })
})

describe('Changing content of a blog (PUT)', () => {
    test('PUT using a existent correct id', async () => {
        const response = await api.get('/api/blogs')

        const changedBlog = {
            author: response.body[0].author,
            title: response.body[0].title,
            url: response.body[0].url,
            likes: response.body[0].likes + 1,
        }

        // Further testing can be done if 'GET /api/blogs/:id` is implemented
        const responseBlog = await api
            .put(`/api/blogs/${response.body[0].id}`)
            .send(changedBlog)
            .expect(200)

        expect(responseBlog.body.likes).toEqual(response.body[0].likes + 1)
    })

    test('PUT with a non-existent correct id', async () => {
        const nonExistentId = await helper.notExistingId()

        await api
            .put(`/api/blogs/${nonExistentId}`)
            .expect(400)
    })

    test('PUT with malforamtted ID', async () => {
        await api
            .put('/api/blogs/123')
            .expect(400)
    })
})

afterAll(() => {
    mongoose.connection.close()
})
