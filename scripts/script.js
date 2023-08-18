$.layout = {
	
	div_wrapper : 'structure_wrapper',
	div_left : 'structure_main',
	div_left_width : 300,
	div_right : 'structure_secondary',
	div_right_width : '',
	
	window_height : function(){
		return Math.max(
			//$(document).height(),
			$(window).height(),
			/* For opera: */
			document.documentElement.clientHeight
		);
	},
	
	window_width : function(){
		return Math.max(
			//$(document).width(),
			$(window).width(),
			/* For opera: */
			document.documentElement.clientWidth
		);
	},
	
	resize_wrapper : function(){
		var width = $.layout.window_width();
		
		$('.' + $.layout.div_wrapper).css({
			'width' : width
		});
		
		$.layout.resize_main();
		$.layout.resize_secondary();
	},
	
	resize_main : function(){
		var height = $.layout.window_height();
		
		$('.' + $.layout.div_left).css({
			'height' : height,
			'width' : $.layout.div_left_width,
			'float' : 'left'
		});
	},
	
	resize_secondary : function(){
		var height = $.layout.window_height();
		$.layout.div_right_width = $('.' + $.layout.div_wrapper).width() - $.layout.div_left_width;
		
		$('.' + $.layout.div_right).css({
			'height' : height,
			'width' : $.layout.div_right_width,
			'float' : 'left'
		});
	},
	
	resize_audioPlayer : function(){
		$('.audioPlayer_container').css({
			'width' : $.layout.div_right_width - 50
		});
	},
	
	init : function(){
	
		$.layout.resize_wrapper();
		$.layout.resize_audioPlayer();
		
		$(window).resize(function() {
			$.layout.resize_wrapper();
			$.layout.resize_audioPlayer();
		});
	}
	
}

$.secondaryContent = {
	
	last : '',
	which : '',
	next : '',
	
	firstStart : function(){
		$('ul.list_albums > li').first().addClass('active');
		$.secondaryContent.which = $('ul.list_albums > li').first().children('a').attr('href').replace('#', '');
		$.secondaryContent.animateIn();
	},
	
	updateNav : function(el){
		$('ul.list_albums > li').removeClass('active');
		el.parent('li').addClass('active');
	},
	
	animateIn : function(){
		$('#' + $.secondaryContent.which).css({'display' : ''});
		
	},
	
	init : function(){
		$.secondaryContent.firstStart();
		
		$('.content_link').click(function(event){
			event.preventDefault();
			$.secondaryContent.updateNav($(this));
		});
	}
	
}

$.position_verticalCenter = {

	offset : 0,

	run : function(which){
		
		$.getWindowHeight = function(){
			return Math.max(
				//$(document).height(),
				$(window).height(),
				/* For opera: */
				document.documentElement.clientHeight
			);
		};
		
		var windowHeight = $.getWindowHeight();
		
		var elSize = parseFloat($('#' + which).height());
		var calcMargin = parseInt(windowHeight - elSize)/3 + $.position_verticalCenter.offset;
		
		if(calcMargin < 0){
			calcMargin = 0;
		}
		
		if(calcMargin < 0){
			$('#' + which).css({
				"margin-top": 0
			});
		}else{
			$('#' + which).css({
				"margin-top": calcMargin
			});
		}
	},

	init : function(which){
		$.position_verticalCenter.run(which);

		$(window).resize(function() {
			$.position_verticalCenter.run(which);
		});
	}
}

