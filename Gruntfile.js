module.exports = function ( grunt ) {
	var name = "<%= pkg.name %>-v<%= pkg.version%>"
	var reports = "reports/<%= pkg.name %>-"

	grunt.initConfig( {
		config: {
			lib: "bower_components/",
			tmp: "tmp/",
			app: {
				root: "app/",
				less: "app/less/",
				img: "app/images/",
				tpl: "app/views/",
				data: "app/data/"
			},
			dist: {
				root: "dist/",
				img: "dist/img/",
				js: "dist/js/"
			}
		},

		pkg: grunt.file.readJSON( "package.json"),

		banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

		// ///////////////////////////////////////////////////////////////// scaffold
		copy: {
			twbs_lib: {
				expand: true,
				flatten: true,
				cwd: "<%= config.lib %>bootstrap/",
				src: [
					"less/*.less", "fonts/*"
				],
				dest: "<%= config.app.root %>"
			}
			jslib: {
				expand: true,
				flatten: true,
				cwd: "<%= config.lib %>",
				src: [
					"trianglify/dist/trianglify.min.js"
				],
				dest: "<%= config.dist.js %>"
			}
		},

		// ///////////////////////////////////////////////////////////////// linting / testing / cleanup
		lesslint: {
			src: "<%= config.app.less %>*.less",
			csslintrc: ".csslintrc",
			options: {
				formatters: [ {
					id: "text",
					dest: reports + "CSSlint.txt"
				} ]
			}
		},

		jsonlint: {
			config: {
				src: [ "config.json", "package.json", "bower.json" ]
			},
			data: {
				src: [ "<%= config.app.data %>*.json", "<%= config.dist.root %>*.json" ]
			}
		},

		// ///////////////////////////////////////////////////////////////// compile
		less: {
			dev: {
				options: {
					cleancss: false
				},
				files: {"<%= config.dist.root %>the1056.css": ["<%= config.app.less %>global.less"] }
			},
			production: {
				options: {
					path: "<%= config.app.less %>",
					compress: true,
					cleancss: true
				},
				files: {"<%= config.dist.root %>the1056.css": ["<%= config.app.less %>global.less"] }
			}
		},

		pug: {
			compile: {
				options: {
					pretty: true,
					data: {
						debug: false
					}
				},
				files: {
					"dist/index.html": ["app/views/index.pug"]
				}
			}
		},

		// ///////////////////////////////////////////////////////////////// minifying
		htmlmin: {
			dist: {
				options: {
					removeComments: false,
					removeAttributeQuotes: false,
					useShortDocType: true,
					collapseWhitespace: true
				},
				expand: true,
				cwd: "<%= config.dist.root %>test/",
				src: "*.html",
				dest: "<%= config.dist.root %>test/"
			}
		},

		// ///////////////////////////////////////////////////////////////// build / deploy / workflow
		bump: {
			options: {
				files: [ "package.json", "bower.json" ],
				updateConfigs: [ ],
				commit: true,
				commitMessage: "Release v%VERSION%",
				commitFiles: [ "package.json", "bower.json" ],
				createTag: true,
				tagName: "%VERSION%",
				tagMessage: "%VERSION%",
				push: true,
				pushTo: "origin",
				gitDescribeOptions: "--tags --always --abbrev=1 --dirty=-d",
				globalReplace: false
			}
		},

		connect: {
			server: {
				options: {
					port: "9001",
					base: "build/",
					protocol: "http",
					hostname: "localhost",
					livereload: true,
					open: {
						target: "http://localhost:9001/index.html", // target url to open
						appName: "Chrome"
					},
				}
			}
		},

		watch: {
			build: {
				files: [
					"Gruntfile.js",
					"<%= config.app.root %>**/*"
				],
				tasks: [ "pug", "less:dev" ],
				options: {
					reload: true,
					livereload: true,
					spawn: true,
					dateFormat: function ( time ) {
						grunt.log.writeln( "The watch finished in " + time + "ms at" + ( new Date( ) ).toString( ) )
					}
				}
			}
		}
	} );

	require( "matchdep" ).filterDev( "grunt-*" ).forEach( grunt.loadNpmTasks )

	// init
	// grunt.registerTask( "devint", [ "concat", "copy", "ngtemplates", "imgprep", "dataprep" ] )

	// Develop
	grunt.registerTask( "default", [ "connect", "watch" ] )

	// Build for Production
	grunt.registerTask( "build", [ "pug", "less:production"] )

	// Deploy
	grunt.registerTask( "deploy", [ "build", "htmlmin" ] )
}