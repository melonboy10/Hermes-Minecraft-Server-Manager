/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'eflfvpnd',
        name: 'worldType',
        type: 'select',
        required: true,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['normal', 'large_biomes', 'flat', 'amplified', 'source']
        }
      })
    );

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'eflfvpnd',
        name: 'worldType',
        type: 'select',
        required: true,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['normal', 'large_biomes', 'flat', 'amplified']
        }
      })
    );

    return dao.saveCollection(collection);
  }
);
