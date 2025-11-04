

// Generic DB helper functions for Mongoose models
// All functions accept a Mongoose Model (e.g., User) as the first argument.

export async function create(Model, data) {
  return Model.create(data);
}

export async function findOne(Model, query = {}, projection = null, options = {}) {
  return Model.findOne(query, projection, options);
}

export function findOneQuery(Model, query = {}) {
  return Model.findOne(query);
}

export async function findById(Model, id, projection = null, options = {}) {
  return Model.findById(id, projection, options);
}

export async function findAll(Model, query = {}, projection = null, options = {}) {
  // options may include sort, limit, skip
  return Model.find(query, projection, options);
}

export async function updateOne(Model, query, update, options = { new: true }) {
  return Model.findOneAndUpdate(query, update, options);
}

export async function updateMany(Model, filter, update, options = {}) {
  return Model.updateMany(filter, update, options);
}

export async function upsert(Model, query, data, options = { new: true, upsert: true }) {
  return Model.findOneAndUpdate(query, data, options);
}

export async function deleteOne(Model, query) {
  return Model.findOneAndDelete(query);
}

export async function deleteMany(Model, query) {
  return Model.deleteMany(query);
}

export async function count(Model, query = {}) {
  return Model.countDocuments(query);
}

export async function exists(Model, query = {}) {
  return Model.exists(query);
}
