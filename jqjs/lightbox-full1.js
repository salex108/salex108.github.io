
var Lightbox = {
	fileLoadingImage : "http://www.holysymbols.org.ua/jqjs/loading.gif",
	fileBottomNavCloseImage : 'http://www.holysymbols.org.ua/jqjs/closelabel.gif',
	overlayOpacity : 0.8,
	borderSize : 10,
	imageArray : new Array,
	activeImage : null,
	inprogress : false,
	resizeSpeed : 350,
	destroyElement: function(id){
		if(el = document.getElementById(id)){
			el.parentNode.removeChild(el);
		}
	},
	initialize: function() {	
		$j("a").each(function(){
			if(this.rel.toLowerCase().match('lightbox')){
				$j(this).click(function(){
					Lightbox.start(this);
					return false;
				});
			};
		});
		
		Lightbox.destroyElement('overlay'); Lightbox.destroyElement('lightbox');
		$j("body").append('<div id="overlay"></div><div id="lightbox"><div id="outerImageContainer"><div id="imageContainer"><img id="lightboxImage"><div style="" id="hoverNav"><a href="#" id="prevLink"></a><a href="#" id="nextLink"></a></div><div id="loading"><a href="#" id="loadingLink"><img src="'+Lightbox.fileLoadingImage+'"></a></div></div></div><div id="imageDataContainer"><div id="imageData"><div id="imageDetails"><span id="caption"></span><span id="numberDisplay"></span></div><div id="bottomNav"><a href="#" id="bottomNavClose"><img src="'+Lightbox.fileBottomNavCloseImage+'"></a></div></div></div></div>');
		$j("#overlay").click(function(){ Lightbox.end(); }).hide();
		$j("#lightbox").click(function(){ Lightbox.end();}).hide();
		$j("#loadingLink").click(function(){ Lightbox.end(); return false;});
		$j("#bottomNavClose").click(function(){ Lightbox.end(); return false; });
	},
	
	start: function(imageLink) {	
		$j("select, embed, object").hide();
		
		var arrayPageSize = Lightbox.getPageSize();
		$j("#overlay").hide().css({width: '100%', height: arrayPageSize[1]+'px', opacity : Lightbox.overlayOpacity}).fadeIn();

		Lightbox.imageArray = [];
		imageNum = 0;		

		var anchors = document.getElementsByTagName( imageLink.tagName);
		if((imageLink.rel == 'lightbox')){
			Lightbox.imageArray.push(new Array(imageLink.href, imageLink.title));			
		} else {

			for (var i=0; i<anchors.length; i++){
				var anchor = anchors[i];
				if (anchor.href && (anchor.rel == imageLink.rel)){
					Lightbox.imageArray.push(new Array(anchor.href, anchor.title));
				};
			};

			for(i = 0; i < Lightbox.imageArray.length; i++){
		        for(j = Lightbox.imageArray.length-1; j>i; j--){        
		            if(Lightbox.imageArray[i][0] == Lightbox.imageArray[j][0]){
		                Lightbox.imageArray.splice(j,1);
		            };
		        };
		    };
			while(Lightbox.imageArray[imageNum][0] != imageLink.href) { imageNum++;};
		};

		var arrayPageScroll = Lightbox.getPageScroll();
		var lightboxTop = arrayPageScroll[1] + (arrayPageSize[3] / 10);
		var lightboxLeft = arrayPageScroll[0];
		$j('#lightbox').css({top: lightboxTop+'px', left: lightboxLeft+'px'}).show();
		
		this.changeImage(imageNum);
	},

	changeImage: function(imageNum) {	
		if(this.inprogress == false){
			this.inprogress = true;
			Lightbox.activeImage = imageNum;	

			$j('#loading').show();
			$j('#lightboxImage').hide();
			$j('#hoverNav').hide();
			$j('#prevLink').hide();
			$j('#nextLink').hide();
			$j('#imageDataContainer').hide();
			$j('#numberDisplay').hide();		
		
			imgPreloader = new Image();

			imgPreloader.onload=function(){
				document.getElementById('lightboxImage').src = Lightbox.imageArray[Lightbox.activeImage][0];
				Lightbox.resizeImageContainer(imgPreloader.width, imgPreloader.height);
			};
			imgPreloader.src = Lightbox.imageArray[Lightbox.activeImage][0];
		};
	},

	resizeImageContainer: function( imgWidth, imgHeight) {

		this.widthCurrent = document.getElementById('outerImageContainer').offsetWidth;
		this.heightCurrent = document.getElementById('outerImageContainer').offsetHeight;

		var widthNew = (imgWidth  + (Lightbox.borderSize * 2));
		var heightNew = (imgHeight  + (Lightbox.borderSize * 2));

		this.xScale = ( widthNew / this.widthCurrent) * 100;
		this.yScale = ( heightNew / this.heightCurrent) * 100;

		wDiff = this.widthCurrent - widthNew;
		hDiff = this.heightCurrent - heightNew;

		$j('#outerImageContainer').animate({width: widthNew, height: heightNew},Lightbox.resizeSpeed,'linear',function(){
				Lightbox.showImage();

		});

		if((hDiff == 0) && (wDiff == 0)){
			if (navigator.appVersion.indexOf("MSIE")!=-1){ Lightbox.pause(250); } else { Lightbox.pause(100);}; 
		};

		$j('#prevLink').css({height: imgHeight+'px'});
		$j('#nextLink').css({height: imgHeight+'px'});
		$j('#imageDataContainer').css({width: widthNew+'px'});

		
	},

	showImage: function(){
		$j('#loading').hide();
		$j('#lightboxImage').fadeIn("fast");
		Lightbox.updateDetails();
		this.preloadNeighborImages();
		this.inprogress = false;
	},

	updateDetails: function() {
	$j("#imageDataContainer").hide();
		if(Lightbox.imageArray[Lightbox.activeImage][1]){
			$j('#caption').html(Lightbox.imageArray[Lightbox.activeImage][1]).show();
		};
		
		if(Lightbox.imageArray.length > 1){
			$j('#numberDisplay').html("Image " + eval(Lightbox.activeImage + 1) + " of " + Lightbox.imageArray.length).show();
		};

		$j("#imageDataContainer").hide().slideDown("slow");
		var arrayPageSize = Lightbox.getPageSize();
		$j('#overLay').css({height: arrayPageSize[1]+'px'});
		Lightbox.updateNav();
	},

	updateNav: function() {

		$j('#hoverNav').show();				

		if(Lightbox.activeImage != 0){
			$j('#prevLink').show().click(function(){
				Lightbox.changeImage(Lightbox.activeImage - 1); return false;
			});
		};

		if(Lightbox.activeImage != (Lightbox.imageArray.length - 1)){
			$j('#nextLink').show().click(function(){
				
				Lightbox.changeImage(Lightbox.activeImage +1); return false;
			});
		};
		
		this.enableKeyboardNav();
	},


	enableKeyboardNav: function() {
		document.onkeydown = this.keyboardAction; 
	},

	disableKeyboardNav: function() {
		document.onkeydown = '';
	},

	keyboardAction: function(e) {
		if (e == null) { 
			keycode = event.keyCode;
			escapeKey = 27;
		} else { 
			keycode = e.keyCode;
			escapeKey = e.DOM_VK_ESCAPE;
		};

		key = String.fromCharCode(keycode).toLowerCase();
		
		if((key == 'x') || (key == 'o') || (key == 'c') || (keycode == escapeKey)){	
			Lightbox.end();
		} else if((key == 'p') || (keycode == 37)){	
			if(Lightbox.activeImage != 0){
				Lightbox.disableKeyboardNav();
				Lightbox.changeImage(Lightbox.activeImage - 1);
			};
		} else if((key == 'n') || (keycode == 39)){	
			if(Lightbox.activeImage != (Lightbox.imageArray.length - 1)){
				Lightbox.disableKeyboardNav();
				Lightbox.changeImage(Lightbox.activeImage + 1);
			};
		};

	},

	preloadNeighborImages: function(){

		if((Lightbox.imageArray.length - 1) > Lightbox.activeImage){
			preloadNextImage = new Image();
			preloadNextImage.src = Lightbox.imageArray[Lightbox.activeImage + 1][0];
		}
		if(Lightbox.activeImage > 0){
			preloadPrevImage = new Image();
			preloadPrevImage.src = Lightbox.imageArray[Lightbox.activeImage - 1][0];
		}
	
	},

	end: function() {
		this.disableKeyboardNav();
		$j('#lightbox').hide();
		$j("#overlay").fadeOut();
		$j("select, object, embed").show();
	},
	
	getPageSize : function(){
		var xScroll, yScroll;

		if (window.innerHeight && window.scrollMaxY) {	
			xScroll = window.innerWidth + window.scrollMaxX;
			yScroll = window.innerHeight + window.scrollMaxY;
		} else if (document.body.scrollHeight > document.body.offsetHeight){ 
			xScroll = document.body.scrollWidth;
			yScroll = document.body.scrollHeight;
		} else { 
			xScroll = document.body.offsetWidth;
			yScroll = document.body.offsetHeight;
		}

		var windowWidth, windowHeight;

		if (self.innerHeight) {	
			if(document.documentElement.clientWidth){
				windowWidth = document.documentElement.clientWidth; 
			} else {
				windowWidth = self.innerWidth;
			}
			windowHeight = self.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) { 
			windowWidth = document.documentElement.clientWidth;
			windowHeight = document.documentElement.clientHeight;
		} else if (document.body) {
			windowWidth = document.body.clientWidth;
			windowHeight = document.body.clientHeight;
		}	

		if(yScroll < windowHeight){
			pageHeight = windowHeight;
		} else { 
			pageHeight = yScroll;
		}

		if(xScroll < windowWidth){	
			pageWidth = xScroll;		
		} else {
			pageWidth = windowWidth;
		}

		arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight); 
		return arrayPageSize;
	},
	getPageScroll : function(){
		
		var xScroll, yScroll;

		if (self.pageYOffset) {
			yScroll = self.pageYOffset;
			xScroll = self.pageXOffset;
		} else if (document.documentElement && document.documentElement.scrollTop){	 
			yScroll = document.documentElement.scrollTop;
			xScroll = document.documentElement.scrollLeft;
		} else if (document.body) {
			yScroll = document.body.scrollTop;
			xScroll = document.body.scrollLeft;	
		};

		arrayPageScroll = new Array(xScroll,yScroll); 
		return arrayPageScroll;
	},
	pause : function(ms){
		var date = new Date();
		curDate = null;
		do{var curDate = new Date();}
		while( curDate - date < ms);
	}
};

$j(document).ready(function(){
	Lightbox.initialize();
});

