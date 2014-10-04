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
    }

  });

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Register tasks
  grunt.registerTask('default', [ 'connect', 'watch' ]);

};
