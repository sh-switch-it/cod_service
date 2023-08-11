const Blog = require('../models/Blog');
const faker = require('faker');
function generateFakeBlog(){
    let blog = new Blog();
    blog.id = faker.random.uuid();
    blog.title = faker.lorem.words();
    blog.body = faker.lorem.paragraphs();
    blog.is_repost = false;
    blog.abstraction = faker.lorem.sentences();
    blog.cover = faker.image.imageUrl();
    blog.planned_post_date = "draft";
    blog.user = faker.internet.email();
    blog.planned_post_date = faker.date.recent();
    return blog;
}
function generateFakeBlogs(count){
    let list = [];
    for (let i = 0; i < count; i++) {
        list.push(generateFakeBlog());
        
    }
    return list;
}
module.exports = {
    generateFakeBlog,
    generateFakeBlogs
}