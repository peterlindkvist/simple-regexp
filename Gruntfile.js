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

  devserver: {
    server: {
      options: {
        base : 'dist'
      }
    }
  },

  watch: {
    js: {
      files: ['src/*.js', 'test/*.js'],
      tasks: ['default', 'devserver'],
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
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-mocha-test');
grunt.loadNpmTasks('grunt-devserver');

grunt.registerTask('default', ['jshint', 'uglify']);
grunt.registerTask('run', ['default', 'test', 'devserver', 'watch']);
grunt.registerTask('test', ['default', 'mochaTest']);

};
