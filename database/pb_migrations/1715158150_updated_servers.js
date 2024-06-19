/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    collection.listRule = null;
    collection.viewRule = null;
    collection.createRule = null;
    collection.updateRule = null;
    collection.deleteRule = null;

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    collection.listRule = '';
    collection.viewRule = '';
    collection.createRule = '@request.auth.id != null';
    collection.updateRule = '@request.auth.id != null';
    collection.deleteRule = '@request.auth.id != null';

    return dao.saveCollection(collection);
  }
);
