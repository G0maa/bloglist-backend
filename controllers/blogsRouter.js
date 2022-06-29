/* eslint-disable object-curly-newline */
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const { title, author, url, likes } = request.body

    const blog = {
        title,
        author,
        url,
        likes: likes || 0,
    }

    const newBlog = new Blog(blog)
    const resultBlog = await newBlog.save()

    response.status(201).json(resultBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes } = request.body

    const isExist = await Blog.count({ _id: request.params.id })
    if (isExist === 0) {
        response.status(400).json({ error: 'non existent blog' })
        return
    }

    const updatedNote = await Blog.findByIdAndUpdate(
        request.params.id,
        { title, author, url, likes },
        { new: true },
    )
    response.json(updatedNote)
})

module.exports = blogsRouter
