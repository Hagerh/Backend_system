// The contract the domain needs from any storage.
// Implementations (in-memory, MongoDB, ...) live in other layers.
export class PostRepository {
  async save(post) {
    throw new Error('PostRepository.save not implemented');
  }

  async findById(id) {
    throw new Error('PostRepository.findById not implemented');
  }

  async findAll() {
    throw new Error('PostRepository.findAll not implemented');
  }
}
