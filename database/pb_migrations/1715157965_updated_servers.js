/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    // remove
    collection.schema.removeField('d7ac4r9c');

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'd7ac4r9c',
        name: 'serverFilesZipped',
        type: 'file',
        required: false,
        presentable: false,
        unique: false,
        options: {
          mimeTypes: [],
          thumbs: [],
          maxSelect: 1,
          maxSize: 1073741824,
          protected: false
        }
      })
    );

    return dao.saveCollection(collection);
  }
);
