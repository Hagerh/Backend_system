import { PostRepository } from '../../domain/post/PostRepository.js';
import { Post } from '../../domain/post/Post.js';

// Entity <-> document mapping stays here, so the domain never sees Mongo's shape.
const toDocument = (post) => ({
  _id: post.id,
  title: post.title,
  content: post.content,
  createdAt: post.createdAt,
});

const toEntity = (doc) =>
  new Post({ id: doc._id, title: doc.title, content: doc.content, createdAt: doc.createdAt });

export class MongoPostRepository extends PostRepository {
  constructor(db) {
    super();
    this.collection = db.collection('posts');
  }

  async init() {
    await this.collection.createIndex({ createdAt: -1 });
  }

  async save(post) {
    await this.collection.replaceOne({ _id: post.id }, toDocument(post), { upsert: true });
  }

  async findById(id) {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? toEntity(doc) : null;
  }

  async findAll() {
    const docs = await this.collection.find().sort({ createdAt: -1 }).toArray();
    return docs.map(toEntity);
  }
}
