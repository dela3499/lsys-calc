module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      dist: {
        src: [
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
        files: {
          'src/js/main.js': 'src/coffee/*.coffee'
        }
      }
    },
    watch: {
      src: {
        files: ['coffee/*.coffee'],
        tasks: ['concat:dist', 'run:eval']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
};