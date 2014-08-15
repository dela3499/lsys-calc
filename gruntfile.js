module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      test: {
        src: [
          'coffee/utils.coffee',
          'coffee/lsys.coffee',
          'coffee/test.coffee'],
        dest: 'test.coffee'
      }
    },    
    run: {
      eval: { 
        cmd: 'coffee',
        args: ['test.coffee']
      }
    },
    coffee: {
      compile: {
        options: {
          bare: true
        },
        files: {
          'js/lsys.js': [
            'coffee/utils.coffee',
            'coffee/lsys.coffee'
          ]
        }
      }
    },
    uglify: {
      main: {
        files: {
          'js/lsys.min.js':'js/lsys.js'
        }
      }
    },
    watch: {
      test: {
        files: ['coffee/*.coffee'],
        tasks: ['coffee:compile','uglify:main','concat:test', 'run:eval']
      },
      dev: {
        files: ['coffee/*.coffee'],
        tasks: ['coffee:compile','uglify:main']
      }      
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};