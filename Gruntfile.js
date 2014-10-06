module.exports = function(grunt) {

	modRewrite = require('connect-modrewrite')

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          port: 8765,
          open: true,
          base: ['./app'],
          middleware: function(connect, options) {
            var middlewares;
            middlewares = [];
            middlewares.push(modRewrite(['^[^\\.]*$ /index.html [L]']));
            options.base.forEach(function(base) {
              return middlewares.push(connect["static"](base));
            });
            return middlewares;
          }
        }
      }
    },

    watch: {
    	// why bother to refresh your page?
    	// https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en
      html: { files: 'app/index.html' },
      less: { 
        files: 'app/src/less/*',
        tasks: ['less']
      },
      js: {
        files: ['app/src/js/*', 'app/src/js/models/*', 'app/src/js/collections/*', 'app/src/js/views/*'],
        tasks: ['concat:app']
      },
      options: {
        livereload: true
      },
    },

    // TODO: use require.js already
    concat: {
      options: {
        separator: ';'
      },
      lib: {
        src: [
          'node_modules/jquery/dist/jquery.js',
          'node_modules/underscore/underscore.js',
          'node_modules/backbone/backbone.js'
        ],
        dest: 'app/assets/scripts/lib.js'
      },
      app: {
        src: [
          'app/src/js/models/clock.js',
          'app/src/js/models/sequence.js',
          'app/src/js/models/step.js',
          'app/src/js/collections/steps.js',
          'app/src/js/views/step.js',
          'app/src/js/views/sequence.js',
          'app/src/js/app.js'
        ],
        dest: 'app/assets/scripts/app.js'
      }
    },

    less: {
      compile: {
        options: {
          expand: true,
          flatten: true,
          compress: true,
          strictImports: true,
          yuicompress: true,
          optimization: 2,
          // cwd: 'app/src/less',
          // src: [
            // 'test.less'
          // ],
          // dest: 'app/assets/stylesheets/test',
          // ext: '.css',
          // preExt: '.less',
          // filter: 'isFile',
        },
        files: {
          // target.css file: source.less file
          "app/assets/stylesheets/main.css": "app/src/less/main.less"
        }
      }
    },

  });

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');

	// Register tasks
  grunt.registerTask('default', [ 'connect', 'watch' ]);
  grunt.registerTask('compile', [ 'concat:app'] );
  grunt.registerTask('vendors', [ 'concat:lib'] );

  grunt.event.on('watch', function() {
    console.log('watch fire');
  //   grunt.task.run('less');
  });
};
