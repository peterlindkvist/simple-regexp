module.exports = function(grunt) {

grunt.initConfig({

  jshint: {
    options: {
      curly: true,
      eqeqeq: true,
      eqnull: true,
      browser: true
    },
    all: ['Gruntfile.js', 'src/*.js', './test/**/*.js']
  },

  develop: {
    server: {
      file: 'app.js',
      env: { 
        NODE_ENV: 'development'
      }  
    }
  },

  watch: {
    js: {
      files: ['app.js', 'src/*.js', 'test/*.js'],
      tasks: ['default', 'develop'],
      options: {
        nospawn: true
      }
    }
  },


  uglify: {
    target: {
      files: {
        'dist/srxp.js': ['src/*.js']
      }
    }
  },


  mochaTest: {
    server: {
      src: ['test/*.js']
    }
  }
});


grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-develop');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-mocha-test');

grunt.registerTask('default', ['jshint', 'uglify']);
grunt.registerTask('start', ['default', 'test', 'develop', 'watch']);
grunt.registerTask('test', ['default', 'mochaTest']);

};
