'use strict';

module.exports = function (grunt) {
   var jit = require('jit-grunt')(grunt);

   grunt.initConfig({
      browserify: {
         dist: {
            options: {
               transform: [
                  ['babelify', {
                     loose: 'all'
                  }]
               ]
            },
            files: {
               './dist/scripts/main.js': ['./app/scripts/**.*js']
            }
         }
      },

      sass: {
         dist: {
            files: {
               './dist/styles/main.css': './app/styles/main.scss'
            }
         }
      },

      watch: {
         gruntfile: {
            files: ['./Gruntfile.js']
         },
         scripts: {
            files: ['./app/scripts/**.*js'],
            tasks: ['browserify:dist']
         },
         styles: {
            files: ['./app/styles/**.scss'],
            tasks: ['sass'],
         }
      },

      php: {
          dist: {
              options: {
                  base: './dist',
                  hostname: '0.0.0.0',
                  port: 4130,
                  keepalive: true,
                  open: true
              }
          }
      },

      concurrent: {
          serve: {
              tasks: ['php', 'watch'],
              options: {
                  logConcurrentOutput: true
              }
          }
      }
   });

   grunt.registerTask('default', ['concurrent:serve']);
   grunt.registerTask('build', ['browserify']);
};