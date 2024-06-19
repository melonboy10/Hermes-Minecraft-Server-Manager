/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    // remove
    collection.schema.removeField('6y1m6wno');

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'qa18puix',
        name: 'state',
        type: 'select',
        required: true,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['creating', 'running', 'stopped', 'paused']
        }
      })
    );

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'bdis7jag',
        name: 'cloudflareCNAMERecordID',
        type: 'text',
        required: true,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      })
    );

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'prxrqhb8',
        name: 'cloudflareSRVRecordID',
        type: 'text',
        required: true,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'g9gjri9b',
        name: 'title',
        type: 'text',
        required: true,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'mdie3z0i',
        name: 'subdomain',
        type: 'text',
        required: true,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'ndpp525i',
        name: 'serverSoftware',
        type: 'select',
        required: true,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['vanilla', 'fabric', 'paper']
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: '4v5gepuw',
        name: 'gameVersion',
        type: 'text',
        required: true,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      })
    );

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

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'kqdgwutm',
        name: 'timeToLive',
        type: 'select',
        required: true,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['12_hr', '1_day', '7_days']
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'lqrsix0z',
        name: 'serverFilesMissing',
        type: 'bool',
        required: false,
        presentable: false,
        unique: false,
        options: {}
      })
    );

    // update
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
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: [],
          thumbs: [],
          protected: false
        }
      })
    );

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('80olb9b23s3qall');

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: '6y1m6wno',
        name: 'shutdown',
        type: 'bool',
        required: false,
        presentable: false,
        unique: false,
        options: {}
      })
    );

    // remove
    collection.schema.removeField('qa18puix');

    // remove
    collection.schema.removeField('bdis7jag');

    // remove
    collection.schema.removeField('prxrqhb8');

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'g9gjri9b',
        name: 'title',
        type: 'text',
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'mdie3z0i',
        name: 'subdomain',
        type: 'text',
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'ndpp525i',
        name: 'serverSoftware',
        type: 'select',
        required: false,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['vanilla']
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: '4v5gepuw',
        name: 'gameVersion',
        type: 'text',
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'eflfvpnd',
        name: 'worldType',
        type: 'select',
        required: false,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['normal', 'large_biomes', 'flat', 'amplified']
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'kqdgwutm',
        name: 'timeToLive',
        type: 'select',
        required: false,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['12_hr_inactivity', '24_hr_inactivity', '1_day', '7_days']
        }
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'lqrsix0z',
        name: 'serverHasGoneMissing',
        type: 'bool',
        required: false,
        presentable: false,
        unique: false,
        options: {}
      })
    );

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'd7ac4r9c',
        name: 'serverFilesZiped',
        type: 'file',
        required: false,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: [],
          thumbs: [],
          protected: false
        }
      })
    );

    return dao.saveCollection(collection);
  }
);
