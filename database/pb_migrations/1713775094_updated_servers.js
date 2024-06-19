/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'a1jnog8t',
        name: 'startDate',
        type: 'date',
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: '',
          max: ''
        }
      })
    );

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    // remove
    collection.schema.removeField('a1jnog8t');

    return dao.saveCollection(collection);
  }
);
