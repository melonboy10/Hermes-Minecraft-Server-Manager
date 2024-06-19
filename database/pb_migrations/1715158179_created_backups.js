/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const collection = new Collection({
      id: 'nv5l62fruznl9gp',
      created: '2024-05-08 08:49:39.114Z',
      updated: '2024-05-08 08:49:39.114Z',
      name: 'backups',
      type: 'base',
      system: false,
      schema: [
        {
          system: false,
          id: '383wwng7',
          name: 'serverID',
          type: 'text',
          required: true,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            pattern: ''
          }
        },
        {
          system: false,
          id: '86hh4jza',
          name: 'name',
          type: 'text',
          required: true,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            pattern: ''
          }
        },
        {
          system: false,
          id: '8bpwbkct',
          name: 'file',
          type: 'file',
          required: true,
          presentable: false,
          unique: false,
          options: {
            mimeTypes: ['application/zip'],
            thumbs: [],
            maxSelect: 1,
            maxSize: 524288000,
            protected: false
          }
        },
        {
          system: false,
          id: 'p1reyowp',
          name: 'fileSize',
          type: 'number',
          required: true,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            noDecimal: false
          }
        }
      ],
      indexes: [],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {}
    });

    return Dao(db).saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('nv5l62fruznl9gp');

    return dao.deleteCollection(collection);
  }
);
