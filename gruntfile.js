module.exports = function (grunt) {
  grunt.initConfig({
    run: {
      eval: { 
        cmd: 'coffee',
        args: ['main.coffee']
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
        tasks: ['coffee', 'run:eval']
      }
    }
  });
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
};