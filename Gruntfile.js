module.exports = function(grunt) {
src = 'src';

grunt.initConfig({

 jshint: {
  options: {
    curly: true,
    eqeqeq: true,
    eqnull: true,
    browser: true,
    globals: {
      jQuery: true
    }
  },
    all: ['Gruntfile.js', src + '/*.js', './test/**/*.js']
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
      tasks: ['jshint', 'uglify', 'mochaTest', 'develop'],
      options: {
        nospawn: true
      }
    }
  },


  uglify: {
    options: {
      mangle: false,
      compress : false,
      beautify : true
    },
    target: {
      files: {
        'build/srxp.js': [src + '/*.js']
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
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-mocha-test');

grunt.registerTask('default', ['jshint', 'uglify', 'mochaTest', 'develop', 'watch']);
grunt.registerTask('test', ['jshint', 'mochaTest', 'uglify']);

};
