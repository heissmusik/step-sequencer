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
          'node_modules/jquery/dist/jquery.min.js',
          'node_modules/underscore/underscore-min.js',
          'node_modules/backbone/backbone-min.js'
        ],
        dest: 'app/assets/scripts/lib.js'
      },
      app: {
        src: [
          'app/src/javascript/alert.js'
        ],
        dest: 'app/assets/scripts/alert.js'
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
          "app/assets/stylsheets/test.css": "app/src/less/test.less"
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
  grunt.registerTask('compile', [ 'concat:app', 'less'] );
  grunt.registerTask('vendors', [ 'concat:lib'] );
  // grunt.registerTask('less', [ 'less'] );

};
