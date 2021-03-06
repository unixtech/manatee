/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

/*
 *
 *                   _.---.._
 *      _        _.-' \  \    ''-.
 *    .'  '-,_.-'   /  /  /       '''.
 *   (       _                     o  :
 *    '._ .-'  '-._         \  \-  ---]
 *                  '-.___.-')  )..-'
 *                           (_/
 */
var Logger = require('bunyan');
var fs = require('fs');
var byline = require('byline');
var tap = require('tap');
var test = require('tap').test;
var confparser = require('../lib/confParser');
var uuid = require('node-uuid');

var POSTGRESQL_CONF = './etc/postgres.integ.conf';

var POSTGRESQL_CONF_OBJ = {
    listen_addresses: '\'0.0.0.0\'',
    port: '5432',
    max_connections: '20',
    shared_buffers: '1600kB',
    wal_level: 'hot_standby',
    fsync: 'on',
    synchronous_commit: 'on',
    max_wal_senders: '3',
    wal_sender_delay: '5000',
    wal_keep_segments: '10000',
    replication_timeout: '30000',
    synchronous_standby_names: '\'standby, async-standby\'',
    hot_standby: 'on',
    max_standby_archive_delay: '3000',
    max_standby_streaming_delay: '3000',
    wal_receiver_status_interval: '1000',
    hot_standby_feedback: 'off',
    log_min_messages: 'debug5',
    datestyle: '\'iso, mdy\'',
    lc_messages: '\'en_US.UTF-8\'',
    lc_monetary: '\'en_US.UTF-8\'',
    lc_numeric: '\'en_US.UTF-8\'',
    lc_time: '\'en_US.UTF-8\'',
    default_text_search_config: '\'pg_catalog.english\''
};

var POSGRESQL_CONF_STR = [
    'listen_addresses = \'0.0.0.0\'',
    'port = 5432',
    'max_connections = 20',
    'shared_buffers = 1600kB',
    'wal_level = hot_standby',
    'fsync = on',
    'synchronous_commit = on',
    'max_wal_senders = 3',
    'wal_sender_delay = 5000',
    'wal_keep_segments = 10000',
    'replication_timeout = 30000',
    'synchronous_standby_names = \'standby, async-standby\'',
    'hot_standby = on',
    'max_standby_archive_delay = 3000',
    'max_standby_streaming_delay = 3000',
    'wal_receiver_status_interval = 1000',
    'hot_standby_feedback = off',
    'log_min_messages = debug5',
    'datestyle = \'iso, mdy\'',
    'lc_messages = \'en_US.UTF-8\'',
    'lc_monetary = \'en_US.UTF-8\'',
    'lc_numeric = \'en_US.UTF-8\'',
    'lc_time = \'en_US.UTF-8\'',
    'default_text_search_config = \'pg_catalog.english\''
];

exports.read = function (t) {
    confparser.read(POSTGRESQL_CONF, function (err, conf) {
        if (err) {
            t.fail(err);
            t.done();
        }

        t.ok(conf);
        t.done();
    });
};

exports.write = function (t) {
    var path = '/tmp/' + uuid();
    confparser.write(path, POSTGRESQL_CONF_OBJ, function (err) {
        if (err) {
            t.fail(err);
            t.done();
        }
    });

    var stream = fs.createReadStream(path);
    stream = byline.createStream(stream);
    var i = 0;
    stream.on('data', function (line) {
        t.equal(POSGRESQL_CONF_STR[i], line);
        i++;
        if (i == POSGRESQL_CONF_STR.length) {
            t.done();
        }
    });

};

exports.set = function (t) {
    var conf = POSTGRESQL_CONF_OBJ;
    var value = '\'foo, bar\'';
    confparser.set(conf, 'synchronous_standby_names', value);
    t.equal(conf.synchronous_standby_names, value);
    t.done();
};
