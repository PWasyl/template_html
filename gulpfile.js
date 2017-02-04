
var path = {
    dest: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'dist/',
        js: 'dist/js',
        css: 'dist/css',
        img: 'dist/img',
        fonts: 'dist/fonts'
    },
    app: { //Пути откуда брать исходники
        html: 'app/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        
        img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        
        css_lib_js:'app/css/libs.css', //CSS файл стилей бібліоткек підключених в файлі app/less/partial/libs.less
        css: 'app/css',
        less: [
            'app/less/style.less', //файли стилей less
            'app/less/partial/libs.less'// тут подключаэться  css файл  Magnific Popup
        ],
        smartgrid_dir: 'app/less/partial',
        css_libs:[
            'app/css/libs.min.css',
            'app/css/style.css'//стили для сайта
        ],
        
        js:'app/js/common.js',//файл з скриптами
        lib_js: [
            'app/libs/jquery/dist/jquery.min.js',// Берем jQuery
            'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js'// Берем Magnific Popup
        ],
        js_libs_dist:'app/js/*.js',

        server_dir: 'app/',

        // куда складивать после предварительной сборки
        js_app: 'app/js',
        css_app: 'app/css',

        fonts: 'app/fonts/**/*'

    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'app/**/*.html',
        less: 'app/less/*.less',
        js: 'app/js/**/*.js',
        css: 'app/css/*.css',
        img: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: 'dist'
};



var gulp         = require('gulp'),// Подключаем Gulp
	less         = require('gulp-less'),//Подключаем Less пакет
	gcmq         = require('gulp-group-css-media-queries'),//чтобы одинаковые блоки не дублировались
	browserSync  = require('browser-sync'),// Подключаем Browser Sync
	concat       = require('gulp-concat'),// Подключаем gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglifyjs'),// Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
	smartgrid    = require('smart-grid');


gulp.task('less', function () {// Создаем таск Less

    return gulp.src(path.app.less)// Берем источник
        .pipe(less())// Преобразуем Less в CSS посредством gulp-less
        .pipe(
            autoprefixer(
                [ '> 1%', 'ie 8', 'ie 7'],
                 { cascade: false }
                )
            )// Создаем префиксы
        .pipe(gcmq()) //создаем правильную верстку без повторяющихся блоков
        .pipe(gulp.dest(path.app.css_app))// Выгружаем результата в папку app/css
        .pipe(browserSync.reload({stream: true}));// Обновляем CSS на странице при изменении
});

gulp.task('scripts', function(){// Берем все необходимые библиотеки
	return gulp.src(path.app.lib_js)
		.pipe(concat('libs.min.js'))// Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify())// Сжимаем JS файл
		.pipe(gulp.dest(path.app.js_app));// Выгружаем в папку app/js
});

gulp.task('css-libs',['less'], function(){ //минификация сss
	return gulp.src(path.app.css_lib_js)// Выбираем файл для минификации
	.pipe(cssnano())// Сжимаем
	.pipe(rename({suffix:'.min'}))// Добавляем суффикс .min
	.pipe(gulp.dest(path.app.css_app));// Выгружаем в папку app/css
})

gulp.task('browser-sync', function(){// Создаем таск browser-sync
	browserSync({// Выполняем browserSync
		server: {// Определяем параметры сервера
			baseDir: path.app.server_dir// Директория для сервера - app
		},
		notify: false// Отключаем уведомления
	})
});

gulp.task('clean', function(){
	return del.sync(path.clean);// Удаляем папку dist перед сборкой
});

gulp.task('clear', function (callback) {//очищення кешу
	return cache.clearAll();
})

gulp.task('img', function() {
	return gulp.src(path.app.img) // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest(path.dest.img)); // Выгружаем на продакшен
});


//Зупуск серверу
gulp.task('watch',['browser-sync', 'css-libs', 'scripts'], function(){
	gulp.watch(path.watch.less, ['less']);
	gulp.watch(path.watch.html, browserSync.reload);
	gulp.watch(path.watch.js, browserSync.reload);

});


//Зборка проекту
gulp.task('build',['clean','img','less','scripts'], function(){
	var buildCss = gulp.src(path.app.css_libs)// Переносим библиотеки в продакшен
		.pipe(gulp.dest(path.dest.css));

	var buildFonts = gulp.src(path.app.fonts)// Переносим шрифты в продакшен
		.pipe(gulp.dest(path.dest.fonts));

	var buildJs = gulp.src(path.app.js_libs_dist)// Переносим скрипты в продакшен
		.pipe(gulp.dest(path.dest.js));

	var buildHtml = gulp.src(path.app.html)// Переносим HTML в продакшен
		.pipe(gulp.dest(path.dest.html));
});


// Сборка файлу smart-grid.less
gulp.task('smartgrid', function(){
	var settings = {
    outputStyle: 'less', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: "30px", /* gutter width px || % */
    container: {
        maxWidth: '1200px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            'width': '1100px', /* -> @media (max-width: 1100px) */
            'fields': '30px' /* side fields */
        },
        md: {
            'width': '960px',
            'fields': '15px'
        },
        sm: {
            'width': '780px',
            'fields': '15px'
        },
        xs: {
            'width': '560px',
            'fields': '15px'
        }
        /* 
        We can create any quantity of break points.

        some_name: {
            some_width: 'Npx',
            some_offset: 'N(px|%)'
        }
        */
    	}
	};
	return smartgrid(path.app.smartgrid_dir, settings);
});




