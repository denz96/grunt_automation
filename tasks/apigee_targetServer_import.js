/*
 * grunt-apigee-kvm
 * https://github.com/grunt-apigee/grunt-apigee-kvm
 *
 * Copyright (c) 2015 dzuluaga
 * Licensed under the Apache-2.0 license.
 */

'use strict';
var request = require('request');
var async = require('async');
var curl = require('curl-cmd');
var apigeeSdk = require('apigee-sdk-mgmt-api');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('apigee_targetServer_import', 'Grunt plugin to import KVMs.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      type: 'env',
    });
    var done = this.async();
    // Iterate over all specified file groups.
    async.eachSeries(this.files,
      function(fileGroup, cb){
        async.eachSeries(fileGroup.src.map(function(filepath){ return {filepath : filepath, options : options};}),
          upsertTargetServer,
          function(error){
            cb(error);
          });
      },
      function(error){
        done(error);
      }
    );
  });

  function upsertTargetServer(filepath, cb2){
    if(filepath.options.type === 'env'){
      apigeeSdk.getTargetServersEnvironment(grunt.config.get("apigee_profiles")[grunt.option('env')],
        function(error, response, body){
          grunt.log.debug(response.statusCode);grunt.log.debug(body);
          upsertTargetServerList(body, filepath, cb2);
        }, grunt.option('curl'));
    }else if(filepath.options.type === 'org'){
      apigeeSdk.getTargetServersOrganization(grunt.config.get("apigee_profiles")[grunt.option('env')],/*{'test' : {url_mgmt : 'https://api.enterprise.apigee.com', org : grunt.option('org'), env : grunt.option('env'), username : grunt.option('username'), password : grunt.option('password')}, env : grunt.option('env')},*/
        function(error, response, body){
          grunt.log.debug(response.statusCode);grunt.log.debug(body);
          upsertTargetServerList(body, filepath, cb2);
        }, grunt.option('curl'));
    }
  }

  function upsertTargetServerList(body, filepath, cb2){//error, response, body){
    /*jshint validthis:true */
    var targetServerImport = grunt.file.readJSON(filepath.filepath);
    var cacheExisting = JSON.parse(body);
    //var kvmIndex =  cacheExisting.indexOf(targetServerImport.name);
    if(cacheExisting.indexOf(targetServerImport.name) !== -1){ //kvm to be imported when it already exists
      updateTargetServer(filepath, cb2);
    }
    else{
      createTargetServer(filepath, cb2);
    }
  }

  function updateTargetServer(filepath, cb2){ /*targetServerImport,*/
      var targetServerImport = grunt.file.readJSON(filepath.filepath);
      if(filepath.options.type === 'env'){
        apigeeSdk.updateTargetServersEnvironment(grunt.config.get("apigee_profiles"),/*{'test' : {url_mgmt : 'https://api.enterprise.apigee.com', org : grunt.option('org'), env : grunt.option('env'), username : grunt.option('username'), password : grunt.option('password')}, env : grunt.option('env')},*/
          targetServerImport,
          function(error, response, body){
            grunt.log.debug(response.statusCode);grunt.log.debug(body);
            cb2(error);
          },
          grunt.option('curl'));
      }else if(filepath.options.type === 'org'){
        apigeeSdk.updateTargetServersOrganization(grunt.config.get("apigee_profiles"),/*{'test' : {url_mgmt : 'https://api.enterprise.apigee.com', org : grunt.option('org'), env : grunt.option('env'), username : grunt.option('username'), password : grunt.option('password')}, env : grunt.option('env')},*/
          targetServerImport,
          function(error, response, body){
            grunt.log.debug(response.statusCode);grunt.log.debug(body);
            cb2(error);
          },
          grunt.option('curl'));
      }
  }

  function createTargetServer(filepath, cb2){
      var uri;
      var targetServerImport = grunt.file.readJSON(filepath.filepath);
      if(filepath.options.type === 'env'){
        //uri = "https://api.enterprise.apigee.com/v1/organizations/" + grunt.option("org") + "/environments/" + grunt.option("env") + "/keyvaluemaps";
        apigeeSdk.createTargetServersEnvironment(grunt.config.get("apigee_profiles"),/*{'test' : {url_mgmt : 'https://api.enterprise.apigee.com', org : grunt.option('org'), env : grunt.option('env'), username : grunt.option('username'), password : grunt.option('password')}, env : grunt.option('env')},*/
          targetServerImport,
          function(error, response, body){
            grunt.log.debug(response.statusCode);grunt.log.debug(body);
            cb2(error);
          },
          grunt.option('curl'));
      }else if(filepath.options.type === 'org'){
        //uri = "https://api.enterprise.apigee.com/v1/organizations/" + grunt.option("org") + "/keyvaluemaps";
        apigeeSdk.createTargetServersOrganization(grunt.config.get("apigee_profiles"),/*{'test' : {url_mgmt : 'https://api.enterprise.apigee.com', org : grunt.option('org'), env : grunt.option('env'), username : grunt.option('username'), password : grunt.option('password')}, env : grunt.option('env')},*/
          targetServerImport,
          function(error, response, body){
            grunt.log.debug(response.statusCode);grunt.log.debug(body);
            cb2(error);
        },
        grunt.option('curl'));
    }
  }
};