if(Modernizr.audio){
	$.audioPlayer = {
		audio : new Audio(),
		currentTrack : 'audio/02_Beautiful_Love.mp3',	
		//'audio/02BeautifulLove' + Modernizr.audio.mp3 ? '.mp3' : Modernizr.audio.ogg ? '.ogg',
		volume : .75,
		
		doScaleDuration : function(){
			var durationBarWidth = $('.audioPlayer_container').width() - 225;
			$('.duration').css({
				'width' : durationBarWidth
			});
		},
		
		doPositionIndicator : function(newPosition){
			var progress;
			
			if(!newPosition){
				var length = $.audioPlayer.audio.duration;
				var seconds = $.audioPlayer.audio.currentTime;
				progress = (seconds / length) * 100;
			}else{
				progress = newPosition * 100;
			}
			
			$('.duration .indicator').css({
				'width' : progress + '%'
			});
			
			if(length == seconds){
				$.audioPlayer.audio.pause();
				$('.audio_btn_pause').hide();
				$('.audio_btn_play').show();
			}
		},
		
		doPositionBuffered : function(){
			if (($.audioPlayer.audio.buffered != undefined) && ($.audioPlayer.audio.buffered.length != 0)) {
				$($.audioPlayer.audio).bind('progress', function() {
					var loaded = parseInt((($.audioPlayer.audio.buffered.end(0) / $.audioPlayer.audio.duration) * 100), 10);
					$('.buffered').css({width: loaded + '%'});
				});
			}
			/*var length = $.audioPlayer.audio.duration;
			var secs = $.audioPlayer.audio.buffered;
			var progress = (secs / length) * 100;
			console.log($.audioPlayer.audio.buffered);
			$('.buffered').css({
				'width' : progress + '%'
			});*/
		},
		
		doChangeCurrentTime : function(newPosition){
			if(newPosition < $.audioPlayer.audio.currentTime / $.audioPlayer.audio.duration ){
				$.audioPlayer.audio.currentTime = $.audioPlayer.audio.currentTime * newPosition;
			}else{
				$.audioPlayer.audio.currentTime = $.audioPlayer.audio.duration * newPosition;
			}
			$.audioPlayer.doPositionIndicator(newPosition);
			$.audioPlayer.playAudio();
		},
		
		playAudio : function(){
			$.audioPlayer.audio.play();
			$('.audio_btn_play').hide();
			$('.audio_btn_pause').show();
		},
		
		pauseAudio : function(){
			$.audioPlayer.audio.pause();
			$('.audio_btn_pause').hide();
			$('.audio_btn_play').show();
		},
		
		gotoHellFireFox : function(){
			$.audioPlayer.playAudio();
		},
		
		changeTrack : function(which){
			$.audioPlayer.pauseAudio();
			
			$.audioPlayer.audio = new Audio();//Re-instantiate the Audio object for FireFox 3.x
			$.audioPlayer.currentTrack = $(which).attr('href');
			$.audioPlayer.audio.setAttribute('src', $.audioPlayer.currentTrack);
			
			if($.audioPlayer.audio.buffered == undefined){$.audioPlayer.audio.play(); $.audioPlayer.playAudio();};
			
			$.audioPlayer.audio.addEventListener('timeupdate', function(event){
				$.audioPlayer.doPositionIndicator();
				if($.audioPlayer.audio.buffered != undefined){
					$.audioPlayer.doPositionBuffered();
				}
			}, false);
			
			setTimeout('$.audioPlayer.playAudio()', 100);//setTimeout makes it work for FireFox 3.x, I'm not quite sure why actually
		},
		
		init : function(){
			$('.audio_btn_pause').hide(); //Hide pause at start
			$('.audioPlayer_container').css({'display' : ''}); //Display audio player
			$.audioPlayer.doScaleDuration();//Set duration width based on player width
			$('.audioPlayer_container div.volume .slider .indicator').css({'width' : 100 * $.audioPlayer.volume + '%'});//Set volume indicator at specified position
			$.audioPlayer.audio.volume = $.audioPlayer.volume;//Set audio volume to specified position
			$.audioPlayer.audio.setAttribute('src', $.audioPlayer.currentTrack);//Set initial audio track
			
			/*
			Listeners
			*/
			
			$(window).resize(function(event){
				$.audioPlayer.doScaleDuration();
			});
			
			$.audioPlayer.audio.addEventListener('timeupdate', function(event){
				$.audioPlayer.doPositionIndicator();
				if($.audioPlayer.audio.buffered != undefined){
					$.audioPlayer.doPositionBuffered();
				}
			}, false);
			
			/*$.audioPlayer.audio.addEventListener('durationchange', function(event){
				//$.audioPlayer.doPositionBuffered();
				//$.audioPlayer.doScaleBuffered();
			}, false);*/
			
			$('.audio_btn_play').click(function(){
				$.audioPlayer.playAudio();
			});

			$('.audio_btn_pause').click(function(){
				$.audioPlayer.pauseAudio();
			});
			
			$('.a_audioTrack').click(function(event){//Change track that's currently playing
				event.preventDefault();
				$.audioPlayer.changeTrack(this);
			});
			
			$('.audioPlayer_container .duration .buffered').click(function(event){
				var newPosition = event.offsetX / $(this).width();
				$.audioPlayer.doChangeCurrentTime(newPosition);
			});
			
			$('.audioPlayer_container .duration .indicator').click(function(event){
				var newPosition = event.offsetX / $(this).width();
				console.log(newPosition);
				$.audioPlayer.doChangeCurrentTime(newPosition);
			});
			
			$('.audioPlayer_container div.volume .slider').click(function(event){
				volumeWidth = $(this).width();//Get volume slider width

				if(event.offsetX > volumeWidth){//A couple quick checks to make sure it doesn't error
					$.audioPlayer.volume = 1;
				}else if(event.offsetX < 0){
					$.audioPlayer.volume = 0;
				}else{
					$.audioPlayer.volume = event.offsetX / volumeWidth;
				}
				
				$.audioPlayer.audio.volume = $.audioPlayer.volume;//Set volume
				$('.audioPlayer_container div.volume .slider .indicator').css({'width' : 100 * $.audioPlayer.volume + '%'});//Set volume indicator
			});
		}
	}
}

$(document).ready(function(){
	$.layout.init();
	$.position_verticalCenter.init('content_secondary_theJazzTrio');
	if(Modernizr.audio){$.audioPlayer.init();}
});


//.css({'background' : '#ff0000'})
