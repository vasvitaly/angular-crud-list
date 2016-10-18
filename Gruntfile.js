/**
@toc
2. load grunt plugins
3. init
4. setup variables
5. grunt.initConfig
6. register grunt tasks

*/

'use strict';

module.exports = function(grunt) {
  var publicPathRelativeRoot = '';

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-slim');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');

  /**
  Function that wraps everything to allow dynamically setting/changing grunt options and config later by grunt task. This init function is called once immediately (for using the default grunt options, config, and setup) and then may be called again AFTER updating grunt (command line) options.
  @toc 3.
  @method init
  */
  function init(params) {
    /**
    Project configuration.
    @toc 5.
    */
    grunt.initConfig({
      slim: {                              // Task 
        dist: {                            // Target 
          files: [{
            expand: true,
            cwd: 'src/templates/crud-list/slim',
            src: ['{,*/}*.slim'],
            dest: 'src/templates/crud-list',
            ext: '.html'
          },
          {
            expand: true,
            cwd: 'src/templates/pagination',
            src: ['{,*/}*.slim'],
            dest: 'src/templates/pagination',
            ext: '.html'
          }]
        },
        dev: {                             // Another target 
          options: {                       // Target options 
            pretty: true
          },
          files: [{
            expand: true,
            cwd: 'src/templates/crud-list/slim',
            src: ['{,*/}*.slim'],
            dest: 'src/templates/crud-list',
            ext: '.html'
          },
          {
            expand: true,
            cwd: 'src/templates/pagination',
            src: ['{,*/}*.slim'],
            dest: 'src/templates/pagination',
            ext: '.html'
          }]
        }
      },
      ngtemplates:  {
        'vasvitaly.angular-crud-list': {
          cwd:      'src/templates',
          src:      ['crud-list/*.html'],
          dest:     'dist/crud-list-templates.js',
          options:    {
            htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true }
          }
        },
        'vasvitaly.angular-pagination': {
          cwd:      'src/templates',
          src:      ['pagination/*.html'],
          dest:     'dist/pagination-templates.js',
          options:    {
            htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true }
          }
        }
      },
      concat: {
        app: {
          src:    ['src/js/**.js','dist/*templates.js'],
          dest:   'dist/crud-list.js'
        },
        css: {
          src:    'src/css/**.css',
          dest:   'dist/crud-list.css'
        }
      },
      jshint: {
        options: {
          //force:          true,
          globalstrict:   true,
          //sub:            true,
          node: true,
          loopfunc: true,
          browser:        true,
          devel:          true,
          globals: {
            angular:    false,
            $:          false,
            moment:   false,
            Pikaday: false,
            module: false,
            forge: false
          }
        },
        beforeconcat:   {
          options: {
            force:  false,
            ignores: ['**.min.js']
          },
          files: {
            src: ['src/js/**.js']
          }
        },
        //quick version - will not fail entire grunt process if there are lint errors
        beforeconcatQ:   {
          options: {
            force:  true,
            ignores: ['**.min.js']
          },
          files: {
            src: ['src/js/**.js']
          }
        }
      },
      uglify: {
        options: {
          mangle: false
        },
        build: {
          files:  {},
          src:    'dist/crud-list.js',
          dest:   'dist/crud-list.min.js'
        }
      },
      karma: {
        unit: {
          configFile: publicPathRelativeRoot + 'karma.conf.js',
          singleRun: true,
          browsers: ['PhantomJS']
        }
      },
      watch: {
        scripts: {
          files: ['src/js/*.js','src/templates/**/*.slim','src/test/*.js'],
          tasks: ['codeCompileDev', 'karma'],
          options: {
            debounceDelay: 250
          }
        }
      }
    });

    grunt.registerTask('codeCompileDev', [
      'slim:dev',
      'ngtemplates:vasvitaly.angular-crud-list',
      'ngtemplates:vasvitaly.angular-pagination',
      'jshint:beforeconcatQ',
      'concat:app'
    ]);    
    
    grunt.registerTask('codeCompile', [
      'slim:dist',
      'ngtemplates:vasvitaly.angular-crud-list',
      'ngtemplates:vasvitaly.angular-pagination',
      'jshint:beforeconcat',
      'concat:app'
    ]);

    /**
    register/define grunt tasks
    @toc 6.
    */
    // Default task(s).
    grunt.registerTask('default', [
      'codeCompile',
      'concat:css',
      'uglify:build',
      'karma'
    ]);

    
  }
  init({});   //initialize here for defaults (init may be called again later within a task)

};