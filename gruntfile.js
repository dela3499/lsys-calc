module.exports = function(grunt) {

  grunt.initConfig({
//    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        files: {
          'all.js': 'coffee/*.coffee'
        }
      }
    },
    watch: {
      files: ['coffee/*.coffee'],
      tasks: ['default']
    }
  });

//  grunt.loadNpmTasks('grunt-contrib-uglify');
//  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  grunt.registerTask('default', ["coffee"]);

};