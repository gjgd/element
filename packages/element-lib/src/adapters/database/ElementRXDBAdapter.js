const RxDB = require('rxdb');

class ElementRXDBAdapter {
  constructor({ name }) {
    this.name = name;
    if (process.browser) {
      RxDB.plugin(require('pouchdb-adapter-idb'));
      this.adapter = 'idb';
    } else {
      RxDB.plugin(require('pouchdb-adapter-leveldb'));
      this.adapter = require('memdown');
    }
  }

  async init() {
    this.db = await RxDB.create({
      name: this.name,
      adapter: this.adapter,
      multiInstance: false,
    });
    this.collection = await this.db.collection({
      name: 'elementcollection',
      schema: {
        version: 0,
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
          anchorFileHash: {
            type: 'string',
          },
          operationHash: {
            type: 'string',
          },
          batchFileHash: {
            type: 'string',
          },
        },
      },
    });
  }

  write(id, data) {
    return this.collection
      .upsert({
        _id: id,
        id,
        ...data,
      })
      .then(doc => doc.toJSON());
  }

  async read(id) {
    return this.collection
      .findOne()
      .where('_id')
      .eq(id)
      .exec()
      .then(doc => doc.toJSON())
      .catch(() => null);
  }

  async readCollection(type) {
    return this.collection
      .find()
      .where('type')
      .eq(type)
      .exec()
      .then(arrayOfDocs => arrayOfDocs.map(doc => doc.toJSON()));
  }

  async deleteDB() {
    return this.collection.remove();
  }

  close() {
    return this;
  }
}

module.exports = ElementRXDBAdapter;
